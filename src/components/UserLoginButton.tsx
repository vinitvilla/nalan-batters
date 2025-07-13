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
            <Avatar className="w-10 h-10 cursor-pointer">
              <AvatarImage
                src={""}
                alt={user.fullName || user.phone || "User"}
              />
              <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                {user.fullName ? user.fullName[0] : user.phone?.slice(-2) || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <UserDropdown />
          </DropdownMenuContent>
        </DropdownMenu>
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
