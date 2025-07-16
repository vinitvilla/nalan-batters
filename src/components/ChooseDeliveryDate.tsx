import React from "react";
import { Button } from "@/components/ui/button";

export interface ChooseDeliveryDateProps {
  deliveryDates: Array<{ date: string; day: string }>;
  selectedDeliveryDate: string;
  setSelectedDeliveryDate: (date: string) => void;
}

export function ChooseDeliveryDate({ deliveryDates, selectedDeliveryDate, setSelectedDeliveryDate }: ChooseDeliveryDateProps) {
  const formatDisplayDate = (dateString: string) => {
    // Parse date string manually to avoid timezone issues
    // Handle both YYYY-MM-DD and DD-MM-YYYY formats
    let year: number, month: number, day: number;
    
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD format
        [year, month, day] = parts.map(Number);
      } else {
        // DD-MM-YYYY format
        [day, month, year] = parts.map(Number);
      }
    } else {
      // Fallback: try to parse as is
      const date = new Date(dateString + 'T12:00:00'); // Add time to avoid timezone issues
      day = date.getDate();
      month = date.getMonth() + 1;
      year = date.getFullYear();
    }
    
    // Create date object with explicit local time
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    return { day: day.toString(), month: monthName };
  };

  return (
    <div className="mb-6 p-5 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">

      {deliveryDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-yellow-100/80 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <span className="text-yellow-600 text-2xl">📪</span>
          </div>
          <p className="text-yellow-700 font-medium text-base mb-2">No delivery dates available</p>
          <p className="text-yellow-600/80 text-sm">Please select a different address or contact us for assistance.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-yellow-700 text-sm font-medium opacity-90">
            Select your preferred delivery date:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {deliveryDates.map(({ date, day }) => {
              const isSelected = selectedDeliveryDate === date;
              const { day: dayNum, month } = formatDisplayDate(date);
              
              return (
                <Button
                  key={date}
                  variant="outline"
                  onClick={() => setSelectedDeliveryDate(date)}
                  className={`relative h-auto p-0 rounded-2xl transition-all duration-300 border-2 overflow-hidden group cursor-pointer
                    ${isSelected
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-400/90 to-yellow-300/80 shadow-xl scale-105 ring-2 ring-yellow-400/30'
                      : 'border-yellow-200/60 bg-gradient-to-br from-yellow-50/80 to-yellow-25/60 hover:border-yellow-300 hover:shadow-lg hover:scale-102 hover:from-yellow-100/80 hover:to-yellow-50/70'}
                  `}
                >
                  {/* Selection indicator dot */}
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full transition-all duration-200
                    ${isSelected ? 'bg-yellow-800 scale-100' : 'bg-yellow-300/50 scale-0 group-hover:scale-100'}
                  `} />
                  
                  {/* Content */}
                  <div className="flex flex-col items-center justify-center p-4 space-y-2 relative z-10">
                    {/* Day name */}
                    <div className={`text-xs font-bold uppercase tracking-wider transition-colors
                      ${isSelected ? 'text-yellow-900' : 'text-yellow-700 group-hover:text-yellow-800'}
                    `}>
                      {day}
                    </div>
                    
                    {/* Date display */}
                    <div className="flex flex-col items-center">
                      <div className={`text-2xl font-extrabold leading-none transition-colors
                        ${isSelected ? 'text-yellow-900' : 'text-yellow-800 group-hover:text-yellow-900'}
                      `}>
                        {dayNum}
                      </div>
                      <div className={`text-xs font-medium uppercase
                        ${isSelected ? 'text-yellow-600' : 'text-gray-500'}
                      `}>
                        {month}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {/* Selected date confirmation */}
          {selectedDeliveryDate && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <p className="text-green-700 text-sm font-medium">
                  Delivery scheduled for {formatDisplayDate(selectedDeliveryDate).month} {formatDisplayDate(selectedDeliveryDate).day}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
