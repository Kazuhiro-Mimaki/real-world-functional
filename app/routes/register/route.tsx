import { Form, Link, useActionData } from '@remix-run/react';
import { type ActionArgs } from '@remix-run/node';
import { Button, ErrorMessage, Input } from '~/components';
import { serverAction } from './action.server';

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const input = {
    username: form.get('username') as string,
    email: form.get('email') as string,
    password: form.get('password') as string,
  };

  return serverAction(input);
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

          <Button type='submit'>Sign up</Button>
        </fieldset>

        {actionData?.errorMessages &&
          actionData.errorMessages.map((err, i) => <ErrorMessage key={i}>{err}</ErrorMessage>)}
      </Form>
    </div>
  );
}
