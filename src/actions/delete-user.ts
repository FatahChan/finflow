import { serverEnv } from '@/lib/server-env';
import { createServerFn } from '@tanstack/react-start'
import { init } from '@instantdb/admin';

const db = init({
  appId: serverEnv.VITE_INSTANT_APP_ID,
  adminToken: serverEnv.INSTANT_APP_ADMIN_TOKEN,
});

export const deleteUser = createServerFn({ method: 'POST' })
  .validator(async (refreshToken: string) => {
    if (!refreshToken) {
      throw new Error('Refresh token is required')
    }
    if (typeof refreshToken !== 'string') {
      throw new Error('Refresh token must be a string')
    }
    const user = await db.auth.getUser({
        refresh_token: refreshToken,
    });
    if (!user.id) {
      throw new Error('User not found')
    }
    return refreshToken
  })
  .handler(async (ctx) => {
    const refreshToken = await ctx.data;
    const deletedUser = await db.auth.deleteUser({
        refresh_token: refreshToken,
      });
    return deletedUser
  })

