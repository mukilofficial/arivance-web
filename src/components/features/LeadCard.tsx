import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, User, Globe, AlertTriangle, CheckCircle2, Facebook, Instagram, Linkedin, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export interface Lead {
    id: string;
    businessName: string;
    ownerName?: string;
    location: string;
    website?: string;
    websiteStatus: "missing" | "outdated" | "good";
    rating?: number;
    userRatingsTotal?: number;
    socialPresence: {
        facebook?: boolean;
        instagram?: boolean;
        linkedin?: boolean;
        maps?: boolean;
    };
    matchReason: string;
    confidence: number;
}

export function LeadCard({ lead, index }: { lead: Lead; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="glass-panel rounded-xl p-6 h-full flex flex-col gap-4 hover:border-accent/50 transition-colors group relative overflow-hidden">
                {/* Confidence Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-xs font-bold text-accent">{(lead.confidence * 100).toFixed(0)}% Match</span>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{lead.businessName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{lead.location}</span>
                    </div>
                    {lead.rating && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            <span>{lead.rating} ({lead.userRatingsTotal})</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-white/5">
                        <span className="text-xs text-muted block mb-1">Website</span>
                        {lead.websiteStatus === "missing" ? (
                            <span className="text-sm font-semibold text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Missing
                            </span>
                        ) : lead.websiteStatus === "outdated" ? (
                            <span className="text-sm font-semibold text-yellow-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Outdated
                            </span>
                        ) : (
                            <a href={lead.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-green-400 flex items-center gap-1 hover:underline">
                                <CheckCircle2 className="w-3 h-3" /> Visit
                            </a>
                        )}
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-white/5">
                        <span className="text-xs text-muted block mb-1">Socials</span>
                        <div className="flex gap-2">
                            {lead.socialPresence.maps && <MapPin className="w-4 h-4 text-green-500" />}
                            {lead.socialPresence.facebook && <Facebook className="w-4 h-4 text-blue-500" />}
                            {lead.socialPresence.instagram && <Instagram className="w-4 h-4 text-pink-500" />}
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="text-sm text-white/80 leading-relaxed">
                        <span className="text-primary font-semibold">AI Insight:</span> {lead.matchReason}
                    </p>
                </div>

                <Button className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white border-none">
                    View Full Report <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
}
