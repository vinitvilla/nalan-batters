import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useAddressStore } from "@/store/addressStore";
import { AddressForm } from "@/components/AddressForm";
import { userStore } from "@/store/userStore";
import { Plus, Trash2, Info, MapPin, User, Calendar, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { formatAddress } from "@/lib/utils/commonFunctions";
import { ChooseDeliveryDate } from "@/components/ChooseDeliveryDate";
import { useConfigStore } from "@/store/configStore";
import { useOrderStore } from "@/store/orderStore";

// Modern, engaging styling constants
const INPUT_STYLES = "w-full border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 placeholder:text-gray-500 px-4 py-3 font-medium transition-all duration-200 hover:border-gray-300 text-base shadow-sm";

const STEP_CARD_STYLES = "bg-white border border-gray-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden";

const STEP_HEADER_STYLES = "bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100";

const STEP_CONTENT_STYLES = "p-6 md:p-8";

export interface CheckoutContactDeliveryProps {
  loading: boolean;
  error: string | null;
  onAddAddress: () => void;
}

export function CheckoutContactDelivery({
  loading,
  error,
  onAddAddress,
}: CheckoutContactDeliveryProps) {
  const addresses = useAddressStore(s => s.addresses);
  const selectedAddress = useAddressStore(s => s.selectedAddress);
  const setSelectedAddress = useAddressStore(s => s.setSelectedAddress);
  const removeAddress = useAddressStore(s => s.removeAddress);
  
  const fullName = userStore((s) => s.fullName);
  const [name, setName] = useState(fullName || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const defaultAddressId = userStore((s) => s.defaultAddress?.id || null);
  const freeDeliveryConfig = useConfigStore(s => s.configs["freeDelivery"]);
  const [deliveryDates, setDeliveryDates] = useState<Array<{ date: string, day: string }>>([]);
  const selectedDeliveryDate = useOrderStore(s => s.selectedDeliveryDate);
  const setSelectedDeliveryDate = useOrderStore(s => s.setSelectedDeliveryDate);
  const orderType = useOrderStore(s => s.orderType);

  useEffect(() => {
    // Only calculate delivery dates for delivery orders
    if (orderType !== 'DELIVERY' || !selectedAddress?.city || !freeDeliveryConfig) {
      setDeliveryDates([]);
      setSelectedDeliveryDate("");
      return;
    }
    const dates = getNextDeliveryDates(selectedAddress.city, freeDeliveryConfig);
    setDeliveryDates(dates);
    setSelectedDeliveryDate(dates[0]?.date || "");
  }, [selectedAddress, freeDeliveryConfig, setSelectedDeliveryDate, orderType]);

  const handleAddressAdded = useCallback(() => {
    onAddAddress();
    setDialogOpen(false);
  }, [onAddAddress]);

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    await removeAddress(addressId);
  }, [removeAddress]);

  const hasAddresses = addresses && addresses.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-8">

        {error && (
          <div className="text-red-700 text-sm mb-6 font-medium bg-red-50 p-4 rounded-lg border border-red-200 flex items-center gap-3 max-w-2xl mx-auto">
            <span className="text-red-500 text-lg">⚠️</span>
            {error}
          </div>
        )}

        {/* Contact Information */}
        <div className={STEP_CARD_STYLES}>
          <div className={STEP_HEADER_STYLES}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                <p className="text-gray-600">
                  {orderType === 'PICKUP' 
                    ? 'We need your name for pickup confirmation'
                    : 'We need your name for delivery confirmation'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className={STEP_CONTENT_STYLES}>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className={INPUT_STYLES}
              disabled={loading}
            />
          </div>
        </div>

        {/* Delivery Address - Only show for delivery orders */}
        {orderType === 'DELIVERY' && (
          <div className={STEP_CARD_STYLES}>
            <div className={STEP_HEADER_STYLES}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                  <p className="text-gray-600">Choose where you want your order delivered</p>
                </div>
              </div>
            </div>
          <div className={STEP_CONTENT_STYLES}>
            {hasAddresses ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Select an address:</span>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent 
                      className="sm:max-w-2xl bg-white border border-gray-200 shadow-xl z-[9999]" 
                      onInteractOutside={(e) => {
                        // Allow interactions with Google autocomplete dropdown
                        const target = e.target as Element;
                        if (target?.closest('.pac-container')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <DialogHeader className="text-center pb-6">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-300">
                            <MapPin className="w-8 h-8 text-yellow-700" />
                          </div>
                        </div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                          Add New Delivery Address
                        </DialogTitle>
                        <p className="text-gray-600 text-base leading-relaxed">
                          Enter your address details below. We&apos;ll save it securely for future orders!
                        </p>
                      </DialogHeader>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
                        <AddressForm loading={loading} onAdd={handleAddressAdded} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {addresses.map((addr, idx) => {
                    const isSelected = !!selectedAddress && formatAddress(selectedAddress) === formatAddress(addr);
                    const isDefault = addr.id === defaultAddressId;
                    return (
                      <div key={addr.id || idx} className="group">
                        <div
                          onClick={() => setSelectedAddress(addr)}
                          className={`bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            isSelected 
                              ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg ring-4 ring-yellow-100' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                          aria-selected={isSelected}
                          tabIndex={0}
                          role="option"
                        >
                          <div className="flex items-start gap-4">
                            {/* Selection indicator */}
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0
                              ${isSelected 
                                ? 'bg-yellow-500 border-yellow-500' 
                                : 'border-gray-300 group-hover:border-yellow-400'}
                            `}>
                              {isSelected && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>

                            {/* Address content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-base leading-tight mb-2">
                                {formatAddress(addr)}
                              </p>
                              {isDefault && (
                                <div className="flex items-center gap-1">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                                    Default Address
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isDefault ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-2 h-auto rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                                    >
                                      <Info className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Default address cannot be deleted</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-2 h-auto rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-200"
                                      onClick={e => e.stopPropagation()}
                                      aria-label="Delete address"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border border-gray-200 shadow-xl bg-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-gray-900 text-lg font-bold">
                                        🗑️ Delete Address?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-600 text-base">
                                        Are you sure you want to delete this address? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-3">
                                      <AlertDialogCancel asChild>
                                        <Button variant="outline" className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium">
                                          Cancel
                                        </Button>
                                      </AlertDialogCancel>
                                      <AlertDialogAction asChild>
                                        <Button 
                                          onClick={() => handleDeleteAddress(addr.id!)} 
                                          className="bg-red-600 text-white hover:bg-red-700 cursor-pointer px-6 py-2 rounded-lg font-medium shadow-sm"
                                        >
                                          Delete
                                        </Button>
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl flex items-center justify-center shadow-lg border border-yellow-300">
                    <MapPin className="w-10 h-10 text-yellow-700" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  No delivery address yet
                </h3>
                <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed">
                  Add your first delivery address to continue with your order. We&apos;ll keep it secure for future purchases.
                </p>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl transform hover:scale-105">
                      <Plus className="w-5 h-5 mr-3" />
                      Add Your First Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="sm:max-w-2xl bg-white border border-gray-200 shadow-xl z-[9999]" 
                    onInteractOutside={(e) => {
                      // Allow interactions with Google autocomplete dropdown
                      const target = e.target as Element;
                      if (target?.closest('.pac-container')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DialogHeader className="text-center pb-6">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center shadow-sm border border-yellow-300">
                          <MapPin className="w-8 h-8 text-yellow-700" />
                        </div>
                      </div>
                      <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                        Add Your First Delivery Address
                      </DialogTitle>
                      <p className="text-gray-600 text-base leading-relaxed">
                        Enter your address details below. We&apos;ll save it securely for future orders!
                      </p>
                    </DialogHeader>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
                      <AddressForm loading={loading} onAdd={handleAddressAdded} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Delivery Date - Only show for delivery orders */}
        {orderType === 'DELIVERY' && hasAddresses && selectedAddress && (
          <div className={STEP_CARD_STYLES}>
            <div className={STEP_HEADER_STYLES}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Delivery Date</h2>
                  <p className="text-gray-600">Pick your preferred delivery date and time</p>
                </div>
              </div>
            </div>
            <div className={STEP_CONTENT_STYLES}>
              <ChooseDeliveryDate
                deliveryDates={deliveryDates}
                selectedDeliveryDate={selectedDeliveryDate}
                setSelectedDeliveryDate={setSelectedDeliveryDate}
              />
            </div>
          </div>
        )}

        {/* Completion Indicator */}
        {((orderType === 'DELIVERY' && hasAddresses && selectedAddress && selectedDeliveryDate) || 
          (orderType === 'PICKUP' && name.trim().length > 0)) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 text-center shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-3">Ready to Place Order!</h3>
            <p className="text-green-700 text-lg leading-relaxed max-w-md mx-auto">
              {orderType === 'PICKUP' 
                ? 'All information complete. You can now proceed to payment and finalize your pickup order.'
                : 'All information complete. You can now proceed to payment and finalize your delicious batter order.'
              }
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function getNextDeliveryDates(city: string, freeDeliveryConfig: Record<string, unknown>): Array<{ date: string, day: string }> {
  if (!city || !freeDeliveryConfig) return [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const utcToday = new Date(today.toISOString());
  const estOffset = -5 * 60;
  const estToday = new Date(utcToday.getTime() + (estOffset * 60 * 1000));
  estToday.setHours(0, 0, 0, 0);
  const todayDay = estToday.getDay();
  const count = 4;

  // Find all delivery days for the city
  const matchedDays = Object.entries(freeDeliveryConfig)
    .filter(([, cities]) => Array.isArray(cities) && cities.some((c: string) => c.toLowerCase().includes(city.toLowerCase())))
    .map(([day]) => day);
  if (matchedDays.length === 0) return [];

  // For each matched day, get the next 4 dates
  let allDates: Array<{ date: string, day: string }> = [];
  matchedDays.forEach(dayName => {
    if (!daysOfWeek.includes(dayName)) return;
    const targetDay = daysOfWeek.indexOf(dayName);
    let daysUntilNextDay = (targetDay - todayDay + 7) % 7;
    if (daysUntilNextDay === 0) daysUntilNextDay = 7;
    for (let i = 0; i < count; i++) {
      const nextDayDate = new Date(estToday);
      nextDayDate.setDate(estToday.getDate() + daysUntilNextDay);
      allDates.push({ date: nextDayDate.toISOString().split('T')[0], day: dayName });
      daysUntilNextDay += 7;
    }
  });
  allDates = allDates.sort((a, b) => a.date.localeCompare(b.date));
  // Only keep unique dates, up to 4
  const uniqueDates: Array<{ date: string, day: string }> = [];
  const seen = new Set();
  for (const d of allDates) {
    if (!seen.has(d.date)) {
      uniqueDates.push(d);
      seen.add(d.date);
    }
    if (uniqueDates.length === 4) break;
  }
  return uniqueDates;
}