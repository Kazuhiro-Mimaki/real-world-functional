import { Outlet } from "@remix-run/react";
import { Header } from "~/components";

export default function Index() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
