"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    Map as MapIcon, 
    Navigation, 
    Clock, 
    Phone, 
    MapPin, 
    Package,
    Route,
    Truck
} from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";
import Map from "@/components/Map";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { userStore } from "@/store/userStore";
import { Order } from "../../orders/types";
import { toast } from "sonner";
import { formatCurrency, formatPhoneNumber, formatOrderId, formatDateOnly } from "@/lib/utils/commonFunctions";
import moment from "moment";

const libraries = ["places"] as ("places")[];

interface OrderInfo {
    id: string;
    customer: string;
    phone: string;
    total: number;
    deliveryDate: string | Date | null;
}

interface MapAddress extends google.maps.GeocoderResult {
    orderInfo: OrderInfo;
}

function DeliveryMapContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const adminApiFetch = useAdminApi();
    const token = userStore((s) => s.token);
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [mapAddresses, setMapAddresses] = useState<MapAddress[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStop, setSelectedStop] = useState<number | null>(null);
    
    const dateFilter = searchParams.get('date');
    const titleParam = searchParams.get('title') || 'Delivery Route';
    
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: libraries,
    });

    // ...existing useEffect hooks...

    // Fetch orders based on date filter
    useEffect(() => {
        if (!token || !dateFilter) return;
        
        adminApiFetch("/api/admin/orders")
            .then(res => res && res.json())
            .then(data => {
                const allOrders = (Array.isArray(data) ? data : data.orders || [])
                    .filter((order: Order) => order.deliveryDate && order.status !== 'CANCELLED')
                    .map((order: Order) => ({
                        ...order,
                        fullName: order.user?.fullName || "",
                        phone: order.user?.phone || "",
                    }));
                
                // Filter orders based on date
                const filteredOrders = filterOrdersByDate(allOrders, dateFilter);
                setOrders(filteredOrders);
            })
            .catch(() => toast.error("Failed to fetch delivery orders"));
    }, [token, dateFilter, adminApiFetch]);

    // Geocode addresses when orders change
    useEffect(() => {
        if (!isLoaded || !orders.length) {
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
                                deliveryDate: order.deliveryDate || null
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
    }, [isLoaded, orders]);

    const filterOrdersByDate = (ordersList: Order[], dateFilter: string) => {
        const today = moment();
        const todayString = today.format('YYYY-MM-DD');
        const tomorrowString = moment().add(1, 'day').format('YYYY-MM-DD');

        switch (dateFilter) {
            case 'today':
                return ordersList.filter(order => {
                    const deliveryDateString = getDeliveryDateString(order.deliveryDate);
                    return deliveryDateString === todayString;
                });
            case 'tomorrow':
                return ordersList.filter(order => {
                    const deliveryDateString = getDeliveryDateString(order.deliveryDate);
                    return deliveryDateString === tomorrowString;
                });
            case 'week':
                const startOfWeek = moment().startOf('week');
                const endOfWeek = moment().endOf('week');
                
                return ordersList.filter(order => {
                    const deliveryDateString = getDeliveryDateString(order.deliveryDate);
                    const deliveryDate = moment(deliveryDateString);
                    return deliveryDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
                });
            default:
                return ordersList;
        }
    };

    const getDateString = (date: Date | moment.Moment) => {
        return moment(date).format('YYYY-MM-DD');
    };

    const getDeliveryDateString = (deliveryDate: string | Date | null | undefined) => {
        if (!deliveryDate) return '';
        if (typeof deliveryDate === 'string' && deliveryDate.includes('T')) {
            return deliveryDate.split('T')[0];
        }
        return moment(deliveryDate).format('YYYY-MM-DD');
    };

    // Calculate route statistics
    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = Number(order.total) || 0;
        return sum + orderTotal;
    }, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    if (loadError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" onClick={() => router.back()} className="shadow-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
                    </div>
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-8 text-center">
                            <div className="text-red-500 mb-2">
                                <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            </div>
                            <p className="text-red-600 font-medium">Error loading Google Maps</p>
                            <p className="text-gray-500 text-sm mt-2">Please check your internet connection and try again.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" onClick={() => router.back()} className="shadow-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
                    </div>
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-8 text-center">
                            <div className="animate-pulse mb-4">
                                <MapIcon className="w-12 h-12 mx-auto text-blue-400" />
                            </div>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading Google Maps...</p>
                            <p className="text-gray-500 text-sm mt-2">Preparing your delivery route</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => router.back()} className="shadow-sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{titleParam}</h1>
                                    <p className="text-sm text-gray-600">
                                        {orders.length} {orders.length === 1 ? 'delivery' : 'deliveries'} • Starting from Scarborough, ON
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{orders.length}</div>
                                <div className="text-xs text-gray-500">Stops</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                                <div className="text-xs text-gray-500">Total Value</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{formatCurrency(averageOrderValue)}</div>
                                <div className="text-xs text-gray-500">Avg Order</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
                    {/* Sidebar with delivery list */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Route Summary Card */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Route className="w-5 h-5 text-blue-600" />
                                    Route Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                                        <div className="text-lg font-bold text-blue-600">{mapAddresses.length}</div>
                                        <div className="text-xs text-blue-700">Total Stops</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                        <div className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                                        <div className="text-xs text-green-700">Revenue</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Navigation className="w-4 h-4" />
                                    <span>Optimized route with traffic data</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Stops List */}
                        <Card className="shadow-lg border-0 flex-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="w-5 h-5 text-green-600" />
                                    Delivery Stops
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto">
                                    {isGeocoding ? (
                                        <div className="p-6 text-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                            <p className="text-sm text-gray-500">Geocoding addresses...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-red-500">{error}</p>
                                        </div>
                                    ) : mapAddresses.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No valid addresses found</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {mapAddresses.map((addr, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                                                        selectedStop === index ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                                    }`}
                                                    onClick={() => setSelectedStop(index === selectedStop ? null : index)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                            ${index === 0 ? 'bg-green-100 text-green-700' : 
                                                              index === mapAddresses.length - 1 ? 'bg-red-100 text-red-700' : 
                                                              'bg-blue-100 text-blue-700'}
                                                        `}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">
                                                                {addr.orderInfo.customer}
                                                            </div>
                                                            <div className="text-sm text-gray-600 truncate">
                                                                {addr.formatted_address}
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {formatOrderId(addr.orderInfo.id)}
                                                                </Badge>
                                                                <span className="text-sm font-medium text-green-600">
                                                                    {formatCurrency(addr.orderInfo.total)}
                                                                </span>
                                                            </div>
                                                            {selectedStop === index && (
                                                                <div className="mt-3 pt-3 border-t space-y-2">
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                        <Phone className="w-4 h-4" />
                                                                        {formatPhoneNumber(addr.orderInfo.phone)}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                        <Clock className="w-4 h-4" />
                                                                        {addr.orderInfo.deliveryDate 
                                                                            ? formatDateOnly(addr.orderInfo.deliveryDate)
                                                                            : 'No delivery date'
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Map Area */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-lg border-0 h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapIcon className="w-5 h-5 text-blue-600" />
                                        Interactive Route Map
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-80px)] p-0">
                                {isGeocoding ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                            <p className="text-gray-600 font-medium">Generating optimal route...</p>
                                            <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MapIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                            <p className="text-red-500 font-medium">{error}</p>
                                            <Button 
                                                variant="outline" 
                                                className="mt-4"
                                                onClick={() => window.location.reload()}
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    </div>
                                ) : mapAddresses.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No addresses to map</p>
                                            <p className="text-gray-400 text-sm mt-2">Add delivery addresses to see the route</p>
                                        </div>
                                    </div>
                                ) : mapAddresses.length === 1 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center max-w-md">
                                            <Route className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                            <p className="text-gray-600 font-medium mb-4">Single delivery location</p>
                                            <Card className="p-4 bg-yellow-50 border-yellow-200">
                                                <p className="font-medium text-gray-900">{mapAddresses[0].orderInfo.customer}</p>
                                                <p className="text-sm text-gray-600 mt-1">{mapAddresses[0].formatted_address}</p>
                                                <Badge className="mt-2">{formatOrderId(mapAddresses[0].orderInfo.id)}</Badge>
                                            </Card>
                                            <p className="text-gray-500 text-sm mt-4">Route optimization requires at least 2 addresses</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full">
                                        <DeliveryRouteMap addresses={mapAddresses} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryMapPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96">Loading map...</div>}>
            <DeliveryMapContent />
        </Suspense>
    );
}

function DeliveryRouteMap({ addresses }: { addresses: MapAddress[] }) {
    // Use first address as origin, last as destination, rest as waypoints
    const origin = addresses[0];
    const destination = addresses[addresses.length - 1];
    const waypoints = addresses.slice(1, -1);

    return (
        <div className="h-full w-full">
            <Map 
                origin={origin}
                destination={destination}
                waypoints={waypoints}
            />
        </div>
    );
}
