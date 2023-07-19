import { type LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Header } from '~/components';
import { getUserIdFromSession } from '~/server/session.server';

export const loader = async ({ request }: LoaderArgs) => {
  await getUserIdFromSession(request);
  return null;
};

export default function __App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
