import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reliable way: fetch user by email from DB to get the correct internal ID
    const { findUserByEmail } = await import("@/lib/db");
    const user = await findUserByEmail(session.user.email);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    try {
        const q = query(
            collection(db, "searches"),
            where("userId", "==", userId),
            // Note: Firestore requires an index for compound queries (where + orderBy).
            // If this fails, we might need to create an index in Firebase Console.
            // For now, let's try just filtering by user and sorting in memory if needed, 
            // or just rely on default ordering if possible.
            // Let's stick to simple query first to avoid index issues immediately.
            // orderBy("timestamp", "desc"), 
            // limit(10)
        );

        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort in memory to avoid index requirement for now
        history.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json(history.slice(0, 10)); // Return top 10
    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
