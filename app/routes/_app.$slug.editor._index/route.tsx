import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json, type ActionArgs, type LoaderArgs } from '@remix-run/node';
import { getUserIdFromSession } from '~/server/session.server';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { Button, ErrorMessage, Input, Textarea } from '~/components';
import type { Article } from '~/client/model';
import { ArticleId } from '~/server/model/article';
import { getArticle } from '~/server/service';
import { prisma } from '~/server/db.server';
import { serverAction } from './action.server';

type LoaderType = {
  article: Article;
  errorMessage: string;
};

export const loader = async ({ params }: LoaderArgs) => {
  if (!params.slug) throw new Error('Article slug is required');

  const result = ArticleId(Number(params.slug)).asyncAndThen(getArticle({ prisma }));

  return result.match(
    (article) => json({ article }, 200),
    (error) => {
      throw new Error(error.message);
    }
  );
};

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const input = {
    title: form.get('title') as string,
    content: form.get('content') as string,
    tagNames: form.getAll('tagNames[]') as string[],
  };

  const userId = await getUserIdFromSession(request);

  return serverAction({ input, userId });
};

export default function Editor() {
  const { article } = useLoaderData<LoaderType>();
  const actionData = useActionData<typeof action>();

  const [inputTagName, setInputTagName] = useState('');
  const [tagNames, setTagNames] = useState<string[]>(article.tags.map((tag) => tag.name));

  const handleSetInputTagName = (e: ChangeEvent<HTMLInputElement>) => {
    setInputTagName(e.target.value);
  };

  const handleKeyDownEnterInTagArea = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Space') {
      setTagNames((prev) => [...prev, inputTagName]);
      clearInputTagName();
    }
  };

  const handleClickDeleteTagButton = (targetIndex: number) => {
    setTagNames((prev) => prev.filter((_, i) => i !== targetIndex));
  };

  const clearInputTagName = () => {
    setInputTagName('');
  };

  return (
    <div className='container flex flex-wrap flex-col space-y-8 items-center mx-auto pt-12'>
      <h1 className='text-4xl font-extralight'>New Article</h1>

      <Form method='post' action='/editor' className='w-full sm:w-10/12 md:w-8/12 lg:w-6/12'>
        <fieldset className='flex flex-col space-y-8 justify-center mx-auto' aria-live='polite'>
          <Input type='text' name='title' placeholder='Article Title' defaultValue={article.title} />

          <Textarea name='content' placeholder='Write your article' defaultValue={article.content} />

          <Input
            type='text'
            placeholder='Enter tags'
            value={inputTagName}
            onChange={handleSetInputTagName}
            onKeyDown={handleKeyDownEnterInTagArea}
          />

          <div>
            {tagNames.map((tagName, i) => (
              <span key={i} className='bg-gray-500 text-white py-1 px-2 rounded-full'>
                {tagName}
                <span className='ml-2 hover:cursor-pointer' onClick={() => handleClickDeleteTagButton(i)}>
                  x
                </span>
                <Input type='hidden' name='tagNames[]' value={tagName} />
              </span>
            ))}
          </div>

          {actionData?.errorMessage && <ErrorMessage>{actionData.errorMessage}</ErrorMessage>}

          <Button type='submit'>Publish Article</Button>
        </fieldset>
      </Form>
    </div>
  );
}
