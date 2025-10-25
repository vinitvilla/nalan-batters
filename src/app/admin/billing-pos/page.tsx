"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RequirePermission } from "@/components/PermissionWrapper";
import { useAdminApi } from "@/app/admin/use-admin-api";
import { usePosData } from '@/hooks/usePosData';
import { formatPhoneNumber, displayPhoneNumber } from '@/lib/utils/phoneUtils';
import type { PosCartItem, PosCustomerData, PosSaleRequest, UserSearchResponse, UserResponse } from '@/types';
import moment from 'moment';
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  CreditCard,
  DollarSign,
  Receipt,
  User,
  Search,
  Scan,
  Loader2,
  Edit
} from 'lucide-react';

export default function BillingPage() {
  const adminApiFetch = useAdminApi();
  const { data: posData, loading, error } = usePosData();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState<PosCustomerData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [phoneSearchResults, setPhoneSearchResults] = useState<UserResponse[]>([]);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [searchingByPhone, setSearchingByPhone] = useState(false);
  const [phoneSearchTimeout, setPhoneSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get products and categories from API data
  const products = posData?.products || [];
  const categories = posData?.categories || [];
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = ['all', ...categories.map(cat => cat.name)];

  // Get tax rate from config (handle 0% tax rate properly)
  const originalTaxRate = posData?.config?.taxRate !== undefined ? posData.config.taxRate : 0.13; // Default to 13% HST only if not configured
  const taxRate = posData?.config?.taxWaived ? 0 : originalTaxRate;
  const isTaxWaived = posData?.config?.taxWaived || false;

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (phoneSearchTimeout) {
        clearTimeout(phoneSearchTimeout);
      }
    };
  }, [searchTimeout, phoneSearchTimeout]);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  const originalTax = subtotal * originalTaxRate; // Original tax amount before waiving
  const discountAmount = subtotal * (discount / 100);
  const finalTotal = subtotal + tax - discountAmount;
  const changeAmount = receivedAmount ? Math.max(0, parseFloat(receivedAmount) - finalTotal) : 0;

  // Add item to cart
  const addToCart = (product: typeof products[0]) => {
    const price = parseFloat(product.price.toString());
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: price,
          quantity: 1,
          total: price
        }];
      }
    });
  };

  // Update cart item quantity
  const updateQuantity = (id: string, change: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0
            ? null
            : { ...item, quantity: newQuantity, total: newQuantity * item.price };
        }
        return item;
      }).filter(Boolean) as PosCartItem[]
    );
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Function to search users by name
  const searchUsersByName = async (name: string) => {
    if (name.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    setSearchingUsers(true);
    try {
      const response = await adminApiFetch(`/api/admin/users/search?q=${encodeURIComponent(name)}`);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      const result: UserSearchResponse = await response.json();
      
      if (result.success && result.users) {
        setSearchResults(result.users);
        setShowDropdown(result.users.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Function to search users by phone number
  const searchUsersByPhone = async (phone: string) => {
    // Need at least 3 digits to search
    if (phone.length < 3) {
      setPhoneSearchResults([]);
      setShowPhoneDropdown(false);
      return;
    }
    
    setSearchingByPhone(true);
    try {
      const response = await adminApiFetch(`/api/admin/users/search?q=${encodeURIComponent(phone)}`);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      const result: UserSearchResponse = await response.json();
      
      if (result.success && result.users) {
        // Filter results to only show users whose phone contains the search string
        const filteredUsers = result.users.filter(user => 
          user.phone.includes(phone) || 
          displayPhoneNumber(user.phone).includes(phone)
        );
        setPhoneSearchResults(filteredUsers);
        setShowPhoneDropdown(filteredUsers.length > 0);
      } else {
        setPhoneSearchResults([]);
        setShowPhoneDropdown(false);
      }
    } catch (error) {
      console.error('Error searching users by phone:', error);
      setPhoneSearchResults([]);
      setShowPhoneDropdown(false);
    } finally {
      setSearchingByPhone(false);
    }
  };

  // Debounced search handler
  const handleNameChange = (name: string) => {
    setCustomer((prev: PosCustomerData) => ({ 
      ...prev, 
      name,
      // Reset user data when name changes manually
      userId: undefined,
      isExistingUser: false
    }));

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchUsersByName(name);
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };

  // Select user from dropdown
  const selectUser = (user: UserResponse) => {
    setCustomer({
      name: user.fullName,
      phone: user.phone,
      userId: user.id,
      isExistingUser: true
    });
    setShowDropdown(false);
    setSearchResults([]);
    toast.success(`Selected customer: ${user.fullName}`);
  };

  // Select user from phone dropdown
  const selectUserByPhone = (user: UserResponse) => {
    setCustomer({
      name: user.fullName,
      phone: user.phone,
      userId: user.id,
      isExistingUser: true
    });
    setShowPhoneDropdown(false);
    setPhoneSearchResults([]);
    toast.success(`Selected customer: ${user.fullName}`);
  };

  // Handle phone number change (without automatic lookup)
  const handlePhoneChange = (phone: string) => {
    setCustomer((prev: PosCustomerData) => ({ 
      ...prev, 
      phone,
      // Reset user data when phone changes
      name: '',
      userId: undefined,
      isExistingUser: false
    }));

    // Clear existing timeout
    if (phoneSearchTimeout) {
      clearTimeout(phoneSearchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchUsersByPhone(phone);
    }, 300); // 300ms debounce

    setPhoneSearchTimeout(timeout);
  };

  // Function to unlock/edit customer data
  const unlockCustomer = () => {
    setCustomer((prev: PosCustomerData) => ({
      ...prev,
      isExistingUser: false,
      userId: undefined
    }));
    toast.info('Customer unlocked for editing');
  };

  // Get display format for phone number
  const getPhoneDisplayValue = () => {
    if (!customer.phone) return '';
    
    // If it's a standardized phone number, show formatted version
    const standardized = formatPhoneNumber(customer.phone);
    if (standardized && customer.isExistingUser) {
      return displayPhoneNumber(standardized);
    }
    
    return customer.phone;
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCustomer({});
    setReceivedAmount('');
    setDiscount(0);
    setSearchResults([]);
    setShowDropdown(false);
    setPhoneSearchResults([]);
    setShowPhoneDropdown(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    if (phoneSearchTimeout) {
      clearTimeout(phoneSearchTimeout);
    }
  };

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) return;
    
    const saleData: PosSaleRequest = {
      items: cart,
      customer,
      subtotal,
      tax,
      discount: discountAmount,
      total: finalTotal,
      paymentMethod,
      receivedAmount: paymentMethod === 'cash' ? parseFloat(receivedAmount) : finalTotal,
      change: changeAmount,
    };
    
    try {
      // Save sale to database
      const response = await adminApiFetch('/api/admin/pos/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });

      if (!response) {
        throw new Error('No response from server');
      }

      const result = await response.json();

      if (result.success) {
        // Show success message with order details
        const successMessage = customer.isExistingUser 
          ? `Order #${result.data.orderNumber} - Customer: ${customer.name} - Total: $${finalTotal.toFixed(2)} - Change: $${changeAmount.toFixed(2)}`
          : `Order #${result.data.orderNumber} - Total: $${finalTotal.toFixed(2)} - Change: $${changeAmount.toFixed(2)}`;
        
        toast.success('Payment Processed Successfully!', {
          description: successMessage,
          duration: 5000,
        });
        
        // Print receipt with order number
        // printReceipt(result.data.orderNumber);
        
        // Clear cart after successful payment
        clearCart();
      } else {
        toast.error('Payment Error', {
          description: `Error processing payment: ${result.error}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment Error', {
        description: 'Error processing payment. Please try again.',
        duration: 5000,
      });
    }
  };

  // Print receipt function
  const printReceipt = (orderNumber?: string) => {
    const receiptContent = `
      =============================
           RECEIPT
      =============================
      ${orderNumber ? `Order #${orderNumber}` : ''}
      Date: ${moment().format('MMMM Do YYYY, h:mm:ss a')}
      ${customer.name ? `Customer: ${customer.name}` : ''}
      ${customer.phone ? `Phone: ${displayPhoneNumber(customer.phone)}` : ''}
      
      -----------------------------
      ${cart.map(item => `${item.name}\n  ${item.quantity} x $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`).join('\n')}
      
      -----------------------------
      Subtotal: $${subtotal.toFixed(2)}
      ${discount > 0 ? `Discount (${discount}%): -$${discountAmount.toFixed(2)}` : ''}
      ${isTaxWaived ? `Tax (${Math.round(originalTaxRate * 100)}%): WAIVED ($${originalTax.toFixed(2)} → $0.00)` : `Tax (${Math.round(originalTaxRate * 100)}%): $${tax.toFixed(2)}`}
      
      TOTAL: $${finalTotal.toFixed(2)}
      
      Payment: ${paymentMethod.toUpperCase()}
      ${paymentMethod === 'cash' ? `Received: $${receivedAmount}\nChange: $${changeAmount.toFixed(2)}` : 'Card Payment Processed'}
      
      =============================
      Thank you for your business!
      =============================
    `;
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap;">${receiptContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <RequirePermission permission="billing">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading POS data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading POS data: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : (
      <div className="flex h-full max-h-screen bg-gray-50">
        
        {/* Product Selection Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Live Billing (POS)</h1>
                <p className="text-gray-700">Point of Sale system for walk-in customers</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" title="Barcode Scanner" className="border-gray-300 hover:bg-gray-100">
              <Scan className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Grid */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-black">{product.name}</h3>
                      <Badge variant="secondary" className="mb-2 bg-gray-100 text-gray-800">{product.category?.name}</Badge>
                      <p className="text-lg font-bold text-black">${parseFloat(product.price.toString()).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart and Checkout Area */}
        <div className="w-96 bg-white border-l shadow-lg flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Sale
              </h2>
              <Badge variant="outline">{cart.length} items</Badge>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Customer phone number"
                  value={getPhoneDisplayValue()}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onFocus={() => {
                    // Show dropdown if we have results
                    if (phoneSearchResults.length > 0 && !customer.isExistingUser) {
                      setShowPhoneDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding dropdown to allow click on items
                    setTimeout(() => setShowPhoneDropdown(false), 200);
                  }}
                  className={`border-gray-300 focus:border-black focus:ring-black ${customer.isExistingUser ? 'border-gray-500 bg-gray-50' : ''}`}
                  disabled={customer.isExistingUser}
                />
                {searchingByPhone && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
                {customer.isExistingUser && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <User className="h-4 w-4 text-gray-700" />
                  </div>
                )}
                
                {/* Phone Autocomplete Dropdown */}
                {showPhoneDropdown && phoneSearchResults.length > 0 && !customer.isExistingUser && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {phoneSearchResults.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => selectUserByPhone(user)}
                      >
                        <div className="font-medium text-sm text-black">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{displayPhoneNumber(user.phone)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Input
                  placeholder="Customer name"
                  value={customer.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => {
                    // Show dropdown if we have results
                    if (searchResults.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding dropdown to allow click on items
                    setTimeout(() => setShowDropdown(false), 200);
                  }}
                  className={`border-gray-300 focus:border-black focus:ring-black ${customer.isExistingUser ? 'border-gray-500 bg-gray-50' : ''}`}
                  disabled={customer.isExistingUser}
                />
                {searchingUsers && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
                {customer.isExistingUser && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <User className="h-4 w-4 text-gray-700" />
                  </div>
                )}
                
                {/* Autocomplete Dropdown */}
                {showDropdown && searchResults.length > 0 && !customer.isExistingUser && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => selectUser(user)}
                      >
                        <div className="font-medium text-sm text-black">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{displayPhoneNumber(user.phone)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {customer.isExistingUser && (
                <div className="flex items-center justify-between gap-2 text-sm text-gray-800 bg-gray-100 p-2 rounded-md border border-gray-300">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Existing customer found and linked to order</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={unlockCustomer}
                    className="h-6 px-2 text-xs hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
                    title="Edit customer information"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              )}
              
              {customer.phone && !customer.isExistingUser && customer.phone.length >= 10 && (
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-300">
                  <span>New customer - will be added to system</span>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-6">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items in cart</p>
                <p className="text-sm">Tap products to add them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-black">{item.name}</h4>
                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium text-black">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="hover:bg-gray-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-16 text-right font-medium text-black">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Checkout Area */}
          {cart.length > 0 && (
            <div className="p-6 border-t bg-white">
              {/* Discount */}
              <div className="mb-4">
                <label className="text-sm font-medium text-black">Discount %</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({Math.round(originalTaxRate * 100)}%)</span>
                  {isTaxWaived ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-400">${originalTax.toFixed(2)}</span>
                      <span className="text-gray-800 font-semibold">$0.00</span>
                    </div>
                  ) : (
                    <span>${tax.toFixed(2)}</span>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-black">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="cash" className="data-[state=active]:bg-black data-[state=active]:text-white">Cash</TabsTrigger>
                  <TabsTrigger value="card" className="data-[state=active]:bg-black data-[state=active]:text-white">Card</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cash" className="mt-4">
                  <Input
                    type="number"
                    placeholder="Amount received"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="mb-2 border-gray-300 focus:border-black focus:ring-black"
                  />
                  {receivedAmount && (
                    <p className="text-sm text-gray-700">
                      Change: <span className="font-bold text-black">${changeAmount.toFixed(2)}</span>
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="card" className="mt-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Ready for card payment
                  </p>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                >
                  Clear
                </Button>
                <Button 
                  onClick={processPayment}
                  disabled={paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < finalTotal)}
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${finalTotal.toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </RequirePermission>
  );
}
