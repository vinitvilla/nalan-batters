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
      onRegistered({ id: data.user.id, phone: data.user.phone, fullName: data.user.fullName || fullName });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-xs mx-auto">
      <Label htmlFor="register-fullname">Name</Label>
      <Input
        id="register-fullname"
        type="text"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        placeholder="Enter your name"
        required
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={saving}>
          Back
        </Button>
        <Button type="submit" variant="default" className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  );
}
