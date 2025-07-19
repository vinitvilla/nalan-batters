// Address types based on Prisma model
export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  province: string;
  country: string;
  postal: string;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Address for API responses
export interface AddressResponse {
  id: string;
  userId: string;
  street: string;
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
  city: string;
  province: string;
  country: string;
  postal: string;
}

export interface UpdateAddressData {
  street?: string;
  city?: string;
  province?: string;
  country?: string;
  postal?: string;
}
