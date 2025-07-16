import { UserType } from "@/types/UserType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { userStore } from "@/store/userStore";
import { useState } from "react";

export interface UserRegisterStepProps {
  onRegistered: (user: UserType) => void;
  onBack: () => void;
}

export function UserRegisterStep({ onRegistered, onBack }: UserRegisterStepProps) {
  const phone = userStore((s) => s.phone);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/public/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userStore.getState().id || null,
          phone,
          fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.user?.id) throw new Error(data.error || "Registration failed");
      onRegistered({
        id: data.user.id,
        phone: data.user.phone,
        fullName: data.user.fullName || fullName,
        role: data.user.role, // Ensure the backend returns 'role'
        addresses: data.user.addresses,
        defaultAddress: data.user.defaultAddress,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
          <span className="text-2xl">👋</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Welcome to Nalan Batters!
        </h3>
        <p className="text-gray-600 text-sm">
          Let&apos;s create your account to get started
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

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <Label 
            htmlFor="register-fullname" 
            className="block text-sm font-semibold text-gray-900 mb-3"
          >
            Your Full Name
          </Label>
          <Input
            id="register-fullname"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all duration-200 text-base font-medium placeholder:text-gray-400"
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            This name will be used for delivery confirmations
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            disabled={saving || !fullName.trim()}
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <span>Create Account & Continue</span>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack} 
            disabled={saving}
            className="w-full py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Back to Verification
          </Button>
        </div>
      </form>
    </div>
  );
}
