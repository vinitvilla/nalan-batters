import { useState } from "react";
import { ConfirmationResult } from "firebase/auth";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { UserType } from "@/types/UserType";
import { USER_ROLE } from "@/constants/userRole";
import { useCartStore } from "@/store/cartStore";

export interface UserOtpStepProps {
  onUserFound: (user: UserType) => void;
  onUserNotFound: () => void;
  onBack: () => void;
  confirmationResult: ConfirmationResult | null;
}

export function UserOtpStep({ onUserFound, onUserNotFound, onBack, confirmationResult }: UserOtpStepProps) {
  const phone = userStore((s) => s.phone);
  const [otp, setOtp] = useState("123456");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Helper: Confirm OTP with Firebase ---
  const confirmOtp = async (otp: string) => {
    if (!confirmationResult) throw new Error("No OTP confirmation");
    const firebaseUser = await confirmationResult.confirm(otp);
    const token = await firebaseUser.user.getIdToken();
    userStore.getState().setToken(token);
    return firebaseUser;
  };

  // --- Helper: Fetch user from DB and hydrate stores ---
  const fetchAndHydrateUser = async (phone: string, firebaseUser: any) => {
    const res = await fetch(`/api/public/users?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) throw new Error("Failed to check user");
    const { user } = await res.json();
    if (user && user.id) {
      userStore.getState().setUser(user);
      if (user.addresses) useAddressStore.getState().setAddresses(user.addresses);
      if (user.defaultAddress) useAddressStore.getState().setSelectedAddress(user.defaultAddress);
      if (user.cart) {
        useCartStore.getState().setCartItems(
          user.cart.items.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          }))
        );
      }
      if (user.role) userStore.getState().setIsAdmin(user.role === USER_ROLE.ADMIN);
      onUserFound({ id: user.id, phone: user.phone, fullName: user.fullName || "", role: user.role });
    } else {
      userStore.getState().setId(firebaseUser.user.uid);
      useAddressStore.getState().setAddresses([]);
      useAddressStore.getState().setSelectedAddress(null);
      onUserNotFound();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      const firebaseUser = await confirmOtp(otp);
      await fetchAndHydrateUser(phone, firebaseUser);
    } catch (err: any) {
      setError(err.message || "Error verifying OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4 max-w-xs mx-auto">
      <Label>Enter OTP sent to {phone}</Label>
      <InputOTP
        value={otp}
        onChange={setOtp}
        maxLength={6}
        disabled={verifying}
      >
        {[...Array(6)].map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTP>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={verifying}>
          Back
        </Button>
        <Button type="submit" variant="default" disabled={verifying}>
          {verifying ? "Verifying..." : "Verify"}
        </Button>
      </div>
    </form>
  );
}
