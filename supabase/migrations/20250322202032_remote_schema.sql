

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."refresh_account_balance"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.account_balance;  -- Updated view name
    RETURN NULL;  -- Triggers that do not modify the row must return NULL
END;
$$;


ALTER FUNCTION "public"."refresh_account_balance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_account_balances"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.account_balances;
    RETURN NULL;  -- Triggers that do not modify the row must return NULL
END;
$$;


ALTER FUNCTION "public"."refresh_account_balances"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."account" (
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "currency_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "deleted" boolean DEFAULT false
);


ALTER TABLE "public"."account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transaction" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "amount" numeric(20,2) NOT NULL,
    "transaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "account_id" "uuid",
    "deleted" boolean DEFAULT false,
    CONSTRAINT "transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['credit'::"text", 'debit'::"text"])))
);


ALTER TABLE "public"."transaction" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."account_balance" AS
 SELECT "a"."id" AS "account_id",
    (COALESCE("sum"(
        CASE
            WHEN ("t"."transaction_type" = 'credit'::"text") THEN "t"."amount"
            ELSE (0)::numeric
        END), (0)::numeric) - COALESCE("sum"(
        CASE
            WHEN ("t"."transaction_type" = 'debit'::"text") THEN "t"."amount"
            ELSE (0)::numeric
        END), (0)::numeric)) AS "balance"
   FROM ("public"."account" "a"
     LEFT JOIN "public"."transaction" "t" ON (("a"."id" = "t"."account_id")))
  GROUP BY "a"."id"
  WITH NO DATA;


ALTER TABLE "public"."account_balance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."currency" (
    "code" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "symbol" "text" NOT NULL
);


ALTER TABLE "public"."currency" OWNER TO "postgres";


ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."currency"
    ADD CONSTRAINT "currency_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."currency"
    ADD CONSTRAINT "currency_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."transaction"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_account_currency_code" ON "public"."account" USING "btree" ("currency_code");



CREATE INDEX "idx_account_user_id" ON "public"."account" USING "btree" ("user_id");



CREATE INDEX "transactions_account_id_idx" ON "public"."transaction" USING "btree" ("account_id");



CREATE INDEX "transactions_account_id_transaction_type_idx" ON "public"."transaction" USING "btree" ("account_id", "transaction_type");



CREATE INDEX "transactions_id_idx" ON "public"."transaction" USING "btree" ("id");



CREATE OR REPLACE TRIGGER "refresh_account_balance_trigger" AFTER INSERT ON "public"."transaction" FOR EACH ROW EXECUTE FUNCTION "public"."refresh_account_balance"();



CREATE OR REPLACE TRIGGER "update_account_updated_at" BEFORE UPDATE ON "public"."account" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transaction_updated_at" BEFORE UPDATE ON "public"."transaction" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "public"."currency"("code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transaction"
    ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id");



CREATE POLICY "Users can delete their own accounts" ON "public"."account" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert accounts" ON "public"."account" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can select their own accounts" ON "public"."account" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own accounts" ON "public"."account" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."account" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transaction" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."refresh_account_balance"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_account_balance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_account_balance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_account_balances"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_account_balances"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_account_balances"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."account" TO "anon";
GRANT ALL ON TABLE "public"."account" TO "authenticated";
GRANT ALL ON TABLE "public"."account" TO "service_role";



GRANT ALL ON TABLE "public"."transaction" TO "anon";
GRANT ALL ON TABLE "public"."transaction" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction" TO "service_role";



GRANT ALL ON TABLE "public"."account_balance" TO "anon";
GRANT ALL ON TABLE "public"."account_balance" TO "authenticated";
GRANT ALL ON TABLE "public"."account_balance" TO "service_role";



GRANT ALL ON TABLE "public"."currency" TO "anon";
GRANT ALL ON TABLE "public"."currency" TO "authenticated";
GRANT ALL ON TABLE "public"."currency" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
