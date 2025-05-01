import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";
import { useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketProvider";

export default function RootLayout() {
  const { user } = useAuth();

  console.log(user)

  return (
    <SocketProvider>
      <Topbar />
      <section className="flex w-full max-w-[1440px] mx-auto">
        <Sidebar />
        <Outlet />
      </section>
    </SocketProvider>
  );
}
