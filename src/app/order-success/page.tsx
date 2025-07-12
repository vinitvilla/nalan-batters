"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Thank you for your order!</h1>
      <p className="mb-6 text-lg text-gray-700">Your order has been placed successfully. We appreciate your business.</p>
      <Button onClick={() => router.push("/")}>Continue Shopping</Button>
    </div>
  );
}
