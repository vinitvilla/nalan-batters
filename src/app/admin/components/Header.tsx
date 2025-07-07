import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";
import { useSignOut } from "@/hooks/useSignOut";

const Header: React.FC = () => {
  const router = useRouter();
  const signOut = useSignOut();
  const user = userStore((state) => state.user);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-xl font-bold">Admin Dashboard</h2>
      <div className="gap-2 flex items-center">
        <Button className="cursor-pointer" variant="outline" onClick={() => router.push("/")}>
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
        {user && (
          <Button className="cursor-pointer" variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
