import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { UserId } from '~/server/model/user';
import { prisma } from '~/server/db.server';
import { getUserIdFromSession } from '~/server/session.server';
import { getByUserId } from '~/server/service';
import { Button, ErrorMessage, Input } from '~/components';
import type { User } from '~/client/model';
import { serverAction } from './action.server';

type LoaderType = {
  user: User;
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserIdFromSession(request);

  const result = UserId(userId).asyncAndThen(getByUserId({ prisma }));

  return result.match(
    (user) => json({ user }),
    (error) => {
      throw new Error(error.message);
    }
  );
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const input = {
    username: form.get('username') as string,
    email: form.get('email') as string,
    currentPassword: form.get('currentPassword') as string,
    newPassword: form.get('newPassword') as string,
  };

  const userId = await getUserIdFromSession(request);

  return serverAction({ input, userId });
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
          <Input type='password' name='currentPassword' placeholder='Current password' />
          <Input type='password' name='newPassword' placeholder='New password' />

          {actionData?.errorMessage && <ErrorMessage>{actionData.errorMessage}</ErrorMessage>}

          <Button type='submit'>Update settings</Button>
        </fieldset>
      </Form>
    </div>
  );
}
