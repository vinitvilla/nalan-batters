import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found - Nalan Batters',
  description: 'The page you are looking for could not be found. Return to our homepage to browse fresh South Indian dosa batter and authentic food products.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
          <span className="text-6xl font-bold text-amber-600">404</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            Perhaps you&apos;d like to browse our fresh South Indian dosa batter and authentic food products?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        
        {/* SEO-friendly links */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h2>
          <div className="space-y-2 text-sm">
            <Link href="/" className="block text-amber-600 hover:text-amber-700 hover:underline">
              Fresh Dosa Batter & Food Products
            </Link>
            <Link href="/checkout" className="block text-amber-600 hover:text-amber-700 hover:underline">
              Order Online
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
