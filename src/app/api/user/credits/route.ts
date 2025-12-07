import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { findUserByEmail } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
        plan: user.plan,
        leadsUsed: user.leadsUsed,
        leadsLimit: user.leadsLimit
    });
}
