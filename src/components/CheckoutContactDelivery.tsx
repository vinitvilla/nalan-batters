import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useAddressStore } from "@/store/addressStore";
import { AddressForm } from "@/components/AddressForm";
import { userStore } from "@/store/userStore";
import { Plus, Trash2, Info, MapPin, User, Calendar, CheckCircle2, Home } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { formatAddress } from "@/lib/utils/commonFunctions";
import { ChooseDeliveryDate } from "@/components/ChooseDeliveryDate";
import { useConfigStore } from "@/store/configStore";
import { useOrderStore } from "@/store/orderStore";
import moment from 'moment';

const CARD = "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden";
const SECTION_HEADER = "px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between";
const SECTION_ICON = "w-4 h-4 text-gray-400";

export interface CheckoutContactDeliveryProps {
  loading: boolean;
  error: string | null;
  onAddAddress: () => void;
}

function AddressFormDialog({ open, onOpenChange, loading, onAdd, onCancel }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onAdd: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium h-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Address
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-2xl bg-white border border-gray-200 shadow-xl z-[9999]"
        onInteractOutside={(e) => {
          const target = e.target as Element;
          if (target?.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add Delivery Address
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Enter your address details below.
          </DialogDescription>
        </DialogHeader>
        <AddressForm
          loading={loading}
          onAdd={onAdd}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
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
  const deliveryType = useOrderStore(s => s.deliveryType);

  useEffect(() => {
    if (deliveryType !== 'DELIVERY' || !selectedAddress?.city || !freeDeliveryConfig) {
      setDeliveryDates([]);
      setSelectedDeliveryDate("");
      return;
    }
    const dates = getNextDeliveryDates(selectedAddress.city, freeDeliveryConfig);
    setDeliveryDates(dates);
    setSelectedDeliveryDate(dates[0]?.date || "");
  }, [selectedAddress, freeDeliveryConfig, setSelectedDeliveryDate, deliveryType]);

  const handleAddressAdded = useCallback(() => {
    onAddAddress();
    setDialogOpen(false);
  }, [onAddAddress]);

  const handleDeleteAddress = useCallback(async (addressId: string) => {
    await removeAddress(addressId);
  }, [removeAddress]);

  const hasAddresses = addresses && addresses.length > 0;
  const stepNumber = 3;

  return (
    <TooltipProvider>
      <div className="space-y-3">

        {error && (
          <div className="text-red-700 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 text-xs font-bold">!</span>
            {error}
          </div>
        )}

        {/* Contact Information */}
        <div className={CARD}>
          <div className={SECTION_HEADER}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-700">{stepNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className={SECTION_ICON} />
                <h2 className="text-sm font-semibold text-gray-900">Contact Information</h2>
              </div>
            </div>
          </div>
          <div className="p-5">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 placeholder:text-gray-400 text-sm h-10"
              disabled={loading}
            />
          </div>
        </div>

        {/* Delivery Address */}
        {deliveryType === 'DELIVERY' && (
          <div className={CARD}>
            <div className={SECTION_HEADER}>
              <div className="flex items-center gap-2">
                <MapPin className={SECTION_ICON} />
                <h2 className="text-sm font-semibold text-gray-900">Delivery Address</h2>
              </div>
              {hasAddresses && (
                <AddressFormDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  loading={loading}
                  onAdd={handleAddressAdded}
                  onCancel={() => setDialogOpen(false)}
                />
              )}
            </div>
            <div className="p-5">
              {hasAddresses ? (
                <div className="space-y-2.5">
                  {addresses.map((addr, idx) => {
                    const isSelected = !!selectedAddress && formatAddress(selectedAddress) === formatAddress(addr);
                    const isDefault = addr.id === defaultAddressId;
                    return (
                      <div
                        key={addr.id || idx}
                        onClick={() => setSelectedAddress(addr)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-50/60 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                        aria-selected={isSelected}
                        tabIndex={0}
                        role="option"
                        onKeyDown={e => e.key === 'Enter' && setSelectedAddress(addr)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio indicator */}
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200
                            ${isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300 bg-white'}
                          `}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <p className="text-sm text-gray-800 leading-snug">{formatAddress(addr)}</p>
                            </div>
                            {isDefault && (
                              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {isDefault ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-1.5 h-auto text-gray-300 hover:text-gray-400">
                                    <Info className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Default address cannot be deleted</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1.5 h-auto text-gray-300 hover:text-red-500 hover:bg-red-50"
                                    onClick={e => e.stopPropagation()}
                                    aria-label="Delete address"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border border-gray-200 shadow-xl bg-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-gray-900 text-base font-semibold">
                                      Delete this address?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-500 text-sm">
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel asChild>
                                      <Button variant="outline" className="border-gray-200 text-gray-700 text-sm">
                                        Cancel
                                      </Button>
                                    </AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                      <Button
                                        onClick={() => handleDeleteAddress(addr.id!)}
                                        className="bg-red-600 text-white hover:bg-red-700 text-sm"
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
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3 border border-gray-100">
                    <MapPin className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No delivery address yet</p>
                  <p className="text-xs text-gray-500 mb-4">Add an address to continue with your order.</p>
                  <AddressFormDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    loading={loading}
                    onAdd={handleAddressAdded}
                    onCancel={() => setDialogOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Date */}
        {deliveryType === 'DELIVERY' && hasAddresses && selectedAddress && (
          <div className={CARD}>
            <div className={SECTION_HEADER}>
              <div className="flex items-center gap-2">
                <Calendar className={SECTION_ICON} />
                <h2 className="text-sm font-semibold text-gray-900">Delivery Date</h2>
              </div>
            </div>
            <div className="p-5">
              {deliveryDates.length > 0 ? (
                <ChooseDeliveryDate
                  deliveryDates={deliveryDates}
                  selectedDeliveryDate={selectedDeliveryDate}
                  setSelectedDeliveryDate={setSelectedDeliveryDate}
                />
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3 border border-red-100">
                    <Calendar className="w-6 h-6 text-red-300" />
                  </div>
                  <p className="text-sm font-semibold text-red-700 mb-1">Delivery not available</p>
                  <p className="text-xs text-gray-500">
                    We don&apos;t currently deliver to <strong>{selectedAddress.city}</strong>.{' '}
                    Please select a different address.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Indicator */}
        {((deliveryType === 'DELIVERY' && hasAddresses && selectedAddress && selectedDeliveryDate && deliveryDates.length > 0) ||
          (deliveryType === 'PICKUP' && name.trim().length > 0)) && (
          <div className="flex items-center gap-3 px-4 py-3.5 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              All set! Review your order and click &quot;Place Order&quot; to confirm.
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

  const estToday = moment().utcOffset(-5).startOf('day');
  const todayDay = estToday.day();
  const count = 4;

  const matchedDays = Object.entries(freeDeliveryConfig)
    .filter(([, cities]) => Array.isArray(cities) && cities.some((c: string) => c.toLowerCase().includes(city.toLowerCase())))
    .map(([day]) => day);
  if (matchedDays.length === 0) return [];

  let allDates: Array<{ date: string, day: string }> = [];
  matchedDays.forEach(dayName => {
    if (!daysOfWeek.includes(dayName)) return;
    const targetDay = daysOfWeek.indexOf(dayName);
    let daysUntilNextDay = (targetDay - todayDay + 7) % 7;
    if (daysUntilNextDay === 0) daysUntilNextDay = 7;
    for (let i = 0; i < count; i++) {
      const nextDayDate = moment(estToday).add(daysUntilNextDay, 'days');
      allDates.push({
        date: nextDayDate.format('YYYY-MM-DD'),
        day: dayName
      });
      daysUntilNextDay += 7;
    }
  });
  allDates = allDates.sort((a, b) => a.date.localeCompare(b.date));
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
