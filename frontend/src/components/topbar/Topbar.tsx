import { useTheme } from "next-themes";
import { toast } from "sonner";
import { UserCircle2, Settings, LogOut, Moon, Sun, Computer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggler } from "@/components/topbar/ThemeToggler";
import NotificationMenu from "@/components/topbar/Notification";

const Topbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  return (
    <header className="fixed top-0 w-full z-50">
      <nav className={cn(
        "px-6 py-4 flex items-center justify-between max-w-[1440px] mx-auto",
        "bg-white dark:bg-neutral-900",
        "border-b border-neutral-200 dark:border-neutral-800",
        "shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50",
        "dark:supports-[backdrop-filter]:bg-neutral-900/50"
      )}>
        <a href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-neutral-900 to-neutral-600 
            dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
            Agent Hub
          </h1>
        </a>

        <div className="flex items-center gap-3">
          <ThemeToggler />

          {/* <NotificationMenu /> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <UserCircle2 className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="w-56 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-xs leading-none text-neutral-500 dark:text-neutral-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem 
                    onClick={() => setTheme("light")}
                    className={cn(
                      "cursor-pointer flex items-center gap-2",
                      theme === "light" && "bg-neutral-100 dark:bg-neutral-800"
                    )}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "cursor-pointer flex items-center gap-2",
                      theme === "dark" && "bg-neutral-100 dark:bg-neutral-800"
                    )}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(
                      "cursor-pointer flex items-center gap-2",
                      theme === "system" && "bg-neutral-100 dark:bg-neutral-800"
                    )}
                  >
                    <Computer className="h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 
                  dark:focus:text-red-400 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Topbar;