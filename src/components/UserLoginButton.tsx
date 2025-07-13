import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User2 } from "lucide-react";
import Link from "next/link";
import { userStore } from "@/store/userStore";
import UserDropdown from "@/components/UserDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserLoginButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = userStore((s) => s.user);

  return (
    <div className="relative">
      {user ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="User menu"
            className="cursor-pointer"
            onClick={() => setShowDropdown((v) => !v)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={""}
                alt={user.fullName || user.phone || "User"}
              />
              <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                {user.fullName ? user.fullName[0] : user.phone?.slice(-2) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
          {showDropdown && (
            <UserDropdown onClose={() => setShowDropdown(false)} />
          )}
        </>
      ) : (
        <Link href="/signin" aria-label="Sign in">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <User2 className="w-6 h-6 text-gray-400" />
          </Button>
        </Link>
      )}
    </div>
  );
}
