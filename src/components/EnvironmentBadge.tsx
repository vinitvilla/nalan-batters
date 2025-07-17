"use client";

import { Badge } from "@/components/ui/badge";

export default function EnvironmentBadge() {
  const environment = process.env.NEXT_PUBLIC_APP_ENV || 'development';
  
  // For debugging - you can remove this console.log later
  console.log('Environment Badge - NEXT_PUBLIC_APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
  
  if (environment === 'production') {
    return null; // Don't show badge in production
  }

  const getBadgeVariant = () => {
    switch (environment) {
      case 'staging':
        return 'secondary';
      case 'development':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const getBadgeColor = () => {
    switch (environment) {
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getDisplayName = () => {
    switch (environment) {
      case 'staging':
        return 'stage';
      case 'development':
        return 'dev';
      default:
        return environment;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <Badge 
        variant={getBadgeVariant()}
        className={`${getBadgeColor()} font-bold px-2 py-1 text-xs uppercase tracking-wide shadow-lg border rounded`}
      >
        {getDisplayName()}
      </Badge>
    </div>
  );
}
