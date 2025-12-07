"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { usePathname } from "next/navigation";

interface HistoryItem {
    id: string;
    query: string;
    service?: string;
    location?: string;
    criteria?: string;
    timestamp: string;
    count: number;
    results: any[];
}

interface HistorySidebarProps {
    onSelectHistory: (item: HistoryItem) => void;
}

export function HistorySidebar({ onSelectHistory }: HistorySidebarProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = () => {
        fetch("/api/user/history", { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setHistory(data);
                }
            })
            .finally(() => setLoading(false));
    };

    const pathname = usePathname();

    useEffect(() => {
        fetchHistory();
        window.addEventListener("search-completed", fetchHistory);
        window.addEventListener("focus", fetchHistory);
        return () => {
            window.removeEventListener("search-completed", fetchHistory);
            window.removeEventListener("focus", fetchHistory);
        };
    }, [pathname]);

    const handleSelect = (item: HistoryItem) => {
        // Handle legacy items that don't have structured data
        if (!item.service && !item.location && item.query) {
            const parts = item.query.split(" in ");
            if (parts.length >= 2) {
                const location = parts.pop() || "";
                const service = parts.join(" in "); // Rejoin the rest
                onSelectHistory({
                    ...item,
                    service,
                    location,
                    criteria: service // Fallback criteria to service
                });
                return;
            }
        }
        onSelectHistory(item);
    };

    return (
        <div className="w-64 bg-slate-900/50 border-r border-white/5 h-screen overflow-y-auto p-4 hidden lg:block fixed left-0 top-16 z-40">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Searches</h3>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {history.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                            <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                                {item.query}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                </span>
                                <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                                    {item.count}
                                </span>
                            </div>
                        </button>
                    ))}

                    {history.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No history yet</p>
                    )}
                </div>
            )}
        </div>
    );
}
