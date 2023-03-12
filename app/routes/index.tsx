import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Header } from '~/components';
import { getArticles } from '~/modules/articles/repository';
import { getUserId } from '~/server/user';

// ====================
// loader
// ====================

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const result = await getArticles();
  return result.match(
    (articles) => {
      return json({ articles: articles, errorMessage: '' }, 200);
    },
    (error) => {
      return json({ articles: [], errorMessage: error.message }, 400);
    }
  );
};

// ====================
// component
// ====================

export default function Index() {
  const { articles, errorMessage } = useLoaderData<typeof loader>();

  return (
    <>
      <Header />
      <div className='container mx-auto my-8'>
        <section>
          <section>global feed</section>

          <section className='divide-y divide-slate-200'>
            {articles.map((article) => (
              <article key={article.id} className='flex flex-col py-4'>
                <span>{article.author.username}</span>
                <h1 className='text-2xl font-semibold'>{article.title}</h1>
                <p className='text-base font-light text-gray-500'>{article.content}</p>
              </article>
            ))}
          </section>
        </section>
      </div>
    </>
  );
}
