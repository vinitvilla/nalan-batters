"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock } from "lucide-react";

// Sample data for retail stores - this could be moved to a config or fetched from API
const availableStores = [
  {
    id: 1,
    name: "Fresh Mart Grocery",
    address: "123 Main St, Scarborough, ON",
    phone: "(416) 555-0101",
    type: "Grocery Store",
    hours: "8 AM - 10 PM",
    isOpen: true,
  },
  {
    id: 2,
    name: "Metro Plus",
    address: "456 Queen St, Toronto, ON",
    phone: "(416) 555-0102",
    type: "Supermarket",
    hours: "7 AM - 11 PM",
    isOpen: true,
  },
  {
    id: 3,
    name: "India Spice Market",
    address: "789 Gerrard St, Toronto, ON",
    phone: "(416) 555-0103",
    type: "Specialty Store",
    hours: "9 AM - 9 PM",
    isOpen: false,
  },
  {
    id: 4,
    name: "Loblaws Superstore",
    address: "321 Don Mills Rd, Toronto, ON",
    phone: "(416) 555-0104",
    type: "Supermarket",
    hours: "7 AM - 11 PM",
    isOpen: true,
  },
];

export default function AvailableStores() {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-xl border border-amber-200/60 flex flex-col h-full w-full p-0">
      <CardHeader className="w-full px-6 pt-6 pb-3 mb-0 flex-shrink-0">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-left w-full tracking-tight text-amber-600 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          Available Stores
        </CardTitle>
        <p className="text-sm text-amber-700/80 mt-2 px-11">Find our products at these retail locations</p>
      </CardHeader>
      <CardContent className="w-full px-6 pb-6 pt-0 flex-1 flex flex-col justify-center">
        <div className="max-h-80 overflow-y-auto pr-2 space-y-3 w-full">
          {availableStores.map((store) => (
            <div
              key={store.id}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-100 hover:border-amber-300 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {store.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 bg-amber-100 text-amber-700"
                    >
                      {store.type}
                    </Badge>
                    <Badge 
                      variant={store.isOpen ? "default" : "destructive"}
                      className={`text-xs px-2 py-1 ${
                        store.isOpen 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {store.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span>{store.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-3 border-t border-amber-200/50">
          <p className="text-xs text-amber-600/80 text-center">
            More locations coming soon! Call us to find the nearest store.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
