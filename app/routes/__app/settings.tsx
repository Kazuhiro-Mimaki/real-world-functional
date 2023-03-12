import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { getByUserId, updateUser } from '~/modules/users/repository';
import { UserId } from '~/modules/users/vo';
import { updateUserWorkFlow } from '~/modules/users/workflows/updateUser';
import { prisma } from '~/server/db.server';
import { commitUserSession, createUserSession, getUserId } from '~/server/user';

// ====================
// loader
// ====================

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

// ====================
// action
// ====================

export const action = async ({ request }: ActionArgs) => {
  const workFlow = updateUserWorkFlow();

  const userId = (await getUserId(request)) as number;

  const form = await request.formData();

  const input = {
    kind: 'UnValidated' as const,
    username: form.get('username') as string,
    email: form.get('email') as string,
    password: form.get('password') as string,
  };

  const preprocess = UserId(userId)
    .asyncAndThen(getByUserId(prisma))
    .map((v) => ({
      input: input,
      user: v,
    }));

  const result = preprocess.andThen(workFlow).andThen(updateUser(prisma));

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

// ====================
// component
// ====================

export default function UserSettings() {
  // ====================
  // loader
  // ====================

  const { user } = useLoaderData<typeof loader>();

  return (
    <div className='container flex flex-wrap flex-col space-y-8 items-center mx-auto pt-12'>
      <div>
        <h1 className='text-4xl font-extralight'>Profile Settings</h1>
      </div>
      <Form method='post' action='/settings' className='w-full sm:w-10/12 md:w-8/12 lg:w-6/12'>
        <fieldset className='flex flex-col space-y-8 justify-center mx-auto' aria-live='polite'>
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='username'
            defaultValue={user.username}
            placeholder='Username'
            type='text'
          />
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='email'
            defaultValue={user.email}
            placeholder='Email'
            type='text'
          />
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='password'
            placeholder='New password'
            type='password'
          />

          <button type='submit' className='text-white bg-green-600 border-green-600 self-end px-5 py-2 rounded'>
            Update settings
          </button>
        </fieldset>
      </Form>
    </div>
  );
}
