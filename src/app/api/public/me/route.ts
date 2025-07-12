import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/firebase-admin";

export async function GET() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return Response.json({ error: "No token" }, { status: 401 });

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch(err) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Fetch user and addresses
  const user = await prisma.user.findUnique({
    where: { phone: decoded.phone_number },
    include: {
      addresses: true,
      defaultAddress: true, 
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user });
}
