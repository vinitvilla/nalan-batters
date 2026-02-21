"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Percent, DollarSign } from 'lucide-react';

interface AdditionalChargesConfig {
  taxPercent?: { percent?: number; waive?: boolean };
  convenienceCharge?: { amount?: number; waive?: boolean };
  deliveryCharge?: { amount?: number; waive?: boolean };
}

interface AdditionalChargesFormProps {
  value: AdditionalChargesConfig;
  onChange: (value: AdditionalChargesConfig) => void;
  disabled?: boolean;
}

export function AdditionalChargesForm({ value, onChange, disabled = false }: AdditionalChargesFormProps) {
  const taxConfig = value.taxPercent || { percent: 13, waive: false };
  const convenienceConfig = value.convenienceCharge || { amount: 2.99, waive: false };
  const deliveryConfig = value.deliveryCharge || { amount: 4.99, waive: false };

  const updateTaxConfig = (updates: Partial<typeof taxConfig>) => {
    onChange({
      ...value,
      taxPercent: { ...taxConfig, ...updates }
    });
  };

  const updateConvenienceConfig = (updates: Partial<typeof convenienceConfig>) => {
    onChange({
      ...value,
      convenienceCharge: { ...convenienceConfig, ...updates }
    });
  };

  const updateDeliveryConfig = (updates: Partial<typeof deliveryConfig>) => {
    onChange({
      ...value,
      deliveryCharge: { ...deliveryConfig, ...updates }
    });
  };

  return (
    <div className="space-y-4">
      {/* Tax Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-black" />
            <span className="font-medium text-black">Tax Percent</span>
            <Badge variant={taxConfig.waive ? "secondary" : "default"} className="bg-black text-white">
              {taxConfig.waive ? "Waived" : "Active"}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Tax Rate (%)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={taxConfig.percent || 0}
              onChange={(e) => updateTaxConfig({ percent: parseFloat(e.target.value) || 0 })}
              disabled={disabled || taxConfig.waive}
              className="border-gray-300 focus:border-black focus:ring-black"
              placeholder="13"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Waive Tax</label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={taxConfig.waive || false}
                onCheckedChange={(checked) => updateTaxConfig({ waive: checked })}
                disabled={disabled}
                className="data-[state=checked]:bg-black"
              />
              <span className="text-sm text-gray-600">
                {taxConfig.waive ? "Tax is waived" : "Tax is applied"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Charge Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-black" />
            <span className="font-medium text-black">Delivery Charge</span>
            <Badge variant={deliveryConfig.waive ? "secondary" : "default"} className="bg-black text-white">
              {deliveryConfig.waive ? "Waived" : "Active"}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Delivery Fee ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={deliveryConfig.amount || 0}
              onChange={(e) => updateDeliveryConfig({ amount: parseFloat(e.target.value) || 0 })}
              disabled={disabled || deliveryConfig.waive}
              className="border-gray-300 focus:border-black focus:ring-black"
              placeholder="4.99"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Waive Delivery</label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={deliveryConfig.waive || false}
                onCheckedChange={(checked) => updateDeliveryConfig({ waive: checked })}
                disabled={disabled}
                className="data-[state=checked]:bg-black"
              />
              <span className="text-sm text-gray-600">
                {deliveryConfig.waive ? "Free delivery" : "Charge delivery fee"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Convenience Charge Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-black" />
            <span className="font-medium text-black">Convenience Charge</span>
            <Badge variant={convenienceConfig.waive ? "secondary" : "default"} className="bg-black text-white">
              {convenienceConfig.waive ? "Waived" : "Active"}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Service Fee ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={convenienceConfig.amount || 0}
              onChange={(e) => updateConvenienceConfig({ amount: parseFloat(e.target.value) || 0 })}
              disabled={disabled || convenienceConfig.waive}
              className="border-gray-300 focus:border-black focus:ring-black"
              placeholder="2.99"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Waive Convenience Fee</label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={convenienceConfig.waive || false}
                onCheckedChange={(checked) => updateConvenienceConfig({ waive: checked })}
                disabled={disabled}
                className="data-[state=checked]:bg-black"
              />
              <span className="text-sm text-gray-600">
                {convenienceConfig.waive ? "No service fee" : "Charge service fee"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
