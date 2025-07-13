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
    <div className="min-w-[180px]">
      <div className="flex items-center gap-3 px-2 py-2 border-b">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-700">
          {fullName ? fullName[0] : phoneNumber?.slice(-2) || "U"}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">{fullName || formatPhoneNumber(phoneNumber)}</span>
          <span className="text-xs text-gray-500">{formatPhoneNumber(phoneNumber)}</span>
        </div>
      </div>
      {isAdmin && (
        <Link href="/admin" passHref legacyBehavior>
          <DropdownMenuItem asChild onClick={onClose} className="cursor-pointer">
            <a>Admin Dashboard</a>
          </DropdownMenuItem>
        </Link>
      )}
      <Link href="/settings" passHref legacyBehavior>
        <DropdownMenuItem asChild onClick={onClose} className="cursor-pointer">
          <a>Settings</a>
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
