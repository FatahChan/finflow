alter table "public"."transaction" alter column "category" set default 'Other'::text;

alter table "public"."transaction" alter column "category" set not null;


