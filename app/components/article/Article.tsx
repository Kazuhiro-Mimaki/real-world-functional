import { Link } from '@remix-run/react';
import type { Article as ArticleType } from '~/client/model';

type Props = {
  article: ArticleType;
};

export const Article = ({ article }: Props) => {
  return (
    <article key={article.id} className='flex flex-col py-4'>
      <Link to='/settings' className='text-green-500 hover:underline'>
        {article.author.username}
      </Link>
      <h1 className='text-2xl font-semibold'>{article.title}</h1>
      <p className='text-base font-light text-gray-500'>{article.content.substring(0, 500)}...</p>

      <div>
        {article.tags.map((tag) => (
          <span key={tag.id}>{tag.name} / </span>
        ))}
      </div>
    </article>
  );
};
