import { Outlet } from "@remix-run/react";

export default function __App() {
  return (
    <>
      <h1 className="bg-white">Welcome to Remix</h1>
      <Outlet />
    </>
  );
}
