import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ok } from 'neverthrow';
import { saveArticle } from '~/server/repository';
import { createArticleWorkFlow } from '~/server/workflow/article';
import { prisma } from '~/server/db.server';

type Input = {
  title: string;
  content: string;
  tagNames: string[];
};

export const serverAction = ({ input, userId }: RequestContext<Input>) => {
  const workFlow = createArticleWorkFlow();

  const unValidatedArticle = toUnValidatedArticle({ input, userId });

  const result = ok(unValidatedArticle).andThen(workFlow).asyncAndThen(saveArticle({ prisma }));

  return result.match(
    (_) => redirect('/'),
    (error) => json({ errorMessage: error.message }, 400)
  );
};

const toUnValidatedArticle = ({ input, userId }: RequestContext<Input>) => ({
  kind: 'UnValidated' as const,
  authorId: userId,
  ...input,
});
