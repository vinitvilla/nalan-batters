import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAuth } from "firebase-admin/auth";

export async function GET() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return Response.json({ error: "No token" }, { status: 401 });

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(token);
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Fetch user and addresses
  const user = await prisma.user.findUnique({
    where: { phone: decoded.phone_number },
    include: {
      addresses: true,
      defaultAddress: true, 
    },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user });
}
