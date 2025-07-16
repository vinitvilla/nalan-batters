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
  const fetchAndHydrateUser = async (phone: string, firebaseUser: { user: { uid: string } }) => {
    const res = await fetch(`/api/public/users?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) throw new Error("Failed to check user");
    const { user } = await res.json();
    if (user && user.id) {
      userStore.getState().setUser(user);
      if (user.addresses) useAddressStore.getState().setAddresses(user.addresses);
      if (user.defaultAddress) useAddressStore.getState().setSelectedAddress(user.defaultAddress);
      if (user.cart) {
        useCartStore.getState().setCartItems(
          user.cart.items.map((item: { product: { id: string; name: string; price: number; image?: string }; quantity: number }) => ({
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error verifying OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
          <span className="text-2xl">📱</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Verify Your Phone Number
        </h3>
        <p className="text-gray-600 text-sm">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-gray-900">{phone}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <Label className="block text-sm font-semibold text-gray-900 mb-4 text-center">
            Enter Verification Code
          </Label>
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={verifying}
              className="gap-3"
            >
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot 
                  key={i} 
                  index={i} 
                  className="w-12 h-12 text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all duration-200"
                />
              ))}
            </InputOTP>
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            Didn&apos;t receive the code? Check your messages or try again
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            disabled={verifying || otp.length !== 6}
          >
            {verifying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Verify & Continue</span>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack} 
            disabled={verifying}
            className="w-full py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Change Phone Number
          </Button>
        </div>
      </form>
    </div>
  );
}
