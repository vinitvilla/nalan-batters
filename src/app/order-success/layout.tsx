import { Metadata } from 'next';
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata(
  'Order Confirmed - Thank You | Nalan Batters',
  'Your order has been successfully placed! Thank you for choosing Nalan Batters for your authentic South Indian food needs.',
  '/order-success'
);

export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}