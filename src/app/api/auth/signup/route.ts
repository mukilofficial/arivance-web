import { NextResponse } from "next/server";
import { findUserByEmail, saveUser } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";



export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (await findUserByEmail(email)) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = {
            id: uuidv4(),
            name,
            email,
            passwordHash,
            createdAt: new Date().toISOString(),
            plan: "free",
            subscriptionStart: new Date().toISOString(),
            leadsUsed: 0,
            leadsLimit: 10
        };

        await saveUser(newUser);

        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
