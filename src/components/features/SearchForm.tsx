"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Search, MapPin, Users, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SearchFormProps {
    initialValues?: {
        service: string;
        location: string;
        criteria: string;
    } | null;
}

export function SearchForm({ initialValues }: SearchFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [credits, setCredits] = useState<{ plan: string; leadsUsed: number; leadsLimit: number } | null>(null);
    const [formData, setFormData] = useState({
        service: "",
        location: "",
        criteria: "",
        limit: 10,
    });

    useEffect(() => {
        if (initialValues) {
            setFormData(prev => ({
                ...prev,
                service: initialValues.service,
                location: initialValues.location,
                criteria: initialValues.criteria
            }));
        }
    }, [initialValues]);

    const fetchCredits = () => {
        fetch("/api/user/credits", { cache: 'no-store' })
            .then((res) => res.json())
            .then(data => {
                if (!data.error) {
                    setCredits(data);
                    // Adjust initial limit if it exceeds remaining credits
                    const remaining = data.leadsLimit - data.leadsUsed;
                    if (remaining < 10 && remaining > 0) {
                        setFormData(prev => ({ ...prev, limit: remaining }));
                    }
                }
            });
    };

    useEffect(() => {
        fetchCredits();

        // Listen for internal updates
        window.addEventListener("search-completed", fetchCredits);

        // Listen for tab focus (in case user upgraded in another tab)
        const onFocus = () => fetchCredits();
        window.addEventListener("focus", onFocus);

        return () => {
            window.removeEventListener("search-completed", fetchCredits);
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Client-side check for credits
        if (credits) {
            const remaining = credits.leadsLimit - credits.leadsUsed;
            if (remaining <= 0) {
                setError("You have used all your credits. Please upgrade to continue.");
                setIsLoading(false);
                return;
            }
            if (formData.limit > remaining) {
                setError(`You only have ${remaining} credits left. Please adjust your limit.`);
                setIsLoading(false);
                return;
            }
        }

        // Construct query params
        const params = new URLSearchParams({
            service: formData.service,
            location: formData.location,
            criteria: formData.criteria,
            limit: formData.limit.toString(),
        });

        router.push(`/results?${params.toString()}`);
    };

    const remainingCredits = credits ? Math.max(0, (credits.leadsLimit || 0) - (credits.leadsUsed || 0)) : 50;
    const isOutOfCredits = Boolean(credits && remainingCredits === 0);
    const isLimitExceeded = Boolean(credits && formData.limit > remainingCredits);

    return (
        <div className="glass-panel w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl border border-white/10 bg-slate-900/40">
            <form onSubmit={handleSubmit} className="space-y-8 text-left">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-200 text-sm">{error}</p>
                            {(isOutOfCredits || isLimitExceeded) && (
                                <Link href="/pricing">
                                    <Button variant="outline" className="mt-3 text-xs h-8 border-red-500/30 hover:bg-red-500/10 text-red-200">
                                        Upgrade Plan
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-accent" />
                        What service do you offer?
                    </label>
                    <Textarea
                        placeholder="e.g. I am a web designer specializing in modern, responsive websites for restaurants..."
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        required
                        disabled={isOutOfCredits}
                        className="min-h-[100px] bg-slate-950/50 border-white/5 focus:border-accent/50 focus:ring-accent/20 text-white placeholder:text-slate-600 resize-none rounded-xl disabled:opacity-50"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-accent" />
                            Target Location
                        </label>
                        <Input
                            placeholder="e.g. T. Nagar, Chennai"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                            disabled={isOutOfCredits}
                            className="bg-slate-950/50 border-white/5 focus:border-accent/50 focus:ring-accent/20 text-white placeholder:text-slate-600 rounded-xl h-12 disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                            <Users className="w-3 h-3 text-accent" />
                            Target Business Type
                        </label>
                        <Input
                            placeholder="e.g. Restaurants, Shops"
                            value={formData.criteria}
                            onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                            required
                            disabled={isOutOfCredits}
                            className="bg-slate-950/50 border-white/5 focus:border-accent/50 focus:ring-accent/20 text-white placeholder:text-slate-600 rounded-xl h-12 disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {isOutOfCredits ? (
                        <Link href="/pricing" className="block w-full">
                            <Button
                                type="button"
                                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 border-0"
                            >
                                Upgrade Plan to Continue
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            type="submit"
                            className="w-full text-lg font-bold tracking-wide py-6 bg-accent hover:bg-accent/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            isLoading={isLoading}
                            disabled={!!error}
                        >
                            <Search className="mr-2 w-5 h-5" /> Find Real Leads
                        </Button>
                    )}

                    {isOutOfCredits && (
                        <p className="text-center text-sm text-slate-400">
                            You have used all your free credits. Upgrade to search more.
                        </p>
                    )}
                </div>

                {!isOutOfCredits && (
                    <div className="flex items-center gap-4 px-2 pt-2">
                        <span className="text-sm text-slate-400 whitespace-nowrap w-24">
                            Results: {formData.limit}
                        </span>
                        <input
                            type="range"
                            min="1"
                            max={remainingCredits}
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                            Max: {remainingCredits}
                        </span>
                    </div>
                )}
            </form>
        </div>
    );
}
