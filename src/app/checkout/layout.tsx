import { Metadata } from 'next';
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata(
  'Checkout - Complete Your Order | Nalan Batters',
  'Complete your order for fresh South Indian dosa batter and traditional food products. Secure checkout with multiple payment options and fast delivery.',
  '/checkout'
);

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}