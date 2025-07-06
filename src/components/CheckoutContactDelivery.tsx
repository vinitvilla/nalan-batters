import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddressStore } from "@/store/addressStore";
import { AddressForm } from "@/components/AddressForm";
import { userStore } from "@/store/userStore";
import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

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

  function joinAddress(fields: any) {
    return [fields.unit, fields.street, fields.city, fields.province, fields.country, fields.postal]
      .filter(Boolean)
      .join(", ");
  }

  return (
    <Card className="flex justify-center shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Contact & Delivery
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="space-y-4">
          {/* Full Name input above addresses */}
          <div>
            <Label className="font-semibold mb-2">Full Name</Label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full"
              disabled={loading}
            />
          </div>
          {addresses && addresses.length > 0 && (
            <div>
              <Label className="font-semibold mb-2">Select Address</Label>
              <div className="space-y-2">
                {addresses.map((addr, idx) => (
                  <label
                    key={addr.id || idx}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="address"
                      value={joinAddress(addr)}
                      checked={!!selectedAddress && joinAddress(selectedAddress) === joinAddress(addr)}
                      onChange={() => setSelectedAddress(addr)}
                    />
                    <span>{joinAddress(addr)}</span>
                    <Trash2
                      className="text-red-500 cursor-pointer"
                      onClick={() => {
                        useAddressStore.getState().removeAddress(addr.id || "");
                        if (selectedAddress && addr.id === selectedAddress.id) {
                          setSelectedAddress(null);
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
          <Separator />
          <Button
            type="button"
            className="w-full cursor-pointer"
            variant={showForm ? "destructive" : "default"}
            onClick={() => setShowForm((v) => !v)}
            disabled={loading}
          >
            {!showForm && <Plus />}
            {showForm ? "Cancel" : "Add New Address"}
          </Button>
          {showForm && <AddressForm loading={loading} onAdd={() => { onAddAddress(); setShowForm(false); }} />}
        </div>
      </CardContent>
    </Card>
  );
}
