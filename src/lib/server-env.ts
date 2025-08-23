import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    VITE_INSTANT_APP_ID: z.string().min(1, "InstantDB App ID is required"),
    INSTANT_APP_ADMIN_TOKEN: z.string().min(1, "InstantDB Admin Token is required"),
  },
  /*
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /*
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a string, Zod will actually succeed in parsing that value. This is
   * usually not what you want.
   *
   * To make sure that empty strings are treated as undefined, you can set
   * emptyStringAsUndefined to true.
   */
  emptyStringAsUndefined: true,
});
