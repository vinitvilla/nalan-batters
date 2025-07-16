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

  // Ensure reCAPTCHA is only initialized once
  const setupRecaptcha = () => {
    if (!(window as unknown as Record<string, unknown>).recaptchaVerifier) {
      (window as unknown as Record<string, unknown>).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container", // Correct: container ID first
        { size: "invisible" },
      );
    }
    return (window as unknown as Record<string, unknown>).recaptchaVerifier as RecaptchaVerifier;
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
      if (onOtpSent) onOtpSent(confirmation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="block text-sm font-semibold text-gray-900 mb-3">
            Mobile Number
          </Label>
          <div className="flex items-center gap-3">
            <div className="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
              <span className="text-sm">🇺🇸</span>
              <span className="ml-2 text-sm">+1</span>
            </div>
            <Input
              type="tel"
              value={phone.replace(/^\+1/, "")}
              onChange={e => setPhone("+1" + e.target.value.replace(/[^0-9]/g, ""))}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all duration-200 text-base font-medium placeholder:text-gray-400"
              placeholder="(555) 123-4567"
              maxLength={10}
              required
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            We&apos;ll send you a verification code via SMS
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending OTP...</span>
            </div>
          ) : (
            <span>Continue with Phone Number</span>
          )}
        </Button>
      </form>
    </div>
  );
}
