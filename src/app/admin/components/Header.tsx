import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Home, Menu, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";
import { useSignOut } from "@/hooks/useSignOut";
import { useUserRole } from "@/hooks/useUserRole";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

type HeaderProps = {
  onMenuToggle?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const router = useRouter();
  const signOut = useSignOut();
  const { user } = userStore();
  const { userRole, isManager } = useUserRole();
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();

  const handleNotificationClick = async (id: string, link: string, isRead: boolean) => {
    if (!isRead) await markOneRead(id);
    router.push(link);
  };

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
        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1 px-2 text-blue-600 hover:text-blue-700"
                  onClick={markAllRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                          !n.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(n.id, n.link, n.isRead)}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                          <div className={!n.isRead ? "" : "pl-4"}>
                            <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold" : "font-medium"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

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
              onClick={() => signOut()}
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
              onClick={() => signOut()}
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
