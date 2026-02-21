import React from 'react';
import { Truck, Store, MapPin, Clock } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';

export function OrderTypeSelector() {
  const orderType = useOrderStore(s => s.deliveryType);
  const setOrderType = useOrderStore(s => s.setDeliveryType);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Type</h2>
          <p className="text-gray-600">Choose how you&apos;d like to receive your order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery Option */}
        <div
          className={`
            relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg
            ${orderType === 'DELIVERY' 
              ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-100' 
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          onClick={() => setOrderType('DELIVERY')}
        >
          {/* Selection indicator */}
          <div className={`
            absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300
            ${orderType === 'DELIVERY' 
              ? 'border-yellow-500 bg-yellow-500' 
              : 'border-gray-300 bg-white'
            }
          `}>
            {orderType === 'DELIVERY' && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          <div className="flex items-center mb-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300
              ${orderType === 'DELIVERY' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`
                font-bold text-lg transition-colors duration-300
                ${orderType === 'DELIVERY' ? 'text-gray-900' : 'text-gray-700'}
              `}>
                Delivery
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Delivered to your address</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Schedule delivery date</span>
            </div>
          </div>

          {orderType === 'DELIVERY' && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800 font-medium">
                ✓ Selected - Address and delivery date required
              </p>
            </div>
          )}
        </div>

        {/* Pickup Option */}
        <div
          className={`
            relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg
            ${orderType === 'PICKUP' 
              ? 'border-green-400 bg-green-50 shadow-lg shadow-green-100' 
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
          onClick={() => setOrderType('PICKUP')}
        >
          {/* Selection indicator */}
          <div className={`
            absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-300
            ${orderType === 'PICKUP' 
              ? 'border-green-500 bg-green-500' 
              : 'border-gray-300 bg-white'
            }
          `}>
            {orderType === 'PICKUP' && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          <div className="flex items-center mb-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300
              ${orderType === 'PICKUP' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`
                font-bold text-lg transition-colors duration-300
                ${orderType === 'PICKUP' ? 'text-gray-900' : 'text-gray-700'}
              `}>
                Pickup
              </h3>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Store className="w-4 h-4 mr-2" />
              <span>Collect from our store</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Available during business hours</span>
            </div>
          </div>

          {orderType === 'PICKUP' && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-xs text-green-800 font-medium">
                ✓ Selected - No delivery or convenience charges
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Additional info based on selection */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        {orderType === 'DELIVERY' ? (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Delivery Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Delivery charges may apply based on location</li>
              <li>• Free delivery available on select days and areas</li>
              <li>• Address and delivery date must be provided</li>
            </ul>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Pickup Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• No delivery or convenience charges</li>
              <li>• Pickup available during business hours</li>
              <li>• Contact details required for pickup notification</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
