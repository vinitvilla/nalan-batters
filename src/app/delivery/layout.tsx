import { Metadata } from 'next';

// Delivery portal is an internal driver-only tool — must never be indexed by search engines.
export const metadata: Metadata = {
  title: 'Driver Portal | Nalan Batters',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
