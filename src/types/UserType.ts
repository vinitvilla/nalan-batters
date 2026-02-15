/**
 * @deprecated Use User or UserResponse from '@/types/user' instead
 * This type is kept temporarily for backward compatibility.
 * Will be removed in Phase 2 of the type system refactoring.
 */
export interface UserType {
  id: string;
  phone: string;
  fullName: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}
