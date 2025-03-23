alter table "public"."transaction" add column "transaction_at" timestamp with time zone not null default now();


