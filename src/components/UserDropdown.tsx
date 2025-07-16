import Link from "next/link";
import { userStore } from "@/store/userStore";
import { useSignOut } from "@/hooks/useSignOut";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatPhoneNumber } from "@/lib/utils/commonFunctions";

export default function UserDropdown({ onClose }: { onClose?: () => void }) {
  const user = userStore((s) => s.user);
  const isAdmin = userStore((s) => s.isAdmin);
  const phoneNumber = userStore((s) => s.phone);
  const fullName = userStore((s) => s.fullName);
  const signOut = useSignOut();
  return (
    <div className="min-w-[180px] bg-white">
      <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-700">
          {fullName ? fullName[0] : phoneNumber?.slice(-2) || "U"}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">{fullName || formatPhoneNumber(phoneNumber)}</span>
          <span className="text-xs text-gray-500">{formatPhoneNumber(phoneNumber)}</span>
        </div>
      </div>
      {isAdmin && (
        <Link href="/admin">
          <DropdownMenuItem onClick={onClose} className="cursor-pointer hover:bg-orange-50 text-orange-700 font-semibold bg-orange-25 border-l-4 border-orange-400">
            ⚡ Admin Dashboard
          </DropdownMenuItem>
        </Link>
      )}
      <Link href="/settings">
        <DropdownMenuItem onClick={onClose} className="cursor-pointer hover:bg-gray-50 text-gray-700">
          Settings
        </DropdownMenuItem>
      </Link>
      <DropdownMenuItem
        onClick={() => {
          onClose && onClose();
          signOut();
        }}
        className="cursor-pointer text-red-600 hover:bg-red-50"
      >
        Sign Out
      </DropdownMenuItem>
    </div>
  );
}
