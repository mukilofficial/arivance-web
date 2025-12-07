export const SUBSCRIPTION_PLANS = [
    {
        id: "free",
        name: "Free",
        price: 0,
        limit: 10,
        features: ["10 Leads/Month", "Basic Search", "Email Support"],
        color: "bg-slate-800",
        buttonColor: "bg-slate-700 hover:bg-slate-600"
    },
    {
        id: "pro",
        name: "Pro",
        price: 100,
        limit: 50,
        features: ["50 Leads/Month", "Advanced Search", "Priority Support", "Export to CSV"],
        color: "bg-blue-900/40 border-blue-500/50",
        buttonColor: "bg-blue-600 hover:bg-blue-500",
        popular: true
    },
    {
        id: "pro_max",
        name: "Pro Max",
        price: 350,
        limit: 100,
        features: ["100 Leads/Month", "All Pro Features", "API Access", "Dedicated Manager"],
        color: "bg-purple-900/40 border-purple-500/50",
        buttonColor: "bg-purple-600 hover:bg-purple-500"
    },
    {
        id: "ultra_pro_max",
        name: "Ultra Pro Max",
        price: 500,
        limit: 150,
        features: ["150 Leads/Month", "All Features", "White Labeling", "24/7 Support"],
        color: "bg-amber-900/40 border-amber-500/50",
        buttonColor: "bg-amber-600 hover:bg-amber-500"
    }
];
