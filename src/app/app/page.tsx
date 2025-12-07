"use client";

import { useState } from "react";
import { SearchForm } from "@/components/features/SearchForm";
import { HistorySidebar } from "@/components/features/HistorySidebar";
import { useRouter } from "next/navigation";

export default function AppPage() {
    const router = useRouter();
    const [selectedHistory, setSelectedHistory] = useState<{ service: string; location: string; criteria: string } | null>(null);

    const handleHistorySelect = (item: any) => {
        console.log("Selected history:", item);
        if (item.service || item.location) {
            setSelectedHistory({
                service: item.service || "",
                location: item.location || "",
                criteria: item.criteria || item.service || ""
            });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            <HistorySidebar onSelectHistory={handleHistorySelect} />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden lg:pl-64">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black z-0" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />

                <div className="relative z-10 w-full max-w-5xl text-center space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter text-white glow-text">
                            Search Leads
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light tracking-wide">
                            Enter your criteria below to find verified business contacts.
                        </p>
                    </div>

                    <SearchForm initialValues={selectedHistory} />

                    <div className="pt-8 flex justify-center gap-8 text-sm text-slate-500 font-medium tracking-wider uppercase">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Real-Time Data
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse delay-75" />
                            Verified Leads
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
                            Instant Export
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
