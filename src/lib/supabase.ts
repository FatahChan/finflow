import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseClient = createClient<Database>(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
);

supabaseClient
  .channel("schema-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
    },
    (payload) => {
      console.log(payload.table);
    },
  )
  .subscribe();
const login = async (credentials: { email: string; password: string }) => {
  return await supabaseClient.auth.signInWithPassword(credentials);
};

export { supabaseClient, login };
