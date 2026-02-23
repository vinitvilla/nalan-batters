import { Metadata } from 'next';
import SettingsPageClient from "./settings-client";

// Settings is an authenticated user page — no public SEO value, must not be indexed.
export const metadata: Metadata = {
  title: 'Account Settings | Nalan Batters',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
