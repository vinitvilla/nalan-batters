import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import moment from 'moment';

const SECTION_STYLES = "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden";

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
          className="text-yellow-700 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
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

  return (
    <TooltipProvider>
      <div className="space-y-5">

        {error && (
          <div className="text-red-700 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
            <span className="text-red-500">!</span>
            {error}
          </div>
        )}

        {/* Contact Information */}
        <div className={SECTION_STYLES}>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900">Contact Information</h2>
            </div>
          </div>
          <div className="p-5">
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-100 placeholder:text-gray-400 px-4 py-2.5 text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {/* Delivery Address */}
        {deliveryType === 'DELIVERY' && (
          <div className={SECTION_STYLES}>
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Delivery Address</h2>
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
            </div>
            <div className="p-5">
              {hasAddresses ? (
                <div className="space-y-3">
                  {addresses.map((addr, idx) => {
                    const isSelected = !!selectedAddress && formatAddress(selectedAddress) === formatAddress(addr);
                    const isDefault = addr.id === defaultAddressId;
                    return (
                      <div
                        key={addr.id || idx}
                        onClick={() => setSelectedAddress(addr)}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-selected={isSelected}
                        tabIndex={0}
                        role="option"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                            ${isSelected
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-300'}
                          `}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 leading-snug">{formatAddress(addr)}</p>
                            {isDefault && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {isDefault ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-1.5 h-auto text-gray-400">
                                    <Info className="w-3.5 h-3.5" />
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
                                    className="p-1.5 h-auto text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={e => e.stopPropagation()}
                                    aria-label="Delete address"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border border-gray-200 shadow-xl bg-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-gray-900 text-base font-semibold">
                                      Delete Address?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-600 text-sm">
                                      Are you sure? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel asChild>
                                      <Button variant="outline" className="border-gray-300 text-gray-700 text-sm">
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
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-3" />
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
          <div className={SECTION_STYLES}>
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">Delivery Date</h2>
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
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-red-800 mb-1">No Delivery Available</p>
                  <p className="text-xs text-gray-600">
                    We don&apos;t currently deliver to <strong>{selectedAddress.city}</strong>. Please select a different address.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Indicator */}
        {((deliveryType === 'DELIVERY' && hasAddresses && selectedAddress && selectedDeliveryDate && deliveryDates.length > 0) ||
          (deliveryType === 'PICKUP' && name.trim().length > 0)) && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Ready to place your order. Review the summary and click Place Order.
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
