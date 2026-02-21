"use client";
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus, X } from 'lucide-react';

interface FreeDeliveryConfig {
  Monday?: string[];
  Tuesday?: string[];
  Wednesday?: string[];
  Thursday?: string[];
  Friday?: string[];
  Saturday?: string[];
  Sunday?: string[];
}

interface FreeDeliveryFormProps {
  value: FreeDeliveryConfig;
  onChange: (value: FreeDeliveryConfig) => void;
  disabled?: boolean;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function FreeDeliveryForm({ value, onChange, disabled = false }: FreeDeliveryFormProps) {
  const addArea = (day: string) => {
    const currentAreas = value[day as keyof FreeDeliveryConfig] || [];
    onChange({
      ...value,
      [day]: [...currentAreas, '']
    });
  };

  const removeArea = (day: string, index: number) => {
    const currentAreas = value[day as keyof FreeDeliveryConfig] || [];
    onChange({
      ...value,
      [day]: currentAreas.filter((_, i) => i !== index)
    });
  };

  const updateArea = (day: string, index: number, newValue: string) => {
    const currentAreas = value[day as keyof FreeDeliveryConfig] || [];
    const updatedAreas = [...currentAreas];
    updatedAreas[index] = newValue;
    onChange({
      ...value,
      [day]: updatedAreas
    });
  };

  return (
    <div className="space-y-3">
      {daysOfWeek.map((day) => {
        const areas = value[day as keyof FreeDeliveryConfig] || [];
        
        return (
          <div key={day} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-gray-900">{day}</span>
                <Badge 
                  variant={areas.length > 0 ? "default" : "secondary"}
                  className={areas.length > 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-200 text-gray-600"}
                >
                  {areas.length > 0 ? `${areas.length} ${areas.length === 1 ? 'area' : 'areas'}` : 'No delivery'}
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addArea(day)}
                disabled={disabled}
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Area
              </Button>
            </div>

            {areas.length > 0 ? (
              <div className="space-y-2">
                {areas.map((area, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={area}
                      onChange={(e) => updateArea(day, index, e.target.value)}
                      disabled={disabled}
                      placeholder="Enter city or area name (e.g., Toronto, Brampton)"
                      className="flex-1 border-gray-300 focus:border-orange-400 focus:ring-orange-100"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeArea(day, index)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No free delivery areas configured for this day
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
