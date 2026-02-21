import { useState } from "react";
import { UserPhoneStep } from "./UserPhoneStep";
import { UserOtpStep } from "./UserOtpStep";
import { UserRegisterStep } from "./UserRegisterStep";
import { UserResponse } from "@/types/user";
import { userStore } from "@/store/userStore";
import { ConfirmationResult } from "firebase/auth";

export interface UserAuthFlowProps {
  onSuccess: (user: UserResponse) => void;
  initialPhone?: string;
}

export function UserAuthFlow({ onSuccess }: UserAuthFlowProps) {
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
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
        onUserFound={(user: UserResponse) => {
          onSuccess(user);
        }}
        onUserNotFound={() => {
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
          userStore.getState().setUser(user);
          onSuccess(user);
        }}
        onBack={() => setStep("otp")}
      />
    );
  }
  return null;
}
