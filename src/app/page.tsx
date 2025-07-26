import { Metadata } from 'next';
import { generatePageMetadata } from "@/lib/metadata";
import HomePageClient from "./home-client";

export const metadata: Metadata = generatePageMetadata(
  'Fresh South Indian Dosa Batter & Authentic Food Products - Nalan Batters',
  'Order fresh, authentic South Indian dosa batter, idli batter and traditional food products online. Premium quality ingredients, traditional recipes, home delivery available. Taste the authentic flavors of South India.',
  '/'
);

export default function HomePage() {
  return <HomePageClient />;
}