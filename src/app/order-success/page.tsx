"use client";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Thank you for your order!</h1>
      {orderNumber && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-lg font-semibold text-green-800 mb-2">Your Order Number:</p>
          <p className="text-2xl font-mono font-bold text-green-900">{orderNumber}</p>
          <p className="text-sm text-green-700 mt-2">Please save this number for your records</p>
        </div>
      )}
      <p className="mb-6 text-lg text-gray-700">Your order has been placed successfully. We appreciate your business.</p>
      <Button onClick={() => router.push("/")}>Continue Shopping</Button>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
