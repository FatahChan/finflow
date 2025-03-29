import { sessionStore$ } from "@/lib/SupaLegend";
import { supabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// const EVENT_TO_LISTEN_TO = [
//   "SIGNED_IN",
//   "INITIAL_SESSION",
//   "TOKEN_REFRESHED",
//   "SIGNED_OUT",
// ];
function useAuthStateChange() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_, session) => {
      setSession(session);
      sessionStore$.set(session);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  console.log(session);
}

export default useAuthStateChange;
