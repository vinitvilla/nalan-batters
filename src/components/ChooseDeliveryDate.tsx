import React from "react";
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
      dayOfWeek: date.format('ddd').toUpperCase(),
      dayNum: date.format('D'),
      month: date.format('MMM'),
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
      <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Select your preferred delivery date</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {deliveryDates.map(({ date }) => {
          const isSelected = selectedDeliveryDate === date;
          const { dayOfWeek, dayNum, month } = formatDisplayDate(date);

          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDeliveryDate(date)}
              className={`
                relative flex flex-col items-center py-4 px-3 rounded-xl border-2 cursor-pointer
                transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400
                ${isSelected
                  ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/40'
                }
              `}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500" />
              )}
              <span className={`text-[10px] font-bold tracking-widest mb-1 ${isSelected ? 'text-yellow-600' : 'text-gray-400'}`}>
                {dayOfWeek}
              </span>
              <span className={`text-2xl font-bold leading-none ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {dayNum}
              </span>
              <span className={`text-xs mt-1 font-medium ${isSelected ? 'text-yellow-600' : 'text-gray-400'}`}>
                {month}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
