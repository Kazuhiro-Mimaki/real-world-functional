import { Form, Link } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs } from '@remix-run/node';
import { commitUserSession, createUserSession, getByName, register } from '~/server/user';

const validateUsername = (username: unknown) => {
  if (typeof username !== 'string' || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
};

const validatePassword = (password: unknown) => {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const name = form.get('username');
  const password = form.get('password');

  if (typeof name !== 'string' || typeof password !== 'string') {
    return json(
      {
        fieldErrors: null,
        fields: null,
        formError: `Form not submitted correctly.`,
      },
      { status: 400 }
    );
  }

  const fields = { name, password };
  const fieldErrors = {
    name: validateUsername(name),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return json(
      {
        fieldErrors,
        fields,
        formError: null,
      },
      {
        status: 400,
      }
    );
  }

  const existsUser = await getByName(name);
  if (existsUser) {
    return json(
      {
        fieldErrors: null,
        fields,
        formError: `User with username ${name} already exists`,
      },
      {
        status: 400,
      }
    );
  }

  const user = await register({ name, password });
  if (!user) {
    return json(
      {
        fieldErrors: null,
        fields,
        formError: `Something went wrong trying to create a new user.`,
      },
      {
        status: 400,
      }
    );
  }

  const session = await createUserSession(user.id);

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitUserSession(session),
    },
  });
};

export default function Register() {
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

          <button type='submit' className='text-white bg-green-600 border-green-600 self-end px-5 py-2 rounded'>
            Sign up
          </button>
        </fieldset>
      </Form>
    </div>
  );
}
