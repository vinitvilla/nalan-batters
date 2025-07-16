import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/firebase-admin";

export async function GET() {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return Response.json({ error: "No token" }, { status: 401 });

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Fetch user and addresses
  const user = await prisma.user.findFirst({
    where: { 
      phone: decoded.phone_number,
      isDelete: false 
    },
    include: {
      addresses: {
        where: { isDeleted: false },
      },
      defaultAddress: {
        where: { isDeleted: false },
      },
      cart: {
        include: {
          items: {
            include: {
              product: true,
            },
            where: {
              product: { isDelete: false }
            }
          },
        },
      },
    },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user });
}
