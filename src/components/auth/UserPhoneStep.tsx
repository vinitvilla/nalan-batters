import { UserType } from "@/types/UserType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userStore } from "@/store/userStore";
import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export interface UserPhoneStepProps {
  onOtpSent?: (confirmationResult: ConfirmationResult) => void;
}

export function UserPhoneStep({ onOtpSent }: UserPhoneStepProps) {
  const phone = userStore((s) => s.phone);
  const setPhone = userStore((s) => s.setPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Ensure reCAPTCHA is only initialized once
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container", // Correct: container ID first
        { size: "invisible" },
      );
    }
    return (window as any).recaptchaVerifier;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fullPhone = phone.startsWith("+1") ? phone : "+1" + phone;
      setPhone(fullPhone);
      const recaptchaVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier);
      setOtpSent(true);
      if (onOtpSent) onOtpSent(confirmation);
    } catch (err: any) {
      setError(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xs mx-auto">
      <div id="recaptcha-container" />
      <Label className="font-medium">Mobile Number</Label>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={"+1"}
          disabled
          className="w-12 bg-gray-100 text-gray-500 text-center"
          tabIndex={-1}
        />
        <Input
          type="tel"
          value={phone.replace(/^\+1/, "")}
          onChange={e => setPhone("+1" + e.target.value.replace(/[^0-9]/g, ""))}
          className="flex-1"
          placeholder="Enter mobile number"
          required
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending OTP..." : "Get OTP"}
      </Button>
    </form>
  );
}
