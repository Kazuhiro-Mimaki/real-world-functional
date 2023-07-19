import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect, json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { updateUser } from '~/server/repository';
import { UserId } from '~/server/model/user';
import { updateUserWorkFlow } from '~/server/workflow/user';
import { prisma } from '~/server/db.server';
import { commitUserSession, createUserSession, getUserId } from '~/server/session.server';
import { getByUserId } from '~/server/service';
import { ok } from 'neverthrow';
import { Button, Input } from '~/components';

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json({ user });
};

export const action = async ({ request }: ActionArgs) => {
  const workFlow = updateUserWorkFlow();

  const userId = Number(await getUserId(request));

  const form = await request.formData();

  const input = {
    kind: 'UnValidated' as const,
    username: form.get('username') as string,
    email: form.get('email') as string,
    password: form.get('password') as string,
  };

  const preprocess = UserId(userId)
    .asyncAndThen(getByUserId({ prisma }))
    .andThen((user) =>
      ok({
        input: input,
        user: user,
      })
    );

  const result = preprocess.andThen(workFlow).andThen(updateUser({ prisma }));

  return result.match(
    async (user) => {
      const session = await createUserSession(user.id);
      return redirect('/', {
        headers: {
          'Set-Cookie': await commitUserSession(session),
        },
      });
    },
    async (error) => {
      return json({ errorMessage: error.message }, 400);
    }
  );
};

export default function UserSettings() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className='container flex flex-wrap flex-col space-y-8 items-center mx-auto pt-12'>
      <div>
        <h1 className='text-4xl font-extralight'>Profile Settings</h1>
      </div>

      <Form method='post' action='/settings' className='w-full sm:w-10/12 md:w-8/12 lg:w-6/12'>
        <fieldset className='flex flex-col space-y-8 justify-center mx-auto' aria-live='polite'>
          <Input type='text' name='username' defaultValue={user.username} placeholder='Username' />
          <Input type='text' name='email' defaultValue={user.email} placeholder='Email' />
          <Input type='password' name='password' placeholder='Password' />

          <Button type='submit'>Update settings</Button>
        </fieldset>
      </Form>
    </div>
  );
}
