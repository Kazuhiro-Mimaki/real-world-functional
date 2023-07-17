import { type LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Header } from '~/components';
import { getUserId } from '~/server/session.server';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
};

export default function __App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
