import { Form, Link, useActionData } from '@remix-run/react';
import { redirect } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { commitUserSession, createUserSession, register } from '~/server/user';
import { db } from '~/server/db.server';
import { badRequest } from '~/server/utils';

const validateUsername = (username: unknown) => {
  if (typeof username !== 'string' || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
};

const validateEmail = (email: unknown) => {
  if (typeof email !== 'string' || email.length < 6) {
    return `Emails must be at least 6 characters long`;
  }
};

const validatePassword = (password: unknown) => {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const username = form.get('username');
  const email = form.get('email');
  const password = form.get('password');

  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { username, email, password };
  const fieldErrors = {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const userExists = await db.user.findFirst({
    where: { username },
  });
  if (userExists) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: `User with username ${username} already exists`,
    });
  }

  const user = await register({ username, email, password });
  if (!user) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: `Something went wrong trying to create a new user.`,
    });
  }
  const session = await createUserSession(user.id);
  return redirect('/', {
    headers: {
      'Set-Cookie': await commitUserSession(session),
    },
  });
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
            defaultValue={actionData?.fields?.username}
            aria-invalid={Boolean(actionData?.fieldErrors?.username)}
            aria-errormessage={actionData?.fieldErrors?.username && 'username-error'}
          />
          {actionData?.fieldErrors?.username ? (
            <p className='text-red-500' role='alert' id='username-error'>
              {actionData.fieldErrors.username}
            </p>
          ) : null}
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='email'
            placeholder='Email'
            type='text'
            defaultValue={actionData?.fields?.email}
            aria-invalid={Boolean(actionData?.fieldErrors?.email)}
            aria-errormessage={actionData?.fieldErrors?.email && 'email-error'}
          />
          {actionData?.fieldErrors?.email ? (
            <p className='text-red-500' role='alert' id='email-error'>
              {actionData.fieldErrors.email}
            </p>
          ) : null}
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='password'
            placeholder='Password'
            type='password'
            defaultValue={actionData?.fields?.password}
            aria-invalid={Boolean(actionData?.fieldErrors?.password)}
            aria-errormessage={actionData?.fieldErrors?.password && 'password-error'}
          />
          {actionData?.fieldErrors?.password ? (
            <p className='text-red-500' role='alert' id='password-error'>
              {actionData.fieldErrors.password}
            </p>
          ) : null}

          {actionData?.formError ? (
            <p className='text-red-500' role='alert'>
              {actionData.formError}
            </p>
          ) : null}

          <button type='submit' className='text-white bg-green-600 border-green-600 self-end px-5 py-2 rounded'>
            Sign up
          </button>
        </fieldset>
      </Form>
    </div>
  );
}
