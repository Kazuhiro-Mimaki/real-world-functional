import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Header } from '~/components';
import { listArticles } from '~/modules/articles/repository';
import { getUserId } from '~/server/user';

// ====================
// loader
// ====================

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const result = await listArticles();
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
      <div className='flex container mx-auto my-8 gap-x-8'>
        <section className='w-3/4'>
          <section>global feed</section>

          <section className='divide-y divide-slate-200'>
            {articles.map((article) => (
              <article key={article.id} className='flex flex-col py-4'>
                <Link to='/settings' className='text-green-500 hover:underline'>
                  {article.author.username}
                </Link>
                <h1 className='text-2xl font-semibold'>{article.title}</h1>
                <p className='text-base font-light text-gray-500'>{article.content.substring(0, 500)}...</p>
              </article>
            ))}
          </section>
        </section>

        <section className='bg-slate-100 w-1/4 h-fit'>
          <h1>Popular Tags</h1>
          {/* TODO: list popular tags */}
        </section>
      </div>
    </>
  );
}
