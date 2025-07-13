import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddressStore } from "@/store/addressStore";
import { AddressForm } from "@/components/AddressForm";
import { userStore } from "@/store/userStore";
import { Plus, Trash2, Info } from "lucide-react";
import React, { useState, useEffect } from "react";
import { formatAddress } from "@/lib/utils/commonFunctions";
import { ChooseDeliveryDate } from "@/components/ChooseDeliveryDate";
import { useConfigStore } from "@/store/configStore";
import { useOrderStore } from "@/store/orderStore";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

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
  const fullName = userStore((s) => s.fullName);
  const [name, setName] = useState(fullName || "");
  const [showForm, setShowForm] = useState(false);
  const defaultAddressId = userStore((s) => s.defaultAddress?.id || null);
  const freeDeliveryConfig = useConfigStore(s => s.configs["freeDelivery"]);
  const [deliveryDates, setDeliveryDates] = useState<Array<{ date: string, day: string }>>([]);
  const selectedDeliveryDate = useOrderStore(s => s.selectedDeliveryDate);
  const setSelectedDeliveryDate = useOrderStore(s => s.setSelectedDeliveryDate);

  useEffect(() => {
    if (!selectedAddress?.city || !freeDeliveryConfig) {
      setDeliveryDates([]);
      setSelectedDeliveryDate("");
      return;
    }
    const dates = getNextDeliveryDates(selectedAddress.city, freeDeliveryConfig);
    setDeliveryDates(dates);
    setSelectedDeliveryDate(dates[0]?.date || "");
  }, [selectedAddress, freeDeliveryConfig, setSelectedDeliveryDate]);

  return (
    <Card className="flex justify-center shadow-2xl rounded-2xl border-0 bg-white max-w-md mx-auto">
      <CardHeader className="bg-white rounded-t-2xl p-4 border-b border-gray-200">
        <CardTitle className="text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
          <span className="inline-block w-7 h-7 bg-gray-200 rounded-full text-black flex items-center justify-center">📦</span>
          Contact & Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {error && <div className="text-red-500 text-xs mb-2 font-semibold">{error}</div>}
        <div className="space-y-4">
          {/* Full Name input above addresses */}
          <div>
            <Label className="font-semibold mb-2 text-black">Full Name</Label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-md text-black bg-white focus:border-black focus:ring-0"
              disabled={loading}
            />
          </div>
          {addresses && addresses.length > 0 && (
            <div>
              <Label className="font-semibold mb-2 text-black">Select Address</Label>
              <div className="flex flex-col gap-2">
                {addresses.map((addr, idx) => {
                  const isSelected = !!selectedAddress && formatAddress(selectedAddress) === formatAddress(addr);
                  const isDefault = addr.id === defaultAddressId;
                  return (
                    <div key={addr.id || idx} className="relative w-full">
                      <div
                        onClick={() => setSelectedAddress(addr)}
                        className={`flex flex-col justify-center rounded-2xl border-2 transition-all shadow-md cursor-pointer select-none px-5 py-4
                          ${isSelected ? 'bg-black text-white border-black shadow-xl' : 'bg-white text-black border-gray-300 hover:shadow-lg hover:-translate-y-1'}
                        `}
                        aria-selected={isSelected}
                        tabIndex={0}
                        role="option"
                        style={{ minHeight: '3rem' }}
                      >
                        <span className="text-base font-semibold block w-full whitespace-nowrap text-ellipsis overflow-hidden">
                          {formatAddress(addr)}
                        </span>
                        {isDefault ? (
                          <span className="absolute top-2 right-2 flex items-center">
                            <span className="group relative">
                              <Info className="w-5 h-5 text-blue-500 cursor-pointer" />
                              <span className="absolute z-10 left-7 top-1 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Default address cannot be deleted
                              </span>
                            </span>
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Trash2
                                  className={`w-5 h-5 transition-colors cursor-pointer
                                    ${isSelected ? 'text-white hover:text-red-400 opacity-100' : 'text-black opacity-60 hover:opacity-100 hover:text-red-600'}`}
                                  onClick={e => {
                                    e.stopPropagation();
                                  }}
                                />
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this address? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={async () => {
                                    if (addr.id) {
                                      await useAddressStore.getState().removeAddress(addr.id);
                                    }
                                  }} className="bg-red-600 text-white hover:bg-red-700 cursor-pointer">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Delivery Date Selection */}
          {addresses.length !== 0 && selectedAddress && (
            <ChooseDeliveryDate
              deliveryDates={deliveryDates}
              selectedDeliveryDate={selectedDeliveryDate}
              setSelectedDeliveryDate={setSelectedDeliveryDate}
            />
          )}
          <Separator className="my-4 bg-gray-200" />
          {showForm && <div className="mt-2"><AddressForm loading={loading} onAdd={() => { onAddAddress(); setShowForm(false); }} /></div>}
          <Button
            type="button"
            className={`w-full cursor-pointer font-semibold text-xs py-2 rounded-xl shadow-lg transition-all
            ${showForm ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-black text-white hover:bg-gray-900'} cursor-pointer`}
            variant={showForm ? "destructive" : "default"}
            onClick={() => setShowForm((v) => !v)}
            disabled={loading}
          >
            {!showForm && <Plus className="w-4 h-4 mr-1" />}
            {showForm ? "Cancel" : "Add New Address"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getNextDeliveryDates(city: string, freeDeliveryConfig: any): Array<{ date: string, day: string }> {
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
    .filter(([day, cities]) => Array.isArray(cities) && cities.some((c: string) => c.toLowerCase().includes(city.toLowerCase())))
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
