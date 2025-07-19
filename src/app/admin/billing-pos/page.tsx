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
import { usePosData } from '@/hooks/usePosData';
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
  Loader2
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Customer {
  phone?: string;
  name?: string;
  email?: string;
}

export default function BillingPage() {
  const { data: posData, loading, error } = usePosData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [discount, setDiscount] = useState(0);

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
  const taxRate = posData?.config?.taxWaived ? 0 : (posData?.config?.taxRate || 0.13);
  const isTaxWaived = posData?.config?.taxWaived || false;

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
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
      }).filter(Boolean) as CartItem[]
    );
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCustomer({});
    setReceivedAmount('');
    setDiscount(0);
  };

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) return;
    
    const saleData = {
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
        alert(`Payment processed successfully!\nOrder #${result.data.orderNumber}\nTotal: $${finalTotal.toFixed(2)}\nChange: $${changeAmount.toFixed(2)}`);
        
        // Print receipt with order number
        printReceipt(result.data.orderNumber);
        
        // Clear cart after successful payment
        clearCart();
      } else {
        alert(`Error processing payment: ${result.error}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Error processing payment. Please try again.');
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
      ${customer.phone ? `Phone: ${customer.phone}` : ''}
      
      -----------------------------
      ${cart.map(item => `${item.name}\n  ${item.quantity} x $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`).join('\n')}
      
      -----------------------------
      Subtotal: $${subtotal.toFixed(2)}
      ${discount > 0 ? `Discount (${discount}%): -$${discountAmount.toFixed(2)}` : ''}
      ${isTaxWaived ? 'Tax: WAIVED' : `Tax (${Math.round(taxRate * 100)}%): $${tax.toFixed(2)}`}
      
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Billing (POS)</h1>
            <p className="text-gray-600">Point of Sale system for walk-in customers</p>
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
            <div className="space-y-2">
              <Input
                placeholder="Customer phone (optional)"
                value={customer.phone || ''}
                onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Customer name (optional)"
                value={customer.name || ''}
                onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
              />
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
                  <span>{isTaxWaived ? 'Tax (WAIVED):' : `Tax (${Math.round(taxRate * 100)}%):`}</span>
                  <span>{isTaxWaived ? 'WAIVED' : `$${tax.toFixed(2)}`}</span>
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
