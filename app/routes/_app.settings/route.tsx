import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { updateUser } from '~/server/repository';
import { UserId } from '~/server/model/user';
import { updateUserWorkFlow } from '~/server/workflow/user';
import { prisma } from '~/server/db.server';
import { commitUserSession, createUserSession, getUserIdFromSession } from '~/server/session.server';
import { getByUserId } from '~/server/service';
import { ok } from 'neverthrow';
import { Button, ErrorMessage, Input } from '~/components';
import type { User } from '~/client/model';

type LoaderType = {
  user: User;
};

export const loader = async ({ request }: LoaderArgs) => {
  const result = getUserIdFromSession(request).andThen(UserId).andThen(getByUserId({ prisma }));

  return result.match(
    (user) => json({ user }),
    (error) => {
      throw new Error(error.message);
    }
  );
};

export const action = async ({ request }: ActionArgs) => {
  const workFlow = updateUserWorkFlow();

  const form = await request.formData();

  const input = {
    kind: 'UnValidated' as const,
    username: form.get('username') as string,
    email: form.get('email') as string,
    password: form.get('password') as string,
  };

  const preprocess = getUserIdFromSession(request)
    .andThen(getByUserId({ prisma }))
    .andThen((user) =>
      ok({
        input: input,
        user: user,
      })
    );

  const result = preprocess
    .andThen(workFlow)
    .andThen(updateUser({ prisma }))
    .andThen((user) => createUserSession(user.id))
    .andThen(commitUserSession);

  return result.match(
    (cookie) =>
      redirect('/', {
        headers: {
          'Set-Cookie': cookie,
        },
      }),
    (error) => json({ errorMessage: error.message }, 400)
  );
};

export default function UserSettings() {
  const { user } = useLoaderData<LoaderType>();
  const actionData = useActionData<typeof action>();

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

          {actionData?.errorMessage && <ErrorMessage>{actionData.errorMessage}</ErrorMessage>}

          <Button type='submit'>Update settings</Button>
        </fieldset>
      </Form>
    </div>
  );
}
