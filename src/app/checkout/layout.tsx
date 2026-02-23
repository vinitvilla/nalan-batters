import { Metadata } from 'next';

// Checkout is a transactional state page — no SEO value, must not be indexed.
export const metadata: Metadata = {
  title: 'Checkout | Nalan Batters',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
