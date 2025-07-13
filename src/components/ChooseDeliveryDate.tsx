import React from "react";
import { Button } from "@/components/ui/button";

export interface ChooseDeliveryDateProps {
  deliveryDates: Array<{ date: string; day: string }>;
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
}

export function ChooseDeliveryDate({ deliveryDates, selectedDeliveryDate, setSelectedDeliveryDate }: ChooseDeliveryDateProps) {
  return (
    <div className="flex flex-col items-start mb-4 p-3 rounded-xl bg-white border border-gray-200 shadow-md">
      <div className="font-semibold mb-2 text-black text-base flex items-center gap-2">
        <span className="inline-block w-5 h-5 bg-gray-200 rounded-full text-black flex items-center justify-center mr-2">📅</span>
        Choose Delivery Date
      </div>
      {deliveryDates.length === 0 ? (
        <div className="text-xs text-gray-500">No delivery dates available for your city.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 w-full">
          {deliveryDates.map(({ date, day }) => (
            <Button
              key={date}
              variant={selectedDeliveryDate === date ? "default" : "outline"}
              onClick={() => setSelectedDeliveryDate(date)}
              className={`text-xs w-full py-2 rounded-lg transition-all duration-150 font-medium border-2
                ${selectedDeliveryDate === date
                  ? 'border-black bg-gray-100 text-black shadow-md hover:text-white hover:bg-black'
                  : 'border-gray-200 bg-white text-black hover:border-black hover:bg-gray-100'}
                '`}
            >
              <span className="block text-xs font-semibold">{day}</span>
              <span className="block text-sm text-gray-500">{date}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
