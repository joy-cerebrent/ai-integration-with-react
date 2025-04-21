import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col gap-2 items-center justify-center">
      <h2 className="font-semibold text-xl">
        Hello, and Welcome to this App 👋
      </h2>
      <Outlet />
    </div>
  );
}

export default AuthLayout;