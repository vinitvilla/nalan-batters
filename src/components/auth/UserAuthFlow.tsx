import { useState } from "react";
import { UserPhoneStep } from "./UserPhoneStep";
import { UserOtpStep } from "./UserOtpStep";
import { UserRegisterStep } from "./UserRegisterStep";
import { UserType } from "@/types/UserType";
import { userStore } from "@/store/userStore";
import { ConfirmationResult } from "firebase/auth";
import { useCartStore } from "@/store/cartStore";

export interface UserAuthFlowProps {
  onSuccess: (user: UserType) => void;
  initialPhone?: string;
}

export function UserAuthFlow({ onSuccess, initialPhone = "" }: UserAuthFlowProps) {
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const phone = userStore((s) => s.phone);
  const [userId, setUserId] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Step 1: Enter phone, check DB, send OTP if needed
  if (step === "phone") {
    return (
      <UserPhoneStep
        onOtpSent={(cr) => {
          setConfirmationResult(cr);
          setStep("otp");
        }}
      />
    );
  }
  // Step 2: OTP verification
  if (step === "otp") {
    return (
      <UserOtpStep
        confirmationResult={confirmationResult}
        onUserFound={(user: UserType) => {
          setUserId(user.id);
          setUserExists(true);
          // fetchAndMergeCart removed as per new cart logic
          onSuccess({ id: user.id, phone: user.phone, fullName: user.fullName || "", role: user.role });
        }}
        onUserNotFound={ () => {
          setUserExists(false);
          setStep("register");
        }}
        onBack={() => setStep("phone")}
      />
    );
  }
  // Step 3: Register (name/address)
  if (step === "register") {
    return (
      <UserRegisterStep
        onRegistered={(user) => {
          userStore.getState().setUser({ id: user.id, phone: user.phone, fullName: user.fullName, role: user.role });
          onSuccess({ id: user.id, phone: user.phone, fullName: user.fullName || "", role: user.role });
        }}
        onBack={() => setStep("otp")}
      />
    );
  }
  return null;
}
