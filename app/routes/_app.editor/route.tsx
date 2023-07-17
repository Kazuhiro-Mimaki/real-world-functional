import { Form, useActionData, useFetcher } from '@remix-run/react';
import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserId } from '~/server/session.server';
import { ok } from 'neverthrow';
import { saveArticle } from '~/server/repository';
import { createArticleWorkFlow } from '~/server/workflow/article';
import { prisma } from '~/server/db.server';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';

export const action = async ({ request }: ActionArgs) => {
  const workFlow = createArticleWorkFlow();

  const form = await request.formData();

  const input = {
    kind: 'UnValidated' as const,
    title: form.get('title') as string,
    content: form.get('content') as string,
    tagNames: form.getAll('tagNames[]') as string[],
    authorId: (await getUserId(request)) as number,
  };

  const result = ok(input).andThen(workFlow).asyncAndThen(saveArticle({ prisma }));

  return result.match(
    async (_) => {
      return redirect('/');
    },
    async (error) => {
      return json({ errorMessage: error.message }, 400);
    }
  );
};

export default function Editor() {
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();

  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [inputTagName, setInputTagName] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);

  const handleChangeArticleTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setArticleTitle(e.target.value);
  };

  const handleChangeArticleContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setArticleContent(e.target.value);
  };

  const handleSetInputTagName = (e: ChangeEvent<HTMLInputElement>) => {
    setInputTagName(e.target.value);
  };

  const handleKeyDownEnterInTagArea = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setTagNames((prev) => [...prev, inputTagName]);
      clearInputTagName();
    }
  };

  const handleClickDeleteTagButton = (targetIndex: number) => {
    setTagNames((prev) => prev.filter((_, i) => i !== targetIndex));
  };

  const handleClickSubmit = () => {
    const formData = new FormData();
    formData.append('title', articleTitle);
    formData.append('content', articleContent);
    tagNames.forEach((v) => {
      formData.append('tagNames[]', v);
    });
    fetcher.submit(formData, { action: '/editor', method: 'post' });
  };

  const clearInputTagName = () => {
    setInputTagName('');
  };

  return (
    <div className='container flex flex-wrap flex-col space-y-8 items-center mx-auto pt-12'>
      <h1 className='text-4xl font-extralight'>New Article</h1>

      <Form method='post' action='/editor' className='w-full sm:w-10/12 md:w-8/12 lg:w-6/12'>
        <fieldset className='flex flex-col space-y-8 justify-center mx-auto' aria-live='polite'>
          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='title'
            value={articleTitle}
            onChange={handleChangeArticleTitle}
            placeholder='Article Title'
            type='text'
          />

          <textarea
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-2.5'
            name='content'
            value={articleContent}
            onChange={handleChangeArticleContent}
            placeholder='Write your article (in markdown)'
          />

          <input
            className='rounded-md border focus:outline-none focus:ring-4 focus:ring-opacity-50 appearance-none text-gray-900 bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary-300 px-4 py-1'
            name='tagName'
            placeholder='Enter tags'
            type='text'
            value={inputTagName}
            onChange={handleSetInputTagName}
            onKeyDown={handleKeyDownEnterInTagArea}
          />

          <section>
            {tagNames.map((tagName, i) => (
              <span key={i} className='bg-gray-500 text-white py-1 px-2 rounded-full'>
                {tagName}
                <span className='ml-2 hover:cursor-pointer' onClick={() => handleClickDeleteTagButton(i)}>
                  x
                </span>
              </span>
            ))}
          </section>

          <p className='text-red-500' role='alert'>
            {actionData?.errorMessage}
          </p>

          <button
            type='button'
            onClick={handleClickSubmit}
            className='text-white bg-green-600 hover:bg-green-700 border-green-600 self-end px-5 py-2 rounded'
          >
            Publish Article
          </button>
        </fieldset>
      </Form>
    </div>
  );
}
