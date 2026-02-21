import React from 'react';
import { Truck, Store, MapPin, Clock } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';

export function OrderTypeSelector() {
  const orderType = useOrderStore(s => s.deliveryType);
  const setOrderType = useOrderStore(s => s.setDeliveryType);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Store className="w-4 h-4 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">How would you like to receive your order?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Delivery Option */}
        <div
          className={`
            relative border-2 rounded-lg p-5 cursor-pointer transition-colors
            ${orderType === 'DELIVERY'
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          onClick={() => setOrderType('DELIVERY')}
        >
          <div className={`
            absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center
            ${orderType === 'DELIVERY'
              ? 'border-yellow-500 bg-yellow-500'
              : 'border-gray-300 bg-white'
            }
          `}>
            {orderType === 'DELIVERY' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${orderType === 'DELIVERY' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}
            `}>
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Delivery</h3>
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivered to your address</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Schedule delivery date</span>
            </div>
          </div>
        </div>

        {/* Pickup Option */}
        <div
          className={`
            relative border-2 rounded-lg p-5 cursor-pointer transition-colors
            ${orderType === 'PICKUP'
              ? 'border-green-400 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          onClick={() => setOrderType('PICKUP')}
        >
          <div className={`
            absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center
            ${orderType === 'PICKUP'
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300 bg-white'
            }
          `}>
            {orderType === 'PICKUP' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${orderType === 'PICKUP' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}
            `}>
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900">Pickup</h3>
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5" />
              <span>Collect from our store</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>No delivery charges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
