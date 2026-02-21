import { Metadata } from 'next';
import { generatePageMetadata } from "@/lib/metadata";
import SettingsPageClient from "./settings-client";

export const metadata: Metadata = generatePageMetadata(
  'Account Settings - Nalan Batters',
  'Manage your account settings, profile information, and preferences',
  '/settings'
);

export default function SettingsPage() {
  return <SettingsPageClient />;
}
