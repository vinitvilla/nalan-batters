import { Button } from "@/components/ui/button";
import Link from "next/link";
import { userStore } from "@/store/userStore";
import { useSignOut } from "@/hooks/useSignOut";

export default function UserDropdown({ onClose }: { onClose?: () => void }) {
  const user = userStore((s) => s.user);
  const phoneNumber = userStore((s) => s.phone);
  const fullName = userStore((s) => s.fullName);
  const signOut = useSignOut();
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50 p-2">
      <div className="flex items-center gap-3 px-2 py-2 border-b">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-700">
          {fullName ? fullName[0] : phoneNumber?.slice(-2) || "U"}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">{fullName || phoneNumber}</span>
          <span className="text-xs text-gray-500">{phoneNumber}</span>
        </div>
      </div>
      <Link href="/settings">
        <Button variant="ghost" className="w-full text-left cursor-pointer px-2 py-2" onClick={onClose}>
          Settings
        </Button>
      </Link>
      <Button
        variant="ghost"
        className="w-full text-left cursor-pointer px-2 py-2 text-red-600 hover:bg-red-50"
        onClick={() => {
          onClose && onClose();
          signOut();
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}
