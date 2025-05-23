import { useTheme } from "next-themes";
import { toast } from "sonner";
import { UserCircle2 } from "lucide-react";

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
    <header className="fixed top-0 w-full border-b bg-background shadow-sm z-50">
      <nav className="px-6 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
        <a href="/">
          <h1 className="text-xl font-semibold">My App</h1>
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggler />

          <NotificationMenu />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <UserCircle2 className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="space-y-1">
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn(theme === "light" && "bg-neutral-100 dark:bg-neutral-800")}
                  >
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(theme === "dark" && "bg-neutral-100 dark:bg-neutral-800")}
                  >
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(theme === "system" && "bg-neutral-100 dark:bg-neutral-800")}
                  >
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
