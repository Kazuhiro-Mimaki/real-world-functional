import { Form, useActionData } from '@remix-run/react';
import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserId } from '~/server/user';
import { ok } from 'neverthrow';
import { saveArticle } from '~/models/articles/repository';
import { createArticleWorkFlow } from '~/models/articles/workflows/createArticle';

// ====================
// action
// ====================

export const action = async ({ request }: ActionArgs) => {
  const workFlow = createArticleWorkFlow(saveArticle);

  const form = await request.formData();

  const input = {
    kind: 'UnValidated' as const,
    title: form.get('title') as string,
    content: form.get('content') as string,
    userId: (await getUserId(request)) as number,
  };

  const result = ok(input).asyncAndThen(workFlow);

  return result.match(
    async (_) => {
      return redirect('/');
    },
    async (error) => {
      return json({ errorMessage: error.message }, 400);
    }
  );
};

// ====================
// Page
// ====================

export default function Editor() {
  const actionData = useActionData<typeof action>();

  return (
    <div className='container flex flex-wrap flex-col space-y-8 items-center mx-auto pt-12'>
      <h1 className='text-4xl font-extralight'>New Article</h1>

      <Form method='post' action='/editor' className='w-full sm:w-10/12 md:w-8/12 lg:w-6/12'>
        <fieldset className='flex flex-col space-y-8 justify-center mx-auto' aria-live='polite'>
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='title'
            placeholder='Article Title'
            type='text'
          />
          <textarea
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='content'
            placeholder='Write your article (in markdown)'
          />

          <p className='text-red-500' role='alert'>
            {actionData?.errorMessage}
          </p>

          <button type='submit' className='text-white bg-green-600 border-green-600 self-end px-5 py-2 rounded'>
            Publish Article
          </button>
        </fieldset>
      </Form>
    </div>
  );
}
