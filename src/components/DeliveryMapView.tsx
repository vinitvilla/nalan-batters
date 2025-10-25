"use client";

import { useState, useEffect, useCallback } from "react";
import { MapIcon, MapPin, User, Phone, Package } from "lucide-react";
import { Order } from "@/app/admin/orders/types";
import { useLoadScript, GoogleMap, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils/commonFunctions";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
    width: "100%",
    height: "100%"
};

const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

interface DeliveryMapViewProps {
    orders: Order[];
    title: string;
}

interface MarkerData {
    id: string;
    position: { lat: number; lng: number };
    orders: Order[]; // Changed to support multiple orders at same location
    address: string;
    originalOrder?: Order; // Keep track of the original order for backward compatibility
}

export default function DeliveryMapView({ orders, title }: DeliveryMapViewProps) {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 43.6532, lng: -79.3832 }); // Toronto default
    const [mapZoom, setMapZoom] = useState(10);
    const [geocodingService, setGeocodingService] = useState<google.maps.Geocoder | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    // Initialize geocoding service when maps is loaded
    useEffect(() => {
        if (isLoaded && window.google) {
            setGeocodingService(new window.google.maps.Geocoder());
        }
    }, [isLoaded]);

    // Geocode addresses and create markers
    const geocodeAddresses = useCallback(async () => {
        if (!geocodingService || !orders.length) return;

        setIsLoading(true);
        const validOrders = orders.filter(order => order.address?.street && order.address?.city);
        
        if (validOrders.length === 0) {
            setIsLoading(false);
            return;
        }

        try {
            // Group orders by address first
            const addressGroups = validOrders.reduce((acc, order) => {
                const address = `${order.address!.street}, ${order.address!.city}, ${order.address!.province || ''} ${order.address!.postal || ''}`.trim();
                if (!acc[address]) {
                    acc[address] = [];
                }
                acc[address].push(order);
                return acc;
            }, {} as Record<string, Order[]>);

            const markerPromises = Object.entries(addressGroups).map(async ([address, ordersAtAddress]) => {
                return new Promise<MarkerData | null>((resolve) => {
                    geocodingService.geocode({ address }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            const location = results[0].geometry.location;
                            const basePosition = {
                                lat: location.lat(),
                                lng: location.lng()
                            };

                            // If multiple orders at same address, create slightly offset markers
                            if (ordersAtAddress.length === 1) {
                                resolve({
                                    id: `${ordersAtAddress[0].id}`,
                                    position: basePosition,
                                    orders: ordersAtAddress,
                                    originalOrder: ordersAtAddress[0],
                                    address
                                });
                            } else {
                                // Create a single marker that represents multiple orders
                                resolve({
                                    id: `multi-${address.replace(/\s+/g, '-')}`,
                                    position: basePosition,
                                    orders: ordersAtAddress,
                                    originalOrder: ordersAtAddress[0], // Use first order for fallback
                                    address
                                });
                            }
                        } else {
                            console.warn(`Geocoding failed for address "${address}":`, status);
                            resolve(null);
                        }
                    });
                });
            });

            const markerResults = await Promise.all(markerPromises);
            const validMarkers = markerResults.filter(Boolean) as MarkerData[];
            
            setMarkers(validMarkers);

            // Set map center and zoom based on markers
            if (validMarkers.length > 0) {
                if (validMarkers.length === 1) {
                    setMapCenter(validMarkers[0].position);
                    setMapZoom(15);
                } else {
                    // Calculate bounds to fit all markers
                    const bounds = new window.google.maps.LatLngBounds();
                    validMarkers.forEach(marker => {
                        bounds.extend(marker.position);
                    });
                    
                    // Calculate center
                    const center = bounds.getCenter();
                    setMapCenter({ lat: center.lat(), lng: center.lng() });
                    setMapZoom(12);
                }
            }
        } catch (error) {
            console.error("Error geocoding addresses:", error);
        } finally {
            setIsLoading(false);
        }
    }, [geocodingService, orders]);

    useEffect(() => {
        geocodeAddresses();
    }, [geocodeAddresses]);

    const onMarkerClick = (marker: MarkerData) => {
        setSelectedMarker(marker);
    };

    const onInfoWindowClose = () => {
        setSelectedMarker(null);
    };

    const getMarkerIcon = (orders: Order[]) => {
        if (orders.length === 1) {
            const status = orders[0].status;
            const baseIcon = {
                path: window.google?.maps.SymbolPath.CIRCLE,
                scale: 8,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                fillOpacity: 1,
            };

            switch (status) {
                case 'PENDING':
                    return { ...baseIcon, fillColor: '#f59e0b' }; // yellow
                case 'CONFIRMED':
                    return { ...baseIcon, fillColor: '#3b82f6' }; // blue
                case 'SHIPPED':
                    return { ...baseIcon, fillColor: '#8b5cf6' }; // purple
                case 'DELIVERED':
                    return { ...baseIcon, fillColor: '#10b981' }; // green
                default:
                    return { ...baseIcon, fillColor: '#6b7280' }; // gray
            }
        } else {
            // Multiple orders - use a larger marker with count
            return {
                path: window.google?.maps.SymbolPath.CIRCLE,
                scale: 12,
                strokeWeight: 3,
                strokeColor: '#ffffff',
                fillColor: '#dc2626', // red for multiple orders
                fillOpacity: 1,
            };
        }
    };

    if (loadError) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <MapIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium text-lg">Map loading failed</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Error loading Google Maps
                    </p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 font-medium text-lg">Loading map...</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Initializing Google Maps
                    </p>
                </div>
            </div>
        );
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium text-lg">Map unavailable</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Google Maps API key not configured
                    </p>
                </div>
            </div>
        );
    }

    const validOrders = orders.filter(order => order.address?.street && order.address?.city);
    
    if (validOrders.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium text-lg">No delivery locations</p>
                    <p className="text-gray-500 text-sm mt-2">
                        No valid delivery addresses found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            {isLoading && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md z-10 border">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Loading delivery locations...</span>
                    </div>
                </div>
            )}
            
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={mapZoom}
                center={mapCenter}
                options={mapOptions}
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        onClick={() => onMarkerClick(marker)}
                        icon={isLoaded ? getMarkerIcon(marker.orders) : undefined}
                        title={marker.orders.length === 1 
                            ? `Order #${marker.orders[0].orderNumber || marker.orders[0].id.slice(-8)} - ${marker.orders[0].user?.fullName}`
                            : `${marker.orders.length} Orders at this location`
                        }
                        label={marker.orders.length > 1 ? { text: marker.orders.length.toString(), color: 'white', fontSize: '12px', fontWeight: 'bold' } : undefined}
                    />
                ))}

                {selectedMarker && (
                    <InfoWindow
                        position={selectedMarker.position}
                        onCloseClick={onInfoWindowClose}
                    >
                        <div className="p-2 max-w-sm">
                            {selectedMarker.orders.length === 1 ? (
                                // Single order info window
                                <>
                                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Order #{selectedMarker.orders[0].orderNumber || selectedMarker.orders[0].id.slice(-8)}
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-gray-500" />
                                            <span>{selectedMarker.orders[0].user?.fullName || 'Unknown'}</span>
                                        </div>
                                        
                                        {selectedMarker.orders[0].user?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-gray-500" />
                                                <span>{formatPhoneNumber(selectedMarker.orders[0].user.phone)}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs leading-relaxed">{selectedMarker.address}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="font-medium">{formatCurrency(selectedMarker.orders[0].total)}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                selectedMarker.orders[0].status === 'DELIVERED' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedMarker.orders[0].status === 'SHIPPED'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : selectedMarker.orders[0].status === 'CONFIRMED'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {selectedMarker.orders[0].status}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Multiple orders info window
                                <>
                                    <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        {selectedMarker.orders.length} Orders at this location
                                    </div>
                                    
                                    <div className="flex items-start gap-2 mb-3">
                                        <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs leading-relaxed">{selectedMarker.address}</span>
                                    </div>
                                    
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedMarker.orders.map((order, index) => (
                                            <div key={order.id} className="p-2 bg-gray-50 rounded border-l-2 border-blue-200">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium text-sm">#{order.orderNumber || order.id.slice(-8)}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                                        order.status === 'DELIVERED' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : order.status === 'SHIPPED'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : order.status === 'CONFIRMED'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-2.5 h-2.5" />
                                                        {order.user?.fullName || 'Unknown'}
                                                    </div>
                                                    {order.user?.phone && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Phone className="w-2.5 h-2.5" />
                                                            {formatPhoneNumber(order.user.phone)}
                                                        </div>
                                                    )}
                                                    <div className="mt-1 font-medium text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-2 border-t mt-2">
                                        <div className="text-sm font-medium text-gray-900">
                                            Total: {formatCurrency(selectedMarker.orders.reduce((sum, order) => {
                                                const orderTotal = typeof order.total === 'number' ? order.total : Number(order.total || 0);
                                                return sum + orderTotal;
                                            }, 0))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
