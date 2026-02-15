import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";
import { useSignOut } from "@/hooks/useSignOut";
import { useUserRole } from "@/hooks/useUserRole";

type HeaderProps = {
  onMenuToggle?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const router = useRouter();
  const signOut = useSignOut();
  const { user } = userStore();
  const { userRole, isManager } = useUserRole();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-white sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden p-2 hover:bg-gray-100"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-bold truncate">
            {isManager ? 'Manager Dashboard' : 'Admin Dashboard'}
          </h2>
          {user && (
            <span className="text-xs text-gray-500 hidden sm:block">
              Welcome back, {user.fullName} ({userRole})
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          className="cursor-pointer hidden sm:flex" 
          variant="outline" 
          onClick={() => router.push("/")}
        >
          <Home className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Back to Home</span>
          <span className="md:hidden">Home</span>
        </Button>
        
        {/* Mobile Home Button */}
        <Button 
          className="cursor-pointer sm:hidden" 
          variant="outline" 
          size="icon"
          onClick={() => router.push("/")}
          aria-label="Back to Home"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        {user && (
          <>
            <Button 
              className="cursor-pointer hidden sm:flex" 
              variant="outline" 
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Sign Out</span>
              <span className="md:hidden">Sign Out</span>
            </Button>
            
            {/* Mobile Sign Out Button */}
            <Button 
              className="cursor-pointer sm:hidden" 
              variant="outline" 
              size="icon"
              onClick={signOut}
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
