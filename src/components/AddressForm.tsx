import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddressStore, AddressFields } from "@/store/addressStore";
import { useRef, useEffect, useState } from "react";

export function AddressForm({ loading, onAdd }: { loading?: boolean; onAdd?: () => void }) {
  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const newAddress = useAddressStore((s) => s.newAddress);
  const setNewAddress = useAddressStore((s) => s.setNewAddress);
  const clearNewAddress = useAddressStore((s) => s.clearNewAddress);
  const [error, setError] = useState<string>("");

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

  function validateAddress(fields: AddressFields) {
    if (!fields.street.trim() || !fields.city.trim() || !fields.province.trim() || !fields.country.trim() || !fields.postal.trim()) {
      return "All fields are required.";
    }
    // Canadian postal code regex
    const postalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
    if (!postalRegex.test(fields.postal.trim())) {
      return "Invalid Canadian postal code format.";
    }
    if (fields.country.toLowerCase() !== "canada" && fields.country !== "CANADA") {
      return "Country must be Canada.";
    }
    if (fields.province !== "ON") {
      return "Province must be Ontario (ON).";
    }
    return "";
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 max-w-lg mx-auto">
      <div className="mb-4">
        <div className="text-lg font-bold text-black mb-2">Add New Address</div>
        <Input
          type="text"
          placeholder="Start typing your address..."
          ref={autocompleteRef}
          onChange={() => { }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 mb-4 focus:border-black focus:ring-2 focus:ring-black/10"
        />
      </div>
      {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
      {newAddress && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Label className="flex flex-col gap-1 text-black font-semibold">Street Address
          <Input required type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black/10" />
        </Label>
        <Label className="flex flex-col gap-1 text-black font-semibold">Unit / Apt
          <Input type="text" placeholder="Unit / Apt" value={newAddress.unit} onChange={e => setNewAddress({ ...newAddress, unit: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black/10" />
        </Label>
        <Label className="flex flex-col gap-1 text-black font-semibold">City
          <Input required type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black/10" />
        </Label>
        <Label className="flex flex-col gap-1 text-black font-semibold">Province
          <Input required type="text" placeholder="Province" value={newAddress.province} onChange={e => setNewAddress({ ...newAddress, province: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black/10" />
        </Label>
        <Label className="flex flex-col gap-1 text-black font-semibold">Country
          <Input required type="text" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black/10" />
        </Label>
        <Label className="flex flex-col gap-1 text-black font-semibold">Postal Code
          <Input required type="text" placeholder="Postal Code" value={newAddress.postal} onChange={e => setNewAddress({ ...newAddress, postal: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:ring-2 focus:ring-black/10" />
        </Label>
      </div>}
      <Button
        className="mt-2 w-full py-3 rounded-xl font-bold text-base bg-black text-white shadow-lg hover:bg-gray-900 transition-all"
        onClick={() => {
          const validationError = validateAddress({
            street: newAddress.street.trim(),
            unit: newAddress.unit.trim(),
            city: newAddress.city.trim(),
            province: newAddress.province.trim(),
            country: newAddress.country.trim(),
            postal: newAddress.postal.trim(),
          });
          if (validationError) {
            setError(validationError);
            return;
          }
          setError("");
          onAdd?.();
          clearNewAddress();
        }}
        disabled={loading}
      >
        Add Address
      </Button>
    </div>
  );
}
