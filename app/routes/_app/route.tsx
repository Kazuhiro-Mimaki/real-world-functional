import { redirect, type LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Header } from '~/components';
import { getUserIdFromSession } from '~/server/session.server';

export const loader = ({ request }: LoaderArgs) => {
  const result = getUserIdFromSession(request);

  return result.match(
    (_) => null,
    () => redirect('/register')
  );
};

export default function __App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
