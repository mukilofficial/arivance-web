import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { findUserByEmail, saveUser } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await findUserByEmail(credentials.email);
                if (!user) return null;

                // If user has no password (e.g. Google sign-in), deny credentials login
                if (!user.passwordHash) return null;

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) return null;

                return { id: user.id, name: user.name, email: user.email };
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const existingUser = await findUserByEmail(user.email!);
                if (!existingUser) {
                    // Create new user from Google profile
                    const newUser = {
                        id: user.id || uuidv4(),
                        name: user.name || "Unknown",
                        email: user.email!,
                        passwordHash: "", // No password for OAuth users
                        createdAt: new Date().toISOString(),
                        plan: "free",
                        subscriptionStart: new Date().toISOString(),
                        leadsUsed: 0,
                        leadsLimit: 10
                    };
                    await saveUser(newUser);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = token.sub;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-change-this",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
