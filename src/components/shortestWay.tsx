"use client";

import React, { useState } from "react";
import Map from "../components/Map";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const libraries: ("places")[] = ["places"];

export default function Home() {
  const [origin, setOrigin] = useState<google.maps.places.PlaceResult | null>(null);
  const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);
  const [waypoints, setWaypoints] = useState<google.maps.places.PlaceResult[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [fieldType, setFieldType] = useState<"origin" | "destination" | "waypoint">("waypoint");

  const [originAuto, setOriginAuto] = useState<google.maps.places.Autocomplete | null>(null);
  const [destAuto, setDestAuto] = useState<google.maps.places.Autocomplete | null>(null);
  const [wpAuto, setWpAuto] = useState<google.maps.places.Autocomplete | null>(null);

	const router = useRouter();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const handlePlaceChanged = () => {
    let place: google.maps.places.PlaceResult | undefined;
    if (fieldType === "origin" && originAuto) {
      place = originAuto.getPlace();
      if (place && place.geometry && place.geometry.location) setOrigin(place);
    } else if (fieldType === "destination" && destAuto) {
      place = destAuto.getPlace();
      if (place && place.geometry && place.geometry.location) setDestination(place);
    } else if (fieldType === "waypoint" && wpAuto) {
      place = wpAuto.getPlace();
      if (place && place.geometry && place.geometry.location) {
        setWaypoints((prev) => [...prev, place as google.maps.places.PlaceResult]);
        setInputValue("");
      }
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Smart Delivery Route Planner</h1>
      <Button className="mb-4" onClick={() => { router.push('/admin'); }}>To Admin Page</Button>

      <div className="grid gap-4 mb-6">
        {/* Origin Input */}
        <div>
          <label className="font-medium">Origin</label>
          <Autocomplete
            onLoad={(auto) => setOriginAuto(auto)}
            onPlaceChanged={handlePlaceChanged}
            options={{ fields: ["formatted_address", "geometry", "name"] }}
          >
            <input
              type="text"
              placeholder="Enter origin address"
              className="border p-2 rounded w-full"
              onFocus={() => setFieldType("origin")}
            />
          </Autocomplete>
        </div>

        {/* Destination Input */}
        <div>
          <label className="font-medium">Destination</label>
          <Autocomplete
            onLoad={(auto) => setDestAuto(auto)}
            onPlaceChanged={handlePlaceChanged}
            options={{ fields: ["formatted_address", "geometry", "name"] }}
          >
            <input
              type="text"
              placeholder="Enter destination address"
              className="border p-2 rounded w-full"
              onFocus={() => setFieldType("destination")}
            />
          </Autocomplete>
        </div>

        {/* Waypoints Input */}
        <div>
          <label className="font-medium">Delivery Locations (Waypoints)</label>
          <div className="flex gap-2">
            <Autocomplete
              onLoad={(auto) => setWpAuto(auto)}
              onPlaceChanged={handlePlaceChanged}
              options={{ fields: ["formatted_address", "geometry", "name"] }}
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setFieldType("waypoint")}
                type="text"
                placeholder="Enter delivery address"
                className="border p-2 rounded w-full"
              />
            </Autocomplete>
            <button
              onClick={handlePlaceChanged}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {waypoints.map((wp, idx) => (
              <li key={idx}>{wp.formatted_address || wp.name}</li>
            ))}
          </ul>
        </div>
      </div>

      <Map origin={origin} destination={destination} waypoints={waypoints} />
    </div>
  );
}
