import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Home } from "lucide-react";
import { auth } from "@/lib/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";

const Header: React.FC = () => {
  const router = useRouter();
  
  const user = userStore((state) => state.user);
  const handleSignOut = async () => {
    userStore.getState().signOut();
    useRouter().push("/");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-xl font-bold">Admin Dashboard</h2>
      <div className="gap-2 flex items-center">
        <Button className="cursor-pointer" variant="outline" onClick={() => router.push("/")}>
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
        {user && (
          <Button className="cursor-pointer" variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
