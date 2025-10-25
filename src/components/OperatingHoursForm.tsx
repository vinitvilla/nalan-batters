"use client";
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface DayHours {
  start: string;
  end: string;
  closed: boolean;
}

interface OperatingHoursConfig {
  Monday?: DayHours;
  Tuesday?: DayHours;
  Wednesday?: DayHours;
  Thursday?: DayHours;
  Friday?: DayHours;
  Saturday?: DayHours;
  Sunday?: DayHours;
}

interface OperatingHoursFormProps {
  value: OperatingHoursConfig;
  onChange: (value: OperatingHoursConfig) => void;
  disabled?: boolean;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function OperatingHoursForm({ value, onChange, disabled = false }: OperatingHoursFormProps) {
  const updateDayConfig = (day: string, updates: Partial<DayHours>) => {
    const currentDayConfig = value[day as keyof OperatingHoursConfig] || { start: '09:00', end: '21:30', closed: false };
    onChange({
      ...value,
      [day]: { ...currentDayConfig, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      
      {daysOfWeek.map((day) => {
        const dayConfig = value[day as keyof OperatingHoursConfig] || { start: '09:00', end: '21:30', closed: false };
        const isOpen = !dayConfig.closed;
        
        return (
          <div key={day} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            {/* Header Row with Day Name and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900 text-lg">{day}</span>
                <Badge 
                  variant={isOpen ? "default" : "secondary"} 
                  className={isOpen ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-200 text-gray-600"}
                >
                  {isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              
              {/* Open/Closed Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  {isOpen ? "Open" : "Closed"}
                </span>
                <Switch
                  checked={isOpen}
                  onCheckedChange={(checked) => updateDayConfig(day, { closed: !checked })}
                  disabled={disabled}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>

            {/* Time Inputs */}
            {isOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-700 font-medium">Opening Time</label>
                  <Input
                    type="time"
                    value={dayConfig.start || '09:00'}
                    onChange={(e) => updateDayConfig(day, { start: e.target.value })}
                    disabled={disabled}
                    className="border-gray-300 focus:border-orange-400 focus:ring-orange-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700 font-medium">Closing Time</label>
                  <Input
                    type="time"
                    value={dayConfig.end || '21:30'}
                    onChange={(e) => updateDayConfig(day, { end: e.target.value })}
                    disabled={disabled}
                    className="border-gray-300 focus:border-orange-400 focus:ring-orange-100"
                  />
                </div>
              </div>
            )}

            {/* Display hours summary when open */}
            {isOpen && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  <strong>Hours:</strong> {dayConfig.start} - {dayConfig.end}
                </span>
              </div>
            )}
            
            {/* Message when closed */}
            {!isOpen && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500 italic">Store is closed on this day</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
