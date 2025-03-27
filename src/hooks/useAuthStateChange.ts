import { account$, sessionStore$, transaction$ } from "@/lib/SupaLegend";
import { supabaseClient } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

const EVENT_TO_LISTEN_TO = [
  "SIGNED_IN",
  "INITIAL_SESSION",
  "TOKEN_REFRESHED",
  "SIGNED_OUT",
];
function useAuthStateChange() {
  const navigate = useNavigate();
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (!EVENT_TO_LISTEN_TO.includes(event)) return;
      if (event === "SIGNED_OUT") {
        sessionStore$.delete();
        account$.delete();
        transaction$.delete();
        navigate({ to: "/login" });
        return;
      }
      sessionStore$.set(session);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);
}

export default useAuthStateChange;
