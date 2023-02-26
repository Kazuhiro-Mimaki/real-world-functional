import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/server/db.server';
import { getUserId } from '~/server/user';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const user = await db.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json({ user });
};

export default function Profile() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className='container flex flex-wrap justify-center mx-auto mt-8'>
      <div className='w-full'>{data.user.username}</div>
    </div>
  );
}
