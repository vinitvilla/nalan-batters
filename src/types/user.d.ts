import type { UserRole } from '@/generated/prisma';

// Base User type from Prisma model
export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string | null;
  role: UserRole;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User type for API responses and frontend usage
export interface UserResponse {
  id: string;
  phone: string;
  fullName: string;
  email?: string | null;
  role: UserRole;
  createdAt?: string; // Optional since not all API endpoints include timestamps
  updatedAt?: string; // Optional since not all API endpoints include timestamps
}

// User type with relationships
export interface UserWithAddresses extends User {
  addresses: Address[];
  defaultAddress?: Address;
}

// User creation/update types
export interface CreateUserData {
  phone: string;
  fullName: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  phone?: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
}

// User lookup types
export interface UserLookupRequest {
  phone: string;
}

export interface UserLookupResponse {
  success: boolean;
  user: UserResponse | null;
  message: string;
}

// POS-specific customer data (subset of User)
export interface PosCustomerData {
  phone?: string;
  name?: string;
  email?: string;
  userId?: string;
  isExistingUser?: boolean;
}

// Import Address type (will be defined in address.d.ts)
import type { Address } from './address';
