"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
  Marker,
  TrafficLayer,
} from "@react-google-maps/api";
import { QRCodeCanvas } from "qrcode.react";

const libraries = ["places"];

export default function Map({ origin, destination, waypoints }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [directions, setDirections] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const mapRef = useRef(null);

  const calculateRoute = () => {
    if (!origin || !destination) return;

    const wayPts = waypoints.map((place) => ({
      location: place.geometry.location,
      stopover: true,
    }));

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin.geometry.location,
        destination: destination.geometry.location,
        waypoints: wayPts,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: "bestguess",
        },
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);

          const legs = result.routes[0].legs;
          const totalTrafficTime = legs.reduce(
            (acc, leg) =>
              acc + (leg.duration_in_traffic?.value || leg.duration.value),
            0
          );

          setTotalTime(Math.round(totalTrafficTime / 60)); // in minutes

          // Generate shareable link
          const originStr = origin.formatted_address || `${origin.geometry.location.lat()},${origin.geometry.location.lng()}`;
          const destinationStr = destination.formatted_address || `${destination.geometry.location.lat()},${destination.geometry.location.lng()}`;
          const waypointStr = waypoints
            .map((wp) => wp.formatted_address || `${wp.geometry.location.lat()},${wp.geometry.location.lng()}`)
            .join("|");

          const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
            originStr
          )}&destination=${encodeURIComponent(
            destinationStr
          )}&waypoints=${encodeURIComponent(waypointStr)}`;

          setShareUrl(url);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  };

  useEffect(() => {
    if (origin && destination) {
      calculateRoute();
    }
  }, [origin, destination, waypoints]);

  if (!isLoaded) return <div>Loading map...</div>;

  const center = origin?.geometry?.location || { lat: 43.65, lng: -79.38 };

  return (
    <div>
      <GoogleMap
        mapContainerStyle={{ height: "400px", width: "100%" }}
        center={center}
        zoom={12}
        onLoad={(map) => (mapRef.current = map)}
      >
        <TrafficLayer autoUpdate />

        {origin && (
          <Marker
            position={origin.geometry.location}
            icon={{
              url: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {/* ETA & Share Section */}
      <div className="mt-4">
        {totalTime !== null && (
          <p className="text-lg font-semibold mb-2">
            🚗 Estimated Trip Time (with traffic): {totalTime} minutes
          </p>
        )}

        {shareUrl && (
          <>
            <div className="mb-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert("✅ Route link copied to clipboard!");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Share Route Link
              </button>
              <p className="text-sm mt-1 break-words text-gray-600">
                {shareUrl}
              </p>
            </div>

            {/* QR Code + Download Button */}
            <div className="mt-4">
              <h2 className="text-md font-semibold mb-1">📱 Scan Route QR Code</h2>
              <QRCodeCanvas id="route-qr" value={shareUrl} size={200} />
              <div>
                <button
                  onClick={() => {
                    const canvas = document.getElementById("route-qr").querySelector("canvas");
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "route-qr.png";
                    link.click();
                  }}
                  className="mt-2 bg-gray-700 text-white px-3 py-1 rounded"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
