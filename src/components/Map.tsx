"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  TrafficLayer,
} from "@react-google-maps/api";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Clock, Route } from "lucide-react";
import { toast } from "sonner";

interface MapProps {
  origin: google.maps.places.PlaceResult | null;
  destination: google.maps.places.PlaceResult | null;
  waypoints: google.maps.places.PlaceResult[];
}

export default function Map({ origin, destination, waypoints }: MapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Default starting location: Scarborough, ON
  const defaultCenter = { lat: 43.73563254319226, lng: -79.25209544574375 };

  const calculateRoute = () => {
    if (!origin || !destination || !window.google || 
        !origin.geometry?.location || !destination.geometry?.location) return;

    // Create waypoints array including the origin as first waypoint
    const wayPts: google.maps.DirectionsWaypoint[] = [
      { location: origin.geometry.location, stopover: true },
      ...waypoints
        .filter(place => place.geometry?.location)
        .map((place) => ({
          location: place.geometry!.location!,
          stopover: true,
        }))
    ];

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: defaultCenter, // Start from the default location
        destination: destination.geometry.location,
        waypoints: wayPts,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
        avoidHighways: false,
        avoidTolls: false,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);

          const legs = result.routes[0].legs;
          const totalTrafficTime = legs.reduce(
            (acc, leg) =>
              acc + (leg.duration_in_traffic?.value || leg.duration?.value || 0),
            0
          );

          const totalDistanceMeters = legs.reduce(
            (acc, leg) => acc + (leg.distance?.value || 0),
            0
          );

          setTotalTime(Math.round(totalTrafficTime / 60)); // in minutes
          setTotalDistance((totalDistanceMeters / 1000).toFixed(1)); // in km

          // Generate shareable link starting from default location
          const originStr = `${defaultCenter.lat},${defaultCenter.lng}`;
          const destinationStr = destination.formatted_address || 
            `${destination.geometry!.location!.lat()},${destination.geometry!.location!.lng()}`;
          const waypointStr = [
            origin.formatted_address || 
              `${origin.geometry!.location!.lat()},${origin.geometry!.location!.lng()}`,
            ...waypoints
              .filter(wp => wp.geometry?.location)
              .map((wp) => 
                wp.formatted_address || 
                `${wp.geometry!.location!.lat()},${wp.geometry!.location!.lng()}`
              )
          ].join("|");

          const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            originStr
          )}&destination=${encodeURIComponent(
            destinationStr
          )}&waypoints=${encodeURIComponent(waypointStr)}&travelmode=driving`;

          setShareUrl(url);
        } else {
          console.error("Directions request failed:", status);
          toast.error("Failed to calculate route");
        }
      }
    );
  };

  useEffect(() => {
    if (origin && destination && window.google) {
      calculateRoute();
    }
  }, [origin, destination, waypoints]);

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Route link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  // Use the default starting location as center, or origin if available
  const center = origin?.geometry?.location || defaultCenter;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Modern Header with Improved Design */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">

        {/* Main Control Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Trip Information */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {totalTime !== null ? `${totalTime} min` : 'Calculating...'}
                  </div>
                  {totalDistance && (
                    <div className="text-sm text-gray-600">{totalDistance} km • Turn-by-turn ready</div>
                  )}
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <Button
                variant="outline"
                size="default"
                onClick={handleCopyLink}
                disabled={!shareUrl}
                className="flex items-center space-x-2 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 rounded-xl px-4 py-2"
              >
                <Copy className="w-4 h-4" />
                <span className="font-medium">Share Route</span>
              </Button>
            </div>

            {/* Right: QR Code Section */}
            {shareUrl && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">Quick Mobile Access</div>
                  <div className="text-xs text-gray-600">Scan for instant navigation</div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <QRCodeCanvas 
                    id="route-qr" 
                    value={shareUrl} 
                    size={88}
                    level="M"
                    includeMargin={true}
                    className="relative border-2 border-white rounded-2xl p-3 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-3 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Map Container */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={center}
          zoom={11}
          onLoad={(map) => { mapRef.current = map; }}
          options={{
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'cooperative',
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              },
              {
                featureType: "transit",
                elementType: "labels",
                stylers: [{ visibility: "simplified" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e3f2fd" }]
              },
              {
                featureType: "landscape.natural",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }]
              }
            ]
          }}
        >
          {/* Traffic Layer for real-time traffic data */}
          <TrafficLayer />

          {/* Starting location marker */}
          <Marker
            position={defaultCenter}
            icon={{
              url: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
              scaledSize: new window.google.maps.Size(35, 35),
            }}
            title="Starting Location - Scarborough, ON"
          />

          {/* Origin marker (first delivery) */}
          {origin && origin.geometry?.location && (
            <Marker
              position={origin.geometry.location}
              icon={{
                url: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
                scaledSize: new window.google.maps.Size(35, 35),
              }}
              title={`First Stop: ${origin.formatted_address}`}
            />
          )}

          {/* Destination marker (last delivery) */}
          {destination && destination !== origin && destination.geometry?.location && (
            <Marker
              position={destination.geometry.location}
              icon={{
                url: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
                scaledSize: new window.google.maps.Size(35, 35),
              }}
              title={`Last Stop: ${destination.formatted_address}`}
            />
          )}

          {/* Route directions */}
          {directions && (
            <DirectionsRenderer 
              directions={directions}
              options={{
                suppressMarkers: true, // We're using custom markers
                polylineOptions: {
                  strokeColor: "#2563eb",
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
