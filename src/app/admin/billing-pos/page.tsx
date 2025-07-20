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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RequirePermission } from "@/components/PermissionWrapper";
import { usePosData } from '@/hooks/usePosData';
import { formatPhoneNumber, displayPhoneNumber } from '@/lib/utils/phoneUtils';
import type { PosCartItem, PosCustomerData, PosSaleRequest, UserLookupResponse } from '@/types';
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
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

export default function BillingPage() {
  const { data: posData, loading, error } = usePosData();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState<PosCustomerData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lookingUpUser, setLookingUpUser] = useState(false); // Loading state for user lookup
  
  // Alert state management
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>>([]);

  // Helper functions for alerts
  const addAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { id, type, title, message }]);
    // Auto-dismiss success and info alerts after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
      }, 5000);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

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

  // Get tax rate from config (default to 13% HST)
  const originalTaxRate = posData?.config?.taxRate || 0.13; // Original rate before waiving
  const taxRate = posData?.config?.taxWaived ? 0 : originalTaxRate;
  const isTaxWaived = posData?.config?.taxWaived || false;

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

  // Function to look up user by phone number
  const lookupUserByPhone = async (phone: string) => {
    // Validate and format phone number
    const standardizedPhone = formatPhoneNumber(phone);
    if (!standardizedPhone) {
      addAlert('error', 'Invalid Phone Number', 'Please enter a valid phone number (10 digits minimum)');
      return;
    }
    
    setLookingUpUser(true);
    try {
      const response = await fetch('/api/admin/users/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phone })
      });

      const result: UserLookupResponse = await response.json();
      
      if (result.success && result.user) {
        // User found - auto-populate customer info
        setCustomer((prev: PosCustomerData) => ({
          ...prev,
          name: result.user!.fullName,
          userId: result.user!.id,
          isExistingUser: true,
          phone: standardizedPhone // Store in standardized format
        }));
        
        // Show success feedback if phone was standardized
        if (result.message.includes('standardized')) {
          addAlert('info', 'Phone Number Updated', 'Phone number was updated to standard format');
        }
        addAlert('success', 'Customer Found', `Found existing customer: ${result.user!.fullName}`);
      } else {
        // User not found - show feedback and clear auto-populated data
        setCustomer((prev: PosCustomerData) => ({
          ...prev,
          name: '',
          userId: undefined,
          isExistingUser: false,
          phone: standardizedPhone // Still store in standardized format
        }));
        addAlert('warning', 'Customer Not Found', 'Customer not found. You can enter their name manually to create a new customer account.');
      }
    } catch (error) {
      console.error('Error looking up user:', error);
      // Reset user data on error
      setCustomer((prev: PosCustomerData) => ({
        ...prev,
        name: '',
        userId: undefined,
        isExistingUser: false
      }));
      addAlert('error', 'Lookup Error', 'Error looking up customer. Please try again.');
    } finally {
      setLookingUpUser(false);
    }
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
  };

  // Manual lookup function triggered by button
  const handleManualLookup = () => {
    if (customer.phone) {
      lookupUserByPhone(customer.phone);
    }
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
    clearAllAlerts(); // Clear alerts when cart is cleared
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
      const response = await fetch('/api/admin/pos/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message with order details
        const successTitle = 'Payment Processed Successfully!';
        const successMessage = customer.isExistingUser 
          ? `Order #${result.data.orderNumber}\nCustomer: ${customer.name}\nTotal: $${finalTotal.toFixed(2)}\nChange: $${changeAmount.toFixed(2)}`
          : `Order #${result.data.orderNumber}\nTotal: $${finalTotal.toFixed(2)}\nChange: $${changeAmount.toFixed(2)}`;
        
        addAlert('success', successTitle, successMessage);
        
        // Print receipt with order number
        // printReceipt(result.data.orderNumber);
        
        // Clear cart after successful payment
        clearCart();
      } else {
        addAlert('error', 'Payment Error', `Error processing payment: ${result.error}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      addAlert('error', 'Payment Error', 'Error processing payment. Please try again.');
    }
  };

  // Print receipt function
  const printReceipt = (orderNumber?: string) => {
    const receiptContent = `
      =============================
           RECEIPT
      =============================
      ${orderNumber ? `Order #${orderNumber}` : ''}
      Date: ${new Date().toLocaleString()}
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
        
        {/* Alert Container - Fixed position at top */}
        {alerts.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                variant={alert.type === 'error' ? 'destructive' : 'default'}
                className={`shadow-lg border-l-4 ${
                  alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
                  alert.type === 'error' ? 'border-l-red-500' :
                  alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start gap-2">
                    {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                    {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                    {alert.type === 'info' && <Search className="h-4 w-4 text-blue-600 mt-0.5" />}
                    <div>
                      <AlertTitle className={`text-sm font-semibold ${
                        alert.type === 'success' ? 'text-green-800' :
                        alert.type === 'error' ? 'text-red-800' :
                        alert.type === 'warning' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {alert.title}
                      </AlertTitle>
                      <AlertDescription className={`text-xs whitespace-pre-line ${
                        alert.type === 'success' ? 'text-green-700' :
                        alert.type === 'error' ? 'text-red-700' :
                        alert.type === 'warning' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {alert.message}
                      </AlertDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAlert(alert.id)}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Product Selection Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Billing (POS)</h1>
                <p className="text-gray-600">Point of Sale system for walk-in customers</p>
              </div>
              {alerts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllAlerts}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Alerts ({alerts.length})
                </Button>
              )}
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
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
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
            <Button variant="outline" size="icon" title="Barcode Scanner">
              <Scan className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Grid */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <Badge variant="secondary" className="mb-2">{product.category?.name}</Badge>
                      <p className="text-lg font-bold text-green-600">${parseFloat(product.price.toString()).toFixed(2)}</p>
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
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Customer phone number"
                    value={getPhoneDisplayValue()}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`${customer.isExistingUser ? 'border-green-500 bg-green-50' : ''}`}
                  />
                  {lookingUpUser && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualLookup}
                  disabled={!customer.phone || customer.phone.length < 10 || lookingUpUser}
                  className="px-3 flex items-center gap-1 whitespace-nowrap"
                  title="Look up existing customer by phone number"
                >
                  <Search className="h-4 w-4" />
                  Look Up
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  placeholder="Customer name"
                  value={customer.name || ''}
                  onChange={(e) => setCustomer((prev: PosCustomerData) => ({ ...prev, name: e.target.value }))}
                  className={`${customer.isExistingUser ? 'border-green-500 bg-green-50' : ''}`}
                  disabled={customer.isExistingUser}
                />
                {customer.isExistingUser && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
              
              {customer.isExistingUser && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  <User className="h-4 w-4" />
                  <span>Existing customer found and linked to order</span>
                </div>
              )}
              
              {customer.phone && !customer.isExistingUser && !lookingUpUser && customer.phone.length >= 10 && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
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
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-16 text-right font-medium">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Checkout Area */}
          {cart.length > 0 && (
            <div className="p-6 border-t bg-gray-50">
              {/* Discount */}
              <div className="mb-4">
                <label className="text-sm font-medium">Discount %</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({Math.round(originalTaxRate * 100)}%)</span>
                  {isTaxWaived ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-red-500">${originalTax.toFixed(2)}</span>
                      <span className="text-green-600 font-semibold">$0.00</span>
                    </div>
                  ) : (
                    <span>${tax.toFixed(2)}</span>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cash">Cash</TabsTrigger>
                  <TabsTrigger value="card">Card</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cash" className="mt-4">
                  <Input
                    type="number"
                    placeholder="Amount received"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="mb-2"
                  />
                  {receivedAmount && (
                    <p className="text-sm text-gray-600">
                      Change: <span className="font-bold">${changeAmount.toFixed(2)}</span>
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="card" className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Ready for card payment
                  </p>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button 
                  onClick={processPayment}
                  disabled={paymentMethod === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < finalTotal)}
                  className="flex-1"
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
