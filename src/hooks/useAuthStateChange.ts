import { sessionStore$ } from "@/lib/SupaLegend";
import { supabaseClient } from "@/lib/supabase";
import { useEffect } from "react";

function useAuthStateChange() {
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      sessionStore$.set(session);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_, session) => {
      sessionStore$.set(session);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
}

export default useAuthStateChange;
