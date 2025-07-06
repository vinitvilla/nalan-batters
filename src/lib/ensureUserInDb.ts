import { userStore } from "@/store/userStore";

/**
 * Ensures the user exists in the backend DB. Returns the userId to use for order placement.
 * Accepts a Firebase user object and returns the backend user id (or uid fallback).
 */
export async function ensureUserInDb(user: any): Promise<string | undefined> {
  if (!user) return undefined;
  let userId = user.uid;
  if (!userId) {
    // If user object exists but no uid, fallback to phone or email as unique key
    const resUser = await fetch("/api/public/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        phone: user.phoneNumber,
        name: user.displayName,
        email: user.email,
      }),
    });
    const dataUser = await resUser.json();
    if (!resUser.ok) throw new Error(dataUser.error || "User creation failed");
    userId = dataUser.user?.id || user.uid;
  }
  return userId;
}
