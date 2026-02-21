// Address types based on Prisma model
export interface Address {
  id: string;
  userId: string;
  street: string;
  unit?: string | null;
  city: string;
  province: string;
  country: string;
  postal: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Address for API responses
export interface AddressResponse {
  id: string;
  userId: string;
  street: string;
  unit?: string | null;
  city: string;
  province: string;
  country: string;
  postal: string;
  createdAt: string;
  updatedAt: string;
}

// Address creation/update types
export interface CreateAddressData {
  street: string;
  unit?: string;
  city: string;
  province: string;
  country: string;
  postal: string;
}

export interface UpdateAddressData {
  street?: string;
  unit?: string;
  city?: string;
  province?: string;
  country?: string;
  postal?: string;
}
