"use client";

import { SUBSCRIPTION_PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/Button";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (!session) {
            signIn(undefined, { callbackUrl: "/pricing" });
            return;
        }

        setIsLoading(planId);
        try {
            const res = await fetch("/api/subscription/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });

            if (res.ok) {
                alert("Subscription updated successfully!");
                router.push("/app");
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update subscription.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pt-24 px-6 pb-12">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Choose the plan that fits your business needs. Upgrade anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-2xl p-8 border ${plan.popular ? 'border-blue-500 bg-blue-900/10' : 'border-white/10 bg-white/5'} flex flex-col`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                {plan.limit} leads per month
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                    <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={() => handleSubscribe(plan.id)}
                            isLoading={isLoading === plan.id}
                            className={`w-full py-6 ${plan.buttonColor || 'bg-white/10 hover:bg-white/20'}`}
                        >
                            {plan.price === 0 ? "Get Started" : "Subscribe Now"}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
