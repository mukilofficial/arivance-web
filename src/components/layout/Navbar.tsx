"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { UserCredits } from "./UserCredits";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
            <Link href="/" className="text-2xl font-display font-bold text-white tracking-tight">
                Arivance
            </Link>

            <div className="flex items-center gap-4">
                {session ? (
                    <>
                        <Link href="/app" className="text-sm text-slate-300 hover:text-white mr-2">
                            Dashboard
                        </Link>
                        <UserCredits />
                        <Button
                            variant="outline"
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-xs h-9 px-4 border-white/10 hover:bg-white/5"
                        >
                            Sign Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-300 hover:text-white">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-accent hover:bg-accent/90 text-xs h-9 px-4">
                                Sign Up
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
