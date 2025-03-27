import { account$, sessionStore$, transaction$ } from "@/lib/SupaLegend";
import { supabaseClient } from "@/lib/supabase";
import { useEffect } from "react";

const EVENT_TO_LISTEN_TO = [
  "SIGNED_IN",
  "INITIAL_SESSION",
  "TOKEN_REFRESHED",
  "SIGNED_OUT",
];
function useAuthStateChange() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (!EVENT_TO_LISTEN_TO.includes(event)) return;
      if (event === "SIGNED_OUT") {
        sessionStore$.delete();
        account$.delete();
        transaction$.delete();
        return;
      }
      sessionStore$.set(session);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
}

export default useAuthStateChange;
