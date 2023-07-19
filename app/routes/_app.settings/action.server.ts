import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ok } from 'neverthrow';
import { prisma } from '~/server/db.server';
import { getByUserId } from '~/server/service';
import { UserId } from '~/server/model/user';
import { updateUserWorkFlow } from '~/server/workflow/user';
import { updateUser } from '~/server/repository';
import { commitUserSession, createUserSession } from '~/server/session.server';

type Input = {
  username: string;
  email: string;
  password: string;
};

export const serverAction = ({ input, userId }: RequestContext<Input>) => {
  const workFlow = updateUserWorkFlow();

  const preprocess = UserId(userId)
    .asyncAndThen(getByUserId({ prisma }))
    .andThen((user) =>
      ok({
        input: toUnValidatedUser(input),
        user: user,
      })
    );

  const result = preprocess
    .andThen(workFlow)
    .andThen(updateUser({ prisma }))
    .andThen((user) => createUserSession(user.id))
    .andThen(commitUserSession);

  return result.match(
    (cookie) =>
      redirect('/', {
        headers: {
          'Set-Cookie': cookie,
        },
      }),
    (error) => json({ errorMessage: error.message }, 400)
  );
};

const toUnValidatedUser = (input: Input) => ({
  kind: 'UnValidated' as const,
  ...input,
});
