"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Map as MapIcon } from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";
import Map from "@/components/Map";
import { Order } from "@/app/admin/orders/types";

const libraries = ["places"];

interface DeliveryMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    title: string;
}

export default function DeliveryMapModal({ isOpen, onClose, orders, title }: DeliveryMapModalProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: libraries as any,
    });

    const [mapAddresses, setMapAddresses] = useState<(google.maps.GeocoderResult & { orderInfo: any })[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !isLoaded || !orders.length) {
            setMapAddresses([]);
            setError(null);
            return;
        }

        const geocodeAddresses = async () => {
            setIsGeocoding(true);
            setError(null);
            
            try {
                const geocoder = new window.google.maps.Geocoder();
                const geocodedAddresses = [];

                for (const order of orders) {
                    if (!order.address?.street || !order.address?.city) continue;

                    const addressString = `${order.address.street}, ${order.address.city}, ${order.address.province || ''} ${order.address.postal || ''}`.trim();
                    
                    try {
                        const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
                            geocoder.geocode({ address: addressString }, (results, status) => {
                                if (status === 'OK' && results?.[0]) {
                                    resolve(results[0]);
                                } else {
                                    reject(new Error(`Geocoding failed for ${addressString}: ${status}`));
                                }
                            });
                        });

                        geocodedAddresses.push({
                            ...result,
                            orderInfo: {
                                id: order.id,
                                customer: order.user.fullName,
                                phone: order.user.phone,
                                total: order.total,
                                deliveryDate: order.deliveryDate
                            }
                        });
                    } catch (error) {
                        console.warn('Geocoding failed for address:', addressString, error);
                    }
                }

                if (geocodedAddresses.length === 0) {
                    setError("No valid addresses could be geocoded");
                } else {
                    setMapAddresses(geocodedAddresses);
                }
            } catch (error) {
                console.error('Error in geocoding process:', error);
                setError('Failed to geocode addresses');
            } finally {
                setIsGeocoding(false);
            }
        };

        geocodeAddresses();
    }, [isOpen, isLoaded, orders]);

    if (loadError) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapIcon className="w-5 h-5" />
                            {title} - Route Map
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <p className="text-red-500">Error loading Google Maps</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!isLoaded) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapIcon className="w-5 h-5" />
                            {title} - Route Map
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading Google Maps...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapIcon className="w-5 h-5" />
                        {title} - Route Map
                    </DialogTitle>
                </DialogHeader>
                
                {isGeocoding ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-500">Geocoding addresses for optimal route...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : mapAddresses.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No valid addresses found for mapping</p>
                    </div>
                ) : mapAddresses.length === 1 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Only one address found. Route mapping requires at least 2 addresses.</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">{mapAddresses[0].orderInfo.customer}</p>
                            <p className="text-sm text-gray-600">{mapAddresses[0].formatted_address}</p>
                        </div>
                    </div>
                ) : (
                    <DeliveryRouteMap addresses={mapAddresses} />
                )}
            </DialogContent>
        </Dialog>
    );
}

function DeliveryRouteMap({ addresses }: { addresses: (google.maps.GeocoderResult & { orderInfo: any })[] }) {
    // Use first address as origin, last as destination, rest as waypoints
    const origin = addresses[0];
    const destination = addresses[addresses.length - 1];
    const waypoints = addresses.slice(1, -1);

    return (
        <div>
            <div className="mb-4">
                <h3 className="font-medium mb-2">Delivery Route ({addresses.length} stops)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm max-h-32 overflow-y-auto">
                    {addresses.map((addr, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-medium">{index + 1}. {addr.orderInfo.customer}</span>
                            <div className="text-gray-600 truncate">{addr.formatted_address}</div>
                            <div className="text-gray-500 text-xs">Order: {addr.orderInfo.id}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            <Map 
                origin={origin}
                destination={destination}
                waypoints={waypoints}
            />
        </div>
    );
}
