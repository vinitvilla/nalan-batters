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
  // Increment this counter each time we navigate back to the phone step so that
  // React fully unmounts the previous <UserPhoneStep> (and its recaptcha-container
  // DOM node) before mounting a fresh one. This prevents the Firebase error:
  // "reCAPTCHA has already been rendered in this element".
  const [phoneStepKey, setPhoneStepKey] = useState(0);

  // Step 1: Enter phone, check DB, send OTP if needed
  if (step === "phone") {
    return (
      <UserPhoneStep
        key={phoneStepKey}
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
        onBack={() => { setPhoneStepKey((k) => k + 1); setStep("phone"); }}
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
