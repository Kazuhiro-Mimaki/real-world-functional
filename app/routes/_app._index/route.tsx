import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getArticles } from '~/server/service';
import { prisma } from '~/server/db.server';
import { Article } from '~/components';
import { type Article as ArticleType } from '~/client/model';

type LoaderType = {
  articles: ArticleType[];
  errorMessage: string;
};

export const loader = async () => {
  const result = await getArticles({ prisma })();

  return result.match(
    (articles) => {
      return json({ articles }, 200);
    },
    (error) => {
      throw new Error(error.message);
    }
  );
};

export default function Index() {
  const { articles } = useLoaderData<LoaderType>();

  return (
    <div className='flex container mx-auto my-8 gap-x-8'>
      <div className='w-3/4'>
        <div>global feed</div>

        <div className='divide-y divide-slate-200'>
          {articles.map((article) => (
            <Article key={article.id} article={article} />
          ))}
        </div>
      </div>

      <div className='bg-slate-100 w-1/4 h-fit'>
        <h1>Popular Tags</h1>
        {/* TODO: list popular tags */}
      </div>
    </div>
  );
}
