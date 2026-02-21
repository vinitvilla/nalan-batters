"use client";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed successfully!</h1>
      <p className="text-gray-600 mb-6">Thank you for your order. We appreciate your business.</p>
      {orderNumber && (
        <div className="mb-6 px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-xl font-mono font-bold text-gray-900">{orderNumber}</p>
          <p className="text-xs text-gray-500 mt-1">Please save this for your records</p>
        </div>
      )}
      <Button
        onClick={() => router.push("/")}
        className="bg-yellow-500 text-white hover:bg-yellow-600 px-6 py-2.5 rounded-lg font-medium"
      >
        Continue Shopping
      </Button>
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
