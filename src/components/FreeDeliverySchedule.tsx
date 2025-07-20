import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, Star } from "lucide-react";
import "../styles/theme.css";

interface DeliveryScheduleItem {
  day: string;
  areas: string | string[];
}

interface FreeDeliveryScheduleProps {
  deliverySchedule: DeliveryScheduleItem[];
}

// Get current day to highlight today's delivery
const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const FreeDeliverySchedule: React.FC<FreeDeliveryScheduleProps> = ({ deliverySchedule }) => {
  const currentDay = getCurrentDay();
  
  // Check if today has free delivery
  const todayDelivery = deliverySchedule.find(schedule => schedule.day === currentDay);
  const hasDeliveryToday = !!todayDelivery;

  return (
    <Card className="h-full bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3 relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full -translate-y-6 translate-x-6"></div>
        
        <div className="relative">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 mb-2 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Dancing Script', cursive" }}>
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            Free Delivery
          </CardTitle>
          
          {/* Today's Status */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              hasDeliveryToday 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${hasDeliveryToday ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              {hasDeliveryToday ? 'Available Today' : 'Not Today'}
            </div>
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200 px-2 py-0.5">
              No minimum
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {/* Weekly Schedule - More Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-gray-800 text-sm">Weekly Schedule</span>
            </div>
          </div>
          
          <div className="grid gap-3 my-8">
            {deliverySchedule.map(({ day, areas }) => {
              const isToday = day === currentDay;
              const areaList = Array.isArray(areas) ? areas : areas.split(", ");
              
              return (
                <div
                  key={day}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isToday 
                      ? 'bg-amber-100/80 border border-amber-200' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                      )}
                      <span className={`font-semibold text-sm ${
                        isToday ? 'text-amber-800' : 'text-gray-700'
                      }`}>
                        {day}
                      </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1.5 py-0.5 ${
                        isToday 
                          ? 'border-amber-300 text-amber-700' 
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {areaList.length}
                    </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {areaList.map((area: string) => (
                      <Badge 
                        key={area} 
                        variant="secondary"
                        className={`text-xs px-1.5 py-0.5 ${
                          isToday 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer info - More compact */}
        <div className="pt-2 border-t border-amber-200/50">
          <p className="text-xs text-amber-600/80 text-center flex items-center justify-center gap-1">
            <Truck className="w-3 h-3" />
            Order early for same-day delivery. Call us for details!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeDeliverySchedule;
