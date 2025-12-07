import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden bg-[#0f172a]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />

        <h1 className="text-7xl md:text-9xl font-display font-bold tracking-tighter text-white glow-text mb-6">
          Arivance
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light tracking-wide mb-10">
          Find your perfect business leads with <span className="text-accent font-medium">AI-powered precision</span>.
        </p>

        <div className="flex gap-4">
          <Link href="/signup">
            <Button className="bg-accent hover:bg-accent/90 text-lg px-8 py-6 rounded-full">
              Get Started
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" className="text-lg px-8 py-6 rounded-full border-white/10 hover:bg-white/5">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-12 text-center">Why Choose Arivance?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Precision Search", desc: "Target specific industries and locations with our advanced AI algorithms." },
              { title: "Verified Data", desc: "Get accurate contact details, ensuring high conversion rates for your campaigns." },
              { title: "Instant Export", desc: "Download your leads instantly in CSV format for seamless CRM integration." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-12">Plans & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { name: "Free", price: "₹0", limit: "10 Leads", color: "border-slate-700" },
              { name: "Pro", price: "₹100", limit: "50 Leads", color: "border-blue-500/50 bg-blue-900/10" },
              { name: "Pro Max", price: "₹350", limit: "100 Leads", color: "border-purple-500/50 bg-purple-900/10" },
              { name: "Ultra Pro Max", price: "₹500", limit: "150 Leads", color: "border-amber-500/50 bg-amber-900/10" },
            ].map((plan) => (
              <div key={plan.name} className={`p-6 rounded-xl border ${plan.color} backdrop-blur-sm flex flex-col`}>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-2xl font-bold text-white mt-2">{plan.price}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                <p className="text-sm text-slate-300 mt-4 mb-6">{plan.limit}</p>
                <Link href="/signup" className="mt-auto">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/10">Choose Plan</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5">
        &copy; {new Date().getFullYear()} Arivance. All rights reserved.
      </footer>
    </main>
  );
}
