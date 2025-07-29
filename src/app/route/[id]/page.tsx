"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Route as RouteIcon,
  ExternalLink,
  ArrowRight,
  Truck,
  Share
} from 'lucide-react';
import { toast } from 'sonner';

interface RouteStop {
  lat: number;
  lng: number;
  address: string;
}

interface RouteData {
  origin: { lat: number; lng: number };
  stops: RouteStop[];
  segments: number;
  totalTime: number;
  totalDistance: string;
}

export default function RouteSharePage() {
  const params = useParams();
  const router = useRouter();
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoute = async () => {
      if (!params.id) return;
      
      try {
        // Try to decode the route data directly first (for shorter URLs)
        try {
          const decoded = JSON.parse(atob(params.id as string));
          setRouteData(decoded);
          setLoading(false);
          return;
        } catch {
          // If direct decode fails, try API endpoint
          const response = await fetch(`/api/route/${params.id}`);
          if (!response.ok) throw new Error('Route not found');
          
          const data = await response.json();
          if (data.success) {
            setRouteData(data.route);
          } else {
            throw new Error(data.error || 'Failed to load route');
          }
        }
      } catch (err) {
        console.error('Error loading route:', err);
        setError('Could not load route. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [params.id]);

  const openInGoogleMaps = () => {
    if (!routeData) return;

    const { origin, stops } = routeData;
    
    // Create URL with chunks of waypoints to handle Google Maps limits
    const MAX_WAYPOINTS = 8;
    const chunks = [];
    
    for (let i = 0; i < stops.length; i += MAX_WAYPOINTS) {
      const chunk = stops.slice(i, i + MAX_WAYPOINTS);
      chunks.push(chunk);
    }
    
    if (chunks.length === 1) {
      // Single segment route
      const waypoints = stops.slice(0, -1);
      const destination = stops[stops.length - 1];
      
      const waypointStr = waypoints.length > 0 
        ? waypoints.map(stop => `${stop.lat},${stop.lng}`).join('|')
        : '';
      
      const url = waypointStr
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&waypoints=${encodeURIComponent(waypointStr)}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
      
      window.open(url, '_blank');
    } else {
      // Multiple segments - open the first segment and show instructions
      const firstChunk = chunks[0];
      const waypointStr = firstChunk.length > 1 
        ? firstChunk.slice(0, -1).map(stop => `${stop.lat},${stop.lng}`).join('|')
        : '';
      
      const url = waypointStr
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${firstChunk[firstChunk.length - 1].lat},${firstChunk[firstChunk.length - 1].lng}&waypoints=${encodeURIComponent(waypointStr)}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${firstChunk[firstChunk.length - 1].lat},${firstChunk[firstChunk.length - 1].lng}&travelmode=driving`;
      
      window.open(url, '_blank');
      
      if (chunks.length > 1) {
        toast.info(`This route has ${chunks.length} segments. Starting with the first ${firstChunk.length} stops.`);
      }
    }
  };

  const shareRoute = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Delivery Route',
          text: `Delivery route with ${routeData?.stops.length} stops`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Route link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share route');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <MapPin className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Route Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!routeData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Delivery Route</h1>
                <p className="text-sm text-gray-600">{routeData.stops.length} stops</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={shareRoute}>
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Route Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <MapPin className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg font-bold text-gray-900">{routeData.stops.length}</div>
                <div className="text-xs text-gray-600">Stops</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-lg font-bold text-gray-900">{routeData.totalTime}m</div>
                <div className="text-xs text-gray-600">Duration</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <RouteIcon className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-lg font-bold text-gray-900">{routeData.totalDistance}km</div>
                <div className="text-xs text-gray-600">Distance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Button */}
        <Button 
          onClick={openInGoogleMaps} 
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-lg font-semibold"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Start Navigation
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>

        {/* Route Segments Info */}
        {routeData.segments > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RouteIcon className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900">Multi-Segment Route</span>
                <Badge variant="secondary">{routeData.segments} segments</Badge>
              </div>
              <p className="text-xs text-gray-600">
                This route has been optimized into {routeData.segments} segments for efficient delivery. 
                Navigation will start with the first segment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stops List (First 5) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Delivery Stops</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {routeData.stops.slice(0, 5).map((stop, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{stop.address}</p>
                    <p className="text-xs text-gray-500">{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</p>
                  </div>
                </div>
              ))}
              
              {routeData.stops.length > 5 && (
                <div className="flex items-center space-x-3 text-gray-500">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <span className="text-xs">⋯</span>
                  </div>
                  <p className="text-sm">and {routeData.stops.length - 5} more stops</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          Optimized for fastest delivery time
        </div>
      </div>
    </div>
  );
}
