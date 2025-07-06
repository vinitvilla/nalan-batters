import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddressStore, AddressFields } from "@/store/addressStore";
import { useRef, useEffect } from "react";

export function AddressForm({ loading, onAdd }: { loading?: boolean; onAdd?: () => void }) {
  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const newAddress = useAddressStore((s) => s.newAddress);
  const setNewAddress = useAddressStore((s) => s.setNewAddress);
  const clearNewAddress = useAddressStore((s) => s.clearNewAddress);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => initAutocomplete();
      document.body.appendChild(script);
    } else {
      initAutocomplete();
    }
    function initAutocomplete() {
      if (!autocompleteRef.current || !window.google) return;
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "ca" },
        }
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const isCanada = place.address_components?.some(c => c.types.includes("country") && c.short_name === "CA");
        const isOntario = place.address_components?.some(c => c.types.includes("administrative_area_level_1") && c.short_name === "ON");
        if (!isCanada || !isOntario) {
          alert("Please select an address in Ontario, Canada.");
          return;
        }
        const fields: AddressFields = { street: "", unit: "", city: "", province: "", country: "", postal: "" };
        place.address_components?.forEach(c => {
          if (c.types.includes("street_number")) fields.street = c.long_name + " " + fields.street;
          if (c.types.includes("route")) fields.street += c.long_name;
          if (c.types.includes("subpremise")) fields.unit = c.long_name;
          if (c.types.includes("locality")) fields.city = c.long_name;
          if (c.types.includes("administrative_area_level_1")) fields.province = c.short_name;
          if (c.types.includes("country")) fields.country = c.long_name;
          if (c.types.includes("postal_code")) fields.postal = c.long_name;
        });
        setNewAddress(fields);
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <Label className="mb-2">Add New Address</Label>
      <Input
        type="text"
        placeholder="Start typing your address..."
        ref={autocompleteRef}
        onChange={() => {}}
        className="w-full"
        // autoComplete="off"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        <Label className="flex flex-col gap-1">Street Address
          <Input required type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
        </Label>
        <Label className="flex flex-col gap-1">Unit / Apt
          <Input type="text" placeholder="Unit / Apt" value={newAddress.unit} onChange={e => setNewAddress({ ...newAddress, unit: e.target.value })} />
        </Label>
        <Label className="flex flex-col gap-1">City
          <Input required type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
        </Label>
        <Label className="flex flex-col gap-1">Province
          <Input required type="text" placeholder="Province" value={newAddress.province} onChange={e => setNewAddress({ ...newAddress, province: e.target.value })} />
        </Label>
        <Label className="flex flex-col gap-1">Country
          <Input required type="text" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} />
        </Label>
        <Label className="flex flex-col gap-1">Postal Code
          <Input required type="text" placeholder="Postal Code" value={newAddress.postal} onChange={e => setNewAddress({ ...newAddress, postal: e.target.value })} />
        </Label>
      </div>
      <Button
        className="mt-2 w-full cursor-pointer"
        onClick={() => { onAdd?.(); clearNewAddress(); }}
        disabled={!newAddress.street.trim() || !newAddress.city.trim() || !newAddress.province.trim() || !newAddress.country.trim() || !newAddress.postal.trim() || loading}
      >
        Add Address
      </Button>
    </div>
  );
}
