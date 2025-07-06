import { use, useState } from "react";
import { ConfirmationResult } from "firebase/auth";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { UserType } from "@/types/UserType";
import { useStore } from "zustand";

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    try {
      if (!confirmationResult) throw new Error("No OTP confirmation");
      const firebaseUser = await confirmationResult.confirm(otp);
      const token = await firebaseUser.user.getIdToken();
      userStore.getState().setToken(token);
      // After OTP is verified, check user in DB
      const res = await fetch(`/api/public/users?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) throw new Error("Failed to check user");
      const data = await res.json();
      if (data.user && data.user.id) {
        // Update user and address stores
        userStore.getState().setUser(data.user);
        if (data.addresses) {
          useAddressStore.getState().setAddresses(data.addresses);
        }
        if (data.defaultAddress) {
          useAddressStore.getState().setSelectedAddress(data.defaultAddress);
        }
        onUserFound({ id: data.user.id, phone: data.user.phone, fullName: data.user.fullName || "" });
      } else {
        userStore.getState().setId(firebaseUser.user.uid);
        useAddressStore.getState().setAddresses([]);
        useAddressStore.getState().setSelectedAddress(null);
        onUserNotFound();
      }
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
        onChange={val => setOtp(val)}
        maxLength={6}
        disabled={verifying}
      >
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
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
