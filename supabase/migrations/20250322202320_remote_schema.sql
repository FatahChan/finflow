alter table "public"."account" alter column "created_at" set not null;

alter table "public"."account" alter column "currency_code" set not null;

alter table "public"."account" alter column "deleted" set not null;

alter table "public"."account" alter column "user_id" set not null;

alter table "public"."transaction" alter column "account_id" set not null;

alter table "public"."transaction" alter column "created_at" set not null;

alter table "public"."transaction" alter column "deleted" set not null;

alter table "public"."transaction" alter column "updated_at" set not null;


