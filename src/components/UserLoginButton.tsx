import { User2 } from "lucide-react";
import Link from "next/link";
import { userStore } from "@/store/userStore";
import UserDropdown from "@/components/UserDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

export default function UserLoginButton() {
  const user = userStore((s) => s.user);

  return (
    <div className="relative">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10 cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-yellow-200 hover:border-yellow-300">
              <AvatarImage
                src={""}
                alt={user.fullName || user.phone || "User"}
              />
              <AvatarFallback className="bg-yellow-100 text-yellow-700 text-xl font-bold border-2 border-yellow-300">
                {user.fullName ? user.fullName[0] : user.phone?.slice(-2) || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] bg-white/95 shadow-xl">
            <UserDropdown />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/signin" aria-label="Sign in">
          <Button variant="ghost" size="icon" className="cursor-pointer hover:bg-yellow-100/50 hover:scale-105 transition-all duration-200 border-2 border-yellow-200 hover:border-yellow-300">
            <User2 className="w-6 h-6 text-yellow-600 hover:text-yellow-700" />
          </Button>
        </Link>
      )}
    </div>
  );
}
