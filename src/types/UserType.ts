import { USER_ROLE } from "@/constants/userRole";

export interface UserType {
  id: string;
  phone: string;
  fullName: string;
  role: USER_ROLE;
  addresses?: any[];
  defaultAddress?: any;
}
