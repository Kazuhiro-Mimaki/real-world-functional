import { Form, Link, useActionData } from '@remix-run/react';
import { json, redirect, type ActionArgs } from '@remix-run/node';
import { commitUserSession, createUserSession } from '~/server/session.server';
import { createUserWorkFlow } from '~/server/workflow/user';
import { saveUser } from '~/server/repository';
import { ok } from 'neverthrow';
import { prisma } from '~/server/db.server';
import { getByEmail } from '~/server/service';
import { Button, Input } from '~/components';

export const action = async ({ request }: ActionArgs) => {
  const workFlow = createUserWorkFlow(getByEmail({ prisma }));

  const form = await request.formData();

  const unValidatedUser = {
    kind: 'UnValidated' as const,
    username: form.get('username') as string,
    email: form.get('email') as string,
    password: form.get('password') as string,
  };

  const result = ok(unValidatedUser).asyncAndThen(workFlow).andThen(saveUser({ prisma }));

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
          <Input type='text' name='username' placeholder='Username' />
          <Input type='text' name='email' placeholder='Email' />
          <Input type='password' name='password' placeholder='Password' />

          <p className='text-red-500' role='alert'>
            {actionData?.errorMessage}
          </p>

          <Button type='submit'>Sign up</Button>
        </fieldset>
      </Form>
    </div>
  );
}
