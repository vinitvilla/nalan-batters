import { z } from 'zod';

// --- Cart Schemas ---
export const CartItemSchema = z.object({
  productId: z.string().uuid().optional(),
  id: z.string().uuid().optional(), // For backward compatibility
  quantity: z.number().int().positive(),
  price: z.number().optional(), // Sometimes passed from frontend, but should be verified on backend
}).refine(data => data.productId || data.id, {
  message: "Either productId or id must be provided"
});

export const CartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  items: z.array(CartItemSchema),
  merge: z.boolean().optional(),
});

// --- Contact Schema ---
export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(), // Optional since mobile is primary
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// --- Order Schema ---
export const OrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  addressId: z.string().optional(), // Optional for pickup orders
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, "Order must have at least one item"),
  promoCodeId: z.string().nullable().optional(),
  deliveryDate: z.string().optional(),
  orderType: z.enum(['POS', 'ONLINE']).optional(), // Order source
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).optional(), // Delivery method
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE']).optional(),
});
