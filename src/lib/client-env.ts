import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const clientEnv = createEnv({
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with VITE_.
   */
  client: {
    VITE_INSTANT_APP_ID: z.string().min(1, "InstantDB App ID is required"),
    VITE_GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
    VITE_GOOGLE_CLIENT_NAME: z.string().min(1, "Google Client Name is required"),
  },

  /*
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,

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
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
});
