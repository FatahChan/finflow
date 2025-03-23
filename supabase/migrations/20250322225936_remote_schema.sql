set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.refresh_account_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW public.account_balance;
    RETURN NULL;  -- Triggers that do not modify the row must return NULL
END;
$function$
;


