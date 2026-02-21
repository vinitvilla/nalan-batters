import React from 'react';
import { Truck, Store, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';

export function OrderTypeSelector() {
  const orderType = useOrderStore(s => s.deliveryType);
  const setOrderType = useOrderStore(s => s.setDeliveryType);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-700">2</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">How would you like to receive your order?</h2>
            <p className="text-xs text-gray-500">Choose a delivery option to continue</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Delivery Option */}
          <button
            type="button"
            className={`
              relative w-full text-left border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400
              ${orderType === 'DELIVERY'
                ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
            onClick={() => setOrderType('DELIVERY')}
          >
            {/* Selected checkmark */}
            <div className={`
              absolute top-3.5 right-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${orderType === 'DELIVERY'
                ? 'border-yellow-500 bg-yellow-500'
                : 'border-gray-300 bg-white'
              }
            `}>
              {orderType === 'DELIVERY' && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
            </div>

            <div className="flex items-center gap-3 mb-3 pr-6">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
                ${orderType === 'DELIVERY' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Delivery</h3>
            </div>

            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Delivered to your address</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Schedule a delivery date</span>
              </div>
            </div>
          </button>

          {/* Pickup Option */}
          <button
            type="button"
            className={`
              relative w-full text-left border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400
              ${orderType === 'PICKUP'
                ? 'border-green-400 bg-green-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
            onClick={() => setOrderType('PICKUP')}
          >
            {/* Selected checkmark */}
            <div className={`
              absolute top-3.5 right-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
              ${orderType === 'PICKUP'
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 bg-white'
              }
            `}>
              {orderType === 'PICKUP' && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
            </div>

            <div className="flex items-center gap-3 mb-3 pr-6">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200
                ${orderType === 'PICKUP' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}
              `}>
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Pickup</h3>
            </div>

            <div className="space-y-1.5 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Collect from our store</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>No delivery charges</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
