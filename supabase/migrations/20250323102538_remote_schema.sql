create type "public"."transaction type" as enum ('debit', 'credit');

alter table "public"."transaction" drop constraint "transactions_transaction_type_check";

drop materialized view if exists "public"."account_balance";

drop index if exists "public"."transactions_account_id_transaction_type_idx";

alter table "public"."transaction" drop column "transaction_type";

alter table "public"."transaction" add column "name" text not null;


