import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ok } from 'neverthrow';
import { prisma } from '~/server/db.server';
import { checkEmailExists } from '~/server/service';
import { createUserWorkFlow } from '~/server/workflow/user';
import { saveUser } from '~/server/repository';
import { commitUserSession, setUserSession } from '~/server/session.server';
import { generateUserId } from '~/server/model/user';

type Input = {
  username: string;
  email: string;
  password: string;
};

export const serverAction = (input: Input) => {
  const workFlow = createUserWorkFlow(checkEmailExists({ prisma }), generateUserId());

  const result = ok(toUnValidatedUser(input))
    .asyncAndThen(workFlow)
    .andThen(saveUser({ prisma }))
    .andThen((user) => setUserSession(user.id))
    .andThen(commitUserSession);

  return result.match(
    (cookie) =>
      redirect('/', {
        headers: {
          'Set-Cookie': cookie,
        },
      }),
    (error) => {
      return json({ errorMessage: error.message }, 400);
    }
  );
};

const toUnValidatedUser = (input: Input) => ({
  kind: 'UnValidated' as const,
  ...input,
});
