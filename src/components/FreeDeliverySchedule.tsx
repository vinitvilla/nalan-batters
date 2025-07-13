import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DeliveryScheduleItem {
  day: string;
  areas: string | string[];
}

interface FreeDeliveryScheduleProps {
  deliverySchedule: DeliveryScheduleItem[];
}

const FreeDeliverySchedule: React.FC<FreeDeliveryScheduleProps> = ({ deliverySchedule }) => (
  <Card className="bg-white border-gold-light shadow-gold-lg rounded-2xl h-full w-full flex flex-col p-0">
    <CardContent className="w-full flex flex-col items-center px-6 pt-6 pb-6 flex-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 rounded-full p-3 flex items-center justify-center shadow-md">
          <span className="text-green-500 text-3xl">🚚</span>
        </div>
        <span className="font-extrabold text-black text-2xl sm:text-3xl tracking-tight font-sans">
          Free Delivery
        </span>
      </div>
      <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-6 mt-2">
        {deliverySchedule.map(({ day, areas }, idx, arr) => (
          <div
            key={day}
            className="flex-1 flex flex-col items-center px-2"
          >
            <span className="font-semibold text-black text-lg mb-2 tracking-wide border-b border-gray-200 pb-1 w-full text-center">
              {day}
            </span>
            <div className="flex flex-col text-gray-700 text-base mt-1 gap-1">
              {Array.isArray(areas)
                ? areas.map((area: string) => (
                    <span
                      key={area}
                      className="px-2 py-1 mb-1 text-black text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))
                : typeof areas === "string"
                ? areas.split(", ").map((area: string) => (
                    <span
                      key={area}
                      className="px-2 py-1 mb-1 text-black text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))
                : areas}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default FreeDeliverySchedule;
