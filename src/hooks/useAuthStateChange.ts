import { account$, sessionStore$, transaction$ } from "@/lib/SupaLegend";
import { supabaseClient } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

const EVENT_TO_LISTEN_TO = [
  "SIGNED_IN",
  "INITIAL_SESSION",
  "TOKEN_REFRESHED",
  "SIGNED_OUT",
];
function useAuthStateChange() {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      supabaseClient.auth.getSession().then((res) => {
        if (res.data.session) {
          console.log(res.data.session);
          sessionStore$.set(res.data.session);
          navigate({ to: "/account" });
        }
      });
    } catch {
      toast.error("Failed to get session");
    }
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log(event, session);
      if (!EVENT_TO_LISTEN_TO.includes(event)) return;
      if (event === "SIGNED_OUT") {
        sessionStore$.delete();
        account$.delete();
        transaction$.delete();
        navigate({ to: "/login" });
        return;
      }
      if (!session) return;
      sessionStore$.set(session);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);
}

export default useAuthStateChange;
