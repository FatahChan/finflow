import { auth } from "@/lib/auth";
import { getWebRequest } from "@tanstack/react-start/server";
import { createMiddleware } from '@tanstack/react-start'

const getUser = async () => {
  const request = getWebRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
};
export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const user = await getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    return await next({
      context: {
        user: user,
      },
    });
  }
);