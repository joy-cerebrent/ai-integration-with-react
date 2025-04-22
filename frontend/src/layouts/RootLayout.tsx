import { Outlet } from "react-router-dom";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";

export default function RootLayout() {
  return (
    <>
      <Topbar />
      <section className="flex w-full max-w-7xl mx-auto">
        <Sidebar />
        <Outlet />
      </section>
    </>
  );
}
