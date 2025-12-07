import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: string;
    plan: string;
    subscriptionStart: string;
    leadsUsed: number;
    leadsLimit: number;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        // Return the first match
        return querySnapshot.docs[0].data() as User;
    } catch (error) {
        console.error("Error finding user:", error);
        return null;
    }
}

export async function saveUser(user: User): Promise<void> {
    try {
        await setDoc(doc(db, "users", user.id), user);
    } catch (error) {
        console.error("Error saving user:", error);
        throw new Error("Failed to save user");
    }
}
