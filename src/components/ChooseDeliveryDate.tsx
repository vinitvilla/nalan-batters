import React from "react";
import { Button } from "@/components/ui/button";
import moment from 'moment';

export interface ChooseDeliveryDateProps {
  deliveryDates: Array<{ date: string; day: string }>;
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
}

export function ChooseDeliveryDate({ deliveryDates, selectedDeliveryDate, setSelectedDeliveryDate }: ChooseDeliveryDateProps) {
  const formatDisplayDate = (dateString: string) => {
    const date = moment(dateString, 'YYYY-MM-DD');
    return {
      day: date.format('D'),
      month: date.format('MMM')
    };
  };

  if (deliveryDates.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No delivery dates available. Please select a different address.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Select your preferred delivery date:</p>
      <div className="grid grid-cols-2 gap-3">
        {deliveryDates.map(({ date, day }) => {
          const isSelected = selectedDeliveryDate === date;
          const { day: dayNum, month } = formatDisplayDate(date);

          return (
            <Button
              key={date}
              variant="outline"
              onClick={() => setSelectedDeliveryDate(date)}
              className={`h-auto p-4 rounded-lg transition-colors border-2 cursor-pointer
                ${isSelected
                  ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-medium uppercase tracking-wide ${isSelected ? 'text-yellow-700' : 'text-gray-500'}`}>
                  {day}
                </span>
                <span className="text-xl font-bold leading-none">{dayNum}</span>
                <span className={`text-xs ${isSelected ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {month}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
