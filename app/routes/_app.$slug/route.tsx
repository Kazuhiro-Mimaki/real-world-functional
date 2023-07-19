import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { prisma } from '~/server/db.server';
import { Article } from '~/components';
import { type Article as ArticleType } from '~/client/model';
import { getArticle } from '~/server/service';
import { ArticleId } from '~/server/model/article';

type LoaderType = {
  article: ArticleType;
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

export default function Index() {
  const { article } = useLoaderData<LoaderType>();

  return (
    <div className='flex container mx-auto my-8 gap-x-8'>
      <div className='w-3/4'>
        <Article key={article.id} article={article} />
      </div>
    </div>
  );
}
