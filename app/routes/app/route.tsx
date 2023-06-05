import { Outlet } from '@remix-run/react';
import { Header } from '~/components';

export default function __App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
