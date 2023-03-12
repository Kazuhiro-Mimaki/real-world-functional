import { Form, Link, useActionData } from '@remix-run/react';
import type { ActionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { commitUserSession, createUserSession } from '~/server/user';
import { createUserWorkFlow } from '~/modules/users/workflows/createUser';
import { getByUsername, saveUser } from '~/modules/users/repository';
import { ok } from 'neverthrow';
import { prisma } from '~/server/db.server';

export const action = async ({ request }: ActionArgs) => {
  const workFlow = createUserWorkFlow(getByUsername(prisma), saveUser(prisma));

  const form = await request.formData();

  const input = {
    kind: 'UnValidated' as const,
    username: form.get('username') as string,
    email: form.get('email') as string,
    password: form.get('password') as string,
  };

  const result = ok(input).asyncAndThen(workFlow);

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

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <div className='container flex flex-wrap flex-col space-y-8 items-center mx-auto pt-12'>
      <div>
        <h1 className='text-4xl font-extralight'>Sign up</h1>
        <p className='mt-4'>
          <Link to='/login'>Have an account?</Link>
        </p>
      </div>

      <Form method='post' action='/register' className='w-full sm:w-10/12 md:w-8/12 lg:w-6/12'>
        <fieldset className='flex flex-col space-y-8 justify-center mx-auto' aria-live='polite'>
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='username'
            placeholder='Username'
            type='text'
          />
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='email'
            placeholder='Email'
            type='text'
          />
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='password'
            placeholder='Password'
            type='password'
          />

          <p className='text-red-500' role='alert'>
            {actionData?.errorMessage}
          </p>

          <button type='submit' className='text-white bg-green-600 border-green-600 self-end px-5 py-2 rounded'>
            Sign up
          </button>
        </fieldset>
      </Form>
    </div>
  );
}
