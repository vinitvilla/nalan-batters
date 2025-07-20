"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, ExternalLink, Star, Navigation } from "lucide-react";
import "../styles/theme.css";

// Sample data for retail stores - this could be moved to a config or fetched from API
const availableStores = [
  {
    id: 1,
    name: "Fresh Mart Grocery",
    address: "123 Main St, Scarborough",
    phone: "(416) 555-0101",
    type: "Grocery",
    hours: "8 AM - 10 PM",
    isOpen: true,
    rating: 4.5,
    distance: "2.1 km",
    featured: true,
  },
  {
    id: 2,
    name: "Metro Plus",
    address: "456 Queen St, Toronto",
    phone: "(416) 555-0102",
    type: "Supermarket",
    hours: "7 AM - 11 PM",
    isOpen: true,
    rating: 4.2,
    distance: "3.4 km",
    featured: false,
  },
  {
    id: 3,
    name: "India Spice Market",
    address: "789 Gerrard St, Toronto",
    phone: "(416) 555-0103",
    type: "Specialty",
    hours: "9 AM - 9 PM",
    isOpen: false,
    rating: 4.8,
    distance: "5.2 km",
    featured: true,
  },
  {
    id: 4,
    name: "Loblaws Superstore",
    address: "321 Don Mills Rd, Toronto",
    phone: "(416) 555-0104",
    type: "Supermarket",
    hours: "7 AM - 11 PM",
    isOpen: true,
    rating: 4.3,
    distance: "4.7 km",
    featured: false,
  },
  {
    id: 5,
    name: "Farm Boy",
    address: "567 Bloor St, Toronto",
    phone: "(416) 555-0105",
    type: "Grocery",
    hours: "8 AM - 10 PM",
    isOpen: true,
    rating: 4.6,
    distance: "6.1 km",
    featured: false,
  },
  {
    id: 6,
    name: "No Frills",
    address: "890 Dundas St, Mississauga",
    phone: "(905) 555-0106",
    type: "Grocery",
    hours: "7 AM - 11 PM",
    isOpen: false,
    rating: 3.8,
    distance: "7.3 km",
    featured: false,
  },
  {
    id: 7,
    name: "T&T Supermarket",
    address: "234 Pacific Mall, Markham",
    phone: "(905) 555-0107",
    type: "Specialty",
    hours: "9 AM - 10 PM",
    isOpen: true,
    rating: 4.4,
    distance: "8.9 km",
    featured: true,
  },
];

export default function AvailableStores() {
  const openStores = availableStores.filter(store => store.isOpen);
  const closedStores = availableStores.filter(store => !store.isOpen);
  const totalStores = availableStores.length;

  return (
    <Card className="h-full bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full -translate-y-6 translate-x-6"></div>
        
        <div className="relative">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 mb-2 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Dancing Script', cursive" }}>
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            Available Stores
          </CardTitle>
          
          {/* Status and Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              {openStores.length} Open Now
            </div>
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200 px-2 py-0.5">
              {totalStores} Locations
            </Badge>
          </div>
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-100/60 to-yellow-100/60 rounded-lg border border-amber-200/50">
            <p className="text-sm text-amber-800 font-medium text-center leading-relaxed">
              ⚡ Want your batter ASAP? Call ahead and pickup from our available stores!
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full overflow-hidden relative">
        {/* Store List - Scrollable Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-80" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#F59E0B #FEF3C7'
        }}>
          {/* Open Stores First */}
          {openStores.map((store) => (
            <div
              key={store.id}
              className={`bg-white/80 backdrop-blur-sm rounded-lg p-3 border transition-all duration-200 hover:shadow-md group cursor-pointer ${
                store.featured 
                  ? 'border-amber-300 hover:border-amber-400 shadow-sm' 
                  : 'border-amber-100 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {store.name}
                    </h4>
                    {store.featured && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                    <ExternalLink className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-1.5 py-0.5 border-0 ${
                        store.type === 'Specialty' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {store.type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2.5 h-2.5 ${
                              i < Math.floor(store.rating) 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">{store.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5 text-amber-500" />
                      <span className="text-xs text-gray-500">{store.distance}</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  className="bg-green-100 text-green-700 text-xs px-2 py-0.5 hover:bg-green-100 border-0 font-semibold"
                >
                  Open
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span className="font-medium">{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span className="font-medium hover:text-amber-600 transition-colors">{store.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Closed Stores */}
          {closedStores.map((store) => (
            <div
              key={store.id}
              className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-gray-200 opacity-75"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-700 text-sm truncate">
                      {store.name}
                    </h4>
                    {store.featured && (
                      <Star className="w-3 h-3 text-gray-400 fill-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 border-0"
                    >
                      {store.type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2.5 h-2.5 ${
                              i < Math.floor(store.rating) 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">{store.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5 text-gray-400" />
                      <span className="text-xs text-gray-500">{store.distance}</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  className="bg-red-100 text-red-700 text-xs px-2 py-0.5 hover:bg-red-100 border-0 font-semibold"
                >
                  Closed
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Scroll fade indicator */}
        <div className="absolute bottom-16 left-0 right-0 h-4 bg-gradient-to-t from-amber-50/90 to-transparent pointer-events-none"></div>
        
        {/* Call to Action - Fixed at bottom */}
        <div className="pt-3 mt-2 border-t border-amber-200/50 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-amber-700/80 mb-1">
              📍 Can't find your area? 
            </p>
            <p className="text-xs text-amber-600 font-medium">
              Call us to find the nearest participating store!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
