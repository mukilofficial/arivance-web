import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { findUserByEmail, saveUser } from "@/lib/db";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { planId } = await req.json();
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);

        if (!plan) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        console.log("Upgrade request for:", session.user.email);
        const user = await findUserByEmail(session.user.email);
        if (!user) {
            console.error("User not found in DB for email:", session.user.email);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update user subscription
        user.plan = plan.id;
        user.leadsLimit = plan.limit;
        user.subscriptionStart = new Date().toISOString();
        // Note: In a real app, we might not reset used leads on upgrade, or we might prorate.
        // For simplicity, we reset usage on plan change as per "30 days strict" requirement implies a new cycle.
        user.leadsUsed = 0;

        await saveUser(user);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
