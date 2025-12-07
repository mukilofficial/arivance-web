"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lead, LeadCard } from "@/components/features/LeadCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { HistorySidebar } from "@/components/features/HistorySidebar";

function ResultsContent() {
    const searchParams = useSearchParams();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const service = searchParams.get("service");
    const location = searchParams.get("location");
    const criteria = searchParams.get("criteria");
    const limit = searchParams.get("limit");

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ service, location, criteria, limit }),
                });
                console.log("Response Status:", res.status);
                const data = await res.json();
                console.log("Response Data:", data);

                if (data.error) {
                    setError(data.error);
                    setLeads([]);
                } else if (data.leads && data.leads.length > 0) {
                    setLeads(data.leads);
                    // Trigger updates
                    window.dispatchEvent(new Event("search-completed"));
                } else {
                    setError("No results found for your criteria.");
                    setLeads([]);
                }
            } catch (error) {
                console.error("Failed to fetch leads", error);
                setError("Failed to connect to the server.");
                setLeads([]);
            } finally {
                setLoading(false);
            }
        };

        if (service && location) {
            fetchLeads();
        }
    }, [service, location, criteria, limit]);

    const handleHistorySelect = (item: any) => {
        if (item.results) {
            setLeads(item.results);
            setError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const isLimitError = error?.toLowerCase().includes("limit") || error?.toLowerCase().includes("credits") || error?.toLowerCase().includes("subscription");

    return (
        <div className="flex min-h-screen bg-[#0f0c29]">
            <HistorySidebar onSelectHistory={handleHistorySelect} />

            <main className="flex-1 p-6 md:p-12 lg:pl-72">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center gap-4">
                        <Link href="/app">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Search Results</h1>
                            <p className="text-white/60">
                                Found potential leads for <span className="text-accent">{service}</span> in <span className="text-accent">{location}</span>
                            </p>
                        </div>
                    </div>

                    {/* Important Notice */}
                    {!loading && !error && leads.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 flex items-start gap-4 shadow-lg shadow-amber-900/20">
                            <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-amber-200 font-bold text-lg mb-1">Important Notice</h3>
                                <p className="text-amber-100/80 text-sm leading-relaxed">
                                    These results are generated in real-time. <strong>Viewing them again later will consume additional credits.</strong> We highly recommend taking a screenshot or exporting your data now to avoid using extra credits.
                                </p>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
                            <p className="text-white/60 animate-pulse">Scanning local directories...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="p-4 rounded-full bg-red-500/10 text-red-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Search Failed</h3>
                            <p className="text-red-300 max-w-md bg-red-950/30 p-4 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                            <div className="flex gap-4">
                                <Button onClick={() => window.location.reload()} variant="secondary">
                                    Try Again
                                </Button>
                                {isLimitError && (
                                    <Link href="/pricing">
                                        <Button className="bg-accent hover:bg-accent/90">
                                            Upgrade Plan
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leads.map((lead, index) => (
                                <LeadCard key={lead.id} lead={lead} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
