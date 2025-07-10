

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."price_candles" (
    "ts" timestamp with time zone NOT NULL,
    "close" numeric,
    "interval" "text" NOT NULL
);


ALTER TABLE "public"."price_candles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."prices" AS
 SELECT "ts" AS "time",
    "close",
    NULL::numeric AS "open",
    NULL::numeric AS "high",
    NULL::numeric AS "low",
    NULL::numeric AS "volume"
   FROM "public"."price_candles";


ALTER VIEW "public"."prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sniffer_logs" (
    "run_at" timestamp with time zone DEFAULT "now"(),
    "inserted" integer,
    "since_id" "text",
    "error" "text"
);


ALTER TABLE "public"."sniffer_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sniffer_state" (
    "id" integer DEFAULT 1 NOT NULL,
    "last_id" "text"
);


ALTER TABLE "public"."sniffer_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_raw" (
    "id" bigint NOT NULL,
    "author_handle" "text" NOT NULL,
    "text" "text" NOT NULL,
    "lang" "text",
    "source_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_raw" OWNER TO "postgres";


ALTER TABLE "public"."social_raw" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."social_raw_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."price_candles"
    ADD CONSTRAINT "price_candles_pkey" PRIMARY KEY ("ts", "interval");



ALTER TABLE ONLY "public"."sniffer_state"
    ADD CONSTRAINT "sniffer_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_raw"
    ADD CONSTRAINT "social_raw_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_raw"
    ADD CONSTRAINT "social_raw_unique_tweet" UNIQUE ("source_url");



ALTER TABLE ONLY "public"."price_candles"
    ADD CONSTRAINT "unique_ts_interval" UNIQUE ("ts", "interval");



CREATE INDEX "social_raw_created_at_idx" ON "public"."social_raw" USING "btree" ("created_at" DESC);



CREATE POLICY "Allow insert and upsert for all" ON "public"."price_candles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow upsert for all" ON "public"."price_candles" FOR UPDATE USING (true);



CREATE POLICY "Anon read price_candles" ON "public"."price_candles" FOR SELECT TO "anon" USING (true);



CREATE POLICY "allow_public_select" ON "public"."price_candles" FOR SELECT USING (true);



CREATE POLICY "allow_service_inserts" ON "public"."price_candles" FOR INSERT TO "service_role" WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."price_candles" TO "anon";
GRANT ALL ON TABLE "public"."price_candles" TO "authenticated";
GRANT ALL ON TABLE "public"."price_candles" TO "service_role";



GRANT ALL ON TABLE "public"."prices" TO "anon";
GRANT ALL ON TABLE "public"."prices" TO "authenticated";
GRANT ALL ON TABLE "public"."prices" TO "service_role";



GRANT ALL ON TABLE "public"."sniffer_logs" TO "anon";
GRANT ALL ON TABLE "public"."sniffer_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sniffer_logs" TO "service_role";



GRANT ALL ON TABLE "public"."sniffer_state" TO "anon";
GRANT ALL ON TABLE "public"."sniffer_state" TO "authenticated";
GRANT ALL ON TABLE "public"."sniffer_state" TO "service_role";



GRANT ALL ON TABLE "public"."social_raw" TO "anon";
GRANT ALL ON TABLE "public"."social_raw" TO "authenticated";
GRANT ALL ON TABLE "public"."social_raw" TO "service_role";



GRANT ALL ON SEQUENCE "public"."social_raw_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."social_raw_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."social_raw_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
