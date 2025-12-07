"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function UserCredits() {
    const { data: session } = useSession();
    const [credits, setCredits] = useState<{ plan: string; leadsUsed: number; leadsLimit: number } | null>(null);

    const pathname = usePathname();

    const fetchCredits = () => {
        if (session) {
            fetch("/api/user/credits", { cache: 'no-store' })
                .then((res) => res.json())
                .then((data) => {
                    if (!data.error) setCredits(data);
                });
        }
    };

    useEffect(() => {
        fetchCredits();
        window.addEventListener("search-completed", fetchCredits);
        window.addEventListener("focus", fetchCredits);
        return () => {
            window.removeEventListener("search-completed", fetchCredits);
            window.removeEventListener("focus", fetchCredits);
        };
    }, [session, pathname]);

    if (!credits) return null;

    const remaining = credits.leadsLimit - credits.leadsUsed;

    return (
        <div className="flex flex-col items-end mr-4 text-right hidden md:block">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                {(credits.plan || "Free").replace("_", " ")} Plan
            </div>
            <div className="text-sm font-bold text-accent">
                {remaining} Credits Left
            </div>
        </div>
    );
}
