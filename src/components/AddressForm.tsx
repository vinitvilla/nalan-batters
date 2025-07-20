import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddressStore, AddressFields } from "@/store/addressStore";
import { useRef, useEffect, useState, useCallback } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

// Clean, modern styling classes for form inputs
const inputClassName = "border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-900 placeholder:text-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all duration-200 hover:border-gray-300 shadow-sm";

export function AddressForm({ loading, onAdd, onCancel }: { loading?: boolean; onAdd?: () => void; onCancel?: () => void }) {
  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const newAddress = useAddressStore((s) => s.newAddress);
  const setNewAddress = useAddressStore((s) => s.setNewAddress);
  const clearNewAddress = useAddressStore((s) => s.clearNewAddress);
  const [error, setError] = useState<string>("");

  // Use the same Google Maps loader as other components
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries as any,
  });

  const updateField = useCallback((field: keyof AddressFields, value: string) => {
    setNewAddress({ ...newAddress, [field]: value });
  }, [newAddress, setNewAddress]);

  const initAutocomplete = useCallback(() => {
    if (!autocompleteRef.current || !window.google || !isLoaded) {
      return;
    }
    
    try {
      // Use the standard Autocomplete API (still supported)
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "ca" },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          return;
        }

        const isCanada = place.address_components.some(c => 
          c.types.includes("country") && c.short_name === "CA"
        );
        const isOntario = place.address_components.some(c => 
          c.types.includes("administrative_area_level_1") && c.short_name === "ON"
        );
        
        if (!isCanada || !isOntario) {
          setError("Please select an address in Ontario, Canada.");
          clearNewAddress();
          autocompleteRef.current!.value = "";
          autocompleteRef.current!.focus();
          return;
        }

      const fields: AddressFields = { 
        street: "", unit: "", city: "", province: "", country: "", postal: "" 
      };
      
      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes("street_number")) {
          fields.street = component.long_name + " ";
        }
        if (types.includes("route")) {
          fields.street += component.long_name;
        }
        if (types.includes("subpremise")) {
          fields.unit = component.long_name;
        }
        // Prioritize sublocality (like Scarborough) over locality (Toronto)
        // But avoid using "Old Toronto" - prefer just "Toronto" for that
        if (types.includes("sublocality_level_1") || types.includes("sublocality")) {
          // Skip "Old Toronto" and similar - prefer the main city name
          if (!component.long_name.toLowerCase().includes("old toronto")) {
            fields.city = component.long_name;
          }
        } else if (types.includes("neighborhood")) {
          if (!fields.city && !component.long_name.toLowerCase().includes("old toronto")) {
            fields.city = component.long_name;
          }
        } else if (types.includes("locality")) {
          // Always prefer locality over "Old Toronto" type designations
          if (!fields.city || fields.city.toLowerCase().includes("old")) {
            fields.city = component.long_name;
          }
        }
        if (types.includes("administrative_area_level_1")) {
          fields.province = component.short_name;
        }
        if (types.includes("country")) {
          fields.country = component.long_name;
        }
        if (types.includes("postal_code")) {
          fields.postal = component.long_name;
        }
      });
        
        setNewAddress(fields);
        setError("");
      });
    } catch (error) {
      console.error('Failed to initialize Google Places Autocomplete:', error);
      setError("Failed to load address autocomplete. Please try refreshing the page.");
    }
  }, [clearNewAddress, setNewAddress, isLoaded]);

  useEffect(() => {
    // Initialize component state
    setError("");
    clearNewAddress();

    // Add CSS to ensure Google Places autocomplete appears above dialog
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        z-index: 99999 !important;
      }
    `;
    document.head.appendChild(style);

    // Only initialize autocomplete when Google Maps API is loaded and ref is available
    if (isLoaded && autocompleteRef.current) {
      // Small delay to ensure the DOM is ready
      const timeoutId = setTimeout(() => {
        initAutocomplete();
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }

    // Cleanup function to remove the style when component unmounts
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isLoaded, initAutocomplete, clearNewAddress]);

  const validateAddress = useCallback((fields: AddressFields) => {
    const required: (keyof AddressFields)[] = ['street', 'city', 'province', 'country', 'postal'];
    for (const field of required) {
      if (!fields[field]?.trim()) {
        return "All required fields must be filled.";
      }
    }
    
    // Canadian postal code validation
    const postalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
    if (!postalRegex.test(fields.postal.trim())) {
      return "Invalid Canadian postal code format.";
    }
    
    if (fields.country.toLowerCase() !== "canada") {
      return "Country must be Canada.";
    }
    
    if (fields.province !== "ON") {
      return "Province must be Ontario (ON).";
    }
    
    return "";
  }, []);

  const handleSave = useCallback(() => {
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
  }, [newAddress, validateAddress, onAdd, clearNewAddress]);

  const handleCancel = useCallback(() => {
    clearNewAddress();
    setError("");
    onCancel?.(); // This will close the dialog without adding address
  }, [clearNewAddress, onCancel]);

  const FormField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    required = false 
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
  }) => (
    <Label className="flex flex-col gap-2 text-gray-900 font-medium">
      {label} {required && "*"}
      <Input 
        required={required}
        type="text" 
        placeholder={placeholder}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={inputClassName}
      />
    </Label>
  );

  return (
    <div className="space-y-6">
      {/* Benefits section */}
      <div className="rounded-lg p-4 bg-yellow-50 border border-yellow-200">
        <h4 className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
          <span className="text-yellow-600">✨</span>
          Why add your address?
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Faster checkout for future orders
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Accurate delivery time estimates
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Secure and encrypted storage
          </li>
        </ul>
      </div>
      
      <div>
        <Label className="text-gray-900 font-medium mb-2 block">🏠 Start with your address</Label>
        {!isLoaded ? (
          <div className="w-full border border-gray-200 rounded-lg text-gray-900 bg-gray-50 px-4 py-3 font-medium text-center">
            Loading address autocomplete...
          </div>
        ) : (
          <Input
            type="text"
            placeholder="Start typing your address..."
            ref={autocompleteRef}
            onChange={() => {}}
            className="w-full border border-gray-200 rounded-lg text-gray-900 bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 placeholder:text-gray-500 px-4 py-3 font-medium transition-all duration-200 hover:border-gray-300 shadow-sm"
          />
        )}
        <p className="text-xs text-gray-500 mt-2">We&apos;ll auto-fill the details below when you select an address</p>
      </div>
      {error && (
        <div className="text-red-700 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          {error}
        </div>
      )}
      
      {newAddress && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Street Address"
              value={newAddress.street}
              onChange={(value) => updateField('street', value)}
              placeholder="123 Main Street"
              required
            />
            <FormField
              label="Unit / Apt"
              value={newAddress.unit}
              onChange={(value) => updateField('unit', value)}
              placeholder="Apt 101"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="City"
              value={newAddress.city}
              onChange={(value) => updateField('city', value)}
              placeholder="Toronto"
              required
            />
            <FormField
              label="Province"
              value={newAddress.province}
              onChange={(value) => updateField('province', value)}
              placeholder="ON"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Country"
              value={newAddress.country}
              onChange={(value) => updateField('country', value)}
              placeholder="Canada"
              required
            />
            <FormField
              label="Postal Code"
              value={newAddress.postal}
              onChange={(value) => updateField('postal', value)}
              placeholder="M5V 3A8"
              required
            />
          </div>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-all duration-200"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 py-3 rounded-lg font-medium bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Adding..." : "Save Address"}
        </Button>
      </div>
    </div>
  );
}
