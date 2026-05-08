--
-- PostgreSQL database dump
--

\restrict J2hTppvjwJhbCbunBgHoEGmWAzP1zo8dbDEqAvsQ4T2KHK6Pf9OzhdXsvSnB3iC

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

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

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: activity_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_action AS ENUM (
    'create',
    'update',
    'delete'
);


--
-- Name: block_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.block_type AS ENUM (
    'text_full',
    'image_full',
    'text_image',
    'image_text',
    'three_images'
);


--
-- Name: media_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.media_role AS ENUM (
    'hero',
    'gallery'
);


--
-- Name: post_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.post_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: -
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: array_to_string_immutable(text[], text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.array_to_string_immutable(text[], text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $_$SELECT array_to_string($1, $2)$_$;


--
-- Name: get_unique_user_emails(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unique_user_emails() RETURNS TABLE(user_email text)
    LANGUAGE sql STABLE
    AS $$
  SELECT DISTINCT user_email
  FROM activity_logs
  ORDER BY user_email ASC;
$$;


--
-- Name: to_tsvector_immutable(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.to_tsvector_immutable(text) RETURNS tsvector
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $_$SELECT to_tsvector('english', $1)$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL AND ppt.tablename NOT LIKE '% %'),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  -- Count raw slot entries before apply_rls/subscription filter
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  -- Apply RLS and filter as before
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  -- Real rows with slot count attached
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  -- Sentinel row: always returned when no real rows exist so Elixir can
  -- always read slot_changes_count. Identified by wal IS NULL.
  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_email text NOT NULL,
    action text NOT NULL,
    entity_type text DEFAULT 'project'::text NOT NULL,
    entity_id uuid NOT NULL,
    entity_title text NOT NULL,
    changes jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT activity_logs_action_check CHECK ((action = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text])))
);


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    type public.block_type NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE blocks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.blocks IS 'Content blocks for Page Builder posts, ordered by sort_order';


--
-- Name: COLUMN blocks.data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.blocks.data IS 'JSONB data specific to block type: text_full={content}, image_full={image_url,alt}, text_image={text,image_url,image_alt}, image_text={text,image_url,image_alt}';


--
-- Name: COLUMN blocks.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.blocks.sort_order IS 'Display order within the post (0-based)';


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    telegram_sent boolean DEFAULT false,
    telegram_message_id text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    url text NOT NULL,
    role public.media_role NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    alt text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_role_check CHECK ((role = 'hero'::public.media_role))
);


--
-- Name: TABLE media; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.media IS 'Stores media assets (images) for projects with hero and gallery roles';


--
-- Name: COLUMN media.role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media.role IS 'Role of the media: hero for hero slider, gallery for project gallery';


--
-- Name: COLUMN media.sort_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media.sort_order IS 'Order for displaying media (lower numbers first)';


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    status public.post_status DEFAULT 'draft'::public.post_status NOT NULL,
    seo_title text,
    seo_description text,
    og_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    hero_image_url text,
    hero_title text,
    hero_subtitle text,
    hero_tags text[] DEFAULT '{}'::text[],
    hero_location text,
    hero_year text,
    gallery_images text[] DEFAULT '{}'::text[],
    featured boolean DEFAULT false,
    deleted_at timestamp with time zone
);


--
-- Name: TABLE posts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.posts IS 'Dynamic pages with Page Builder - composed of ordered blocks';


--
-- Name: COLUMN posts.hero_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.hero_image_url IS 'Hero section background image URL';


--
-- Name: COLUMN posts.hero_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.hero_title IS 'Hero section title (can differ from post.title)';


--
-- Name: COLUMN posts.hero_subtitle; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.hero_subtitle IS 'Hero section subtitle/description';


--
-- Name: COLUMN posts.hero_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.hero_tags IS 'Hero section tags/badges array';


--
-- Name: COLUMN posts.hero_location; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.hero_location IS 'Hero section location text';


--
-- Name: COLUMN posts.hero_year; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.posts.hero_year IS 'Hero section year';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    image_url character varying(500),
    tags text[] DEFAULT '{}'::text[],
    location character varying(255),
    area character varying(100),
    year character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subtitle text,
    sections jsonb DEFAULT '[]'::jsonb
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'Portfolio projects table storing all project information including metadata, images, and design zones';


--
-- Name: COLUMN projects.subtitle; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.subtitle IS 'Project subtitle';


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE site_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.site_settings IS 'Site configuration key-value pairs for dynamic settings';


--
-- Name: COLUMN site_settings.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.site_settings.key IS 'Ключ налаштування (наприклад, company_name)';


--
-- Name: COLUMN site_settings.value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.site_settings.value IS 'Значення налаштування';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'admin'::text,
    created_at timestamp with time zone DEFAULT now(),
    token_version integer DEFAULT 0 NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	68182a315613d5815f8689e6273d826774a95bea4d8328560777ad2f19390322	1773861067480
2	d0cd17cef3ace3da2c8c5ce4fd12e041c295ce7c655038125aba7bf88d7ba969	1777129377686
3	98c7a10d0979b44a7773fc25d6012cccf6cdd94f264e8c3251f10a06b42de99f	1777305368586
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_email, action, entity_type, entity_id, entity_title, changes, created_at) FROM stdin;
8c6c7d42-fa3f-4c20-9f46-e7a9cd846130	admin@example.com	create	project	9585060c-dfab-4240-b2b1-2786b3504172	пекарня “Рецептура”	{"media_added": 1}	2026-02-12 18:42:16.427876+00
03e36d23-63ed-45ee-a2be-f331c4352b62	admin@example.com	update	project	9585060c-dfab-4240-b2b1-2786b3504172	пекарня “Рецептура”	{}	2026-02-12 18:47:01.895265+00
762b7d12-3741-4835-8866-fb86df87b4db	admin@example.com	update	project	9585060c-dfab-4240-b2b1-2786b3504172	Пекарня “Рецептура”	{"fields": ["title", "subtitle"]}	2026-02-13 08:55:59.361609+00
b6aea00d-8aa0-4c03-8475-f915ebb20586	admin@example.com	update	project	9585060c-dfab-4240-b2b1-2786b3504172	Пекарня “Рецептура”	{"fields": ["subtitle", "tags"]}	2026-02-13 09:17:35.419458+00
9650615d-b677-4318-9e9d-f76d8f3180d9	admin@example.com	create	post	2fad8e7d-b710-4577-9f70-9ea42694745d	Привіт	{"blocks_count": 2}	2026-02-13 10:25:49.617932+00
078fdada-c422-45c5-abbf-ea4cc8734291	admin@example.com	create	post	1e1d0ebb-2c2d-4b1a-8817-e3170b9bc03f	Привіт	{"blocks_count": 2}	2026-02-13 10:41:56.342283+00
c5dc2b1a-052a-4b3b-866a-7528ebcdc543	admin@example.com	update	post	1e1d0ebb-2c2d-4b1a-8817-e3170b9bc03f	Привіт Привіт	{"fields": ["title", "slug", "status"], "blocks_count": 2}	2026-02-13 10:42:55.850223+00
ff0f63bf-f267-4854-947e-12093a6f91c1	admin@example.com	create	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 1}	2026-02-13 13:12:42.899105+00
f0a008c7-cdb7-4ae2-8df8-6d5940ca2f3e	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 2}	2026-02-13 13:14:31.862726+00
540d8f6e-9c43-43d6-ac5b-bc40d69b1f23	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 5}	2026-02-13 13:17:19.560741+00
3bd3361f-a729-4151-9289-aa41994cec09	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 6}	2026-02-13 13:19:45.570588+00
fd11abf0-1efb-4efe-a619-b1d24f280549	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7}	2026-02-13 13:27:13.186441+00
f941888f-52f2-4025-8b03-351e19c2342e	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"fields": ["hero_image", "hero_title"], "blocks_count": 7}	2026-02-13 14:32:44.935683+00
76b25918-cf24-4343-8c5f-67608c634f87	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7}	2026-02-13 14:46:57.848961+00
ff4984c9-a012-46cc-91a5-06678cd79d37	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7}	2026-02-13 14:48:06.26192+00
8962cee3-4689-412f-8d68-08612c551369	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7}	2026-02-13 14:48:32.257513+00
17b53c63-a8b3-4c03-b48d-495997750ffa	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7}	2026-02-13 14:48:50.801448+00
07920396-42e4-47b4-9658-fbe02e9bbb5c	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7}	2026-02-13 14:49:03.566868+00
b395c2b6-ac41-4309-8e49-5e32b856acc2	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7, "hero_updated": false}	2026-02-13 15:40:11.737357+00
5ef54074-32c3-40f7-a445-8f12d980f46a	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7, "hero_updated": false}	2026-02-13 16:51:54.120688+00
db4e0f9e-f860-4b50-b581-b99f3bdc3cd5	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Твоя мамка	{"blocks_count": 7, "hero_updated": false}	2026-02-13 17:20:58.4569+00
dfcd25b3-b712-464f-9a7b-84455db7449a	admin@example.com	update	post	605b6613-60d4-4e99-be1f-790beed0207a	Loft stories	{"fields": ["title", "slug"], "blocks_count": 7, "hero_updated": false}	2026-02-13 20:08:25.337699+00
fa95e022-66d5-43cf-9dfe-782a14a52716	admin@example.com	update	post	e0d2977b-00ce-4e88-aae0-c2decd5938d9	Дизайн дитячої кімнати	{"blocks_count": 3, "hero_updated": false}	2026-02-18 11:05:10.811798+00
fe4367ee-3202-47ac-877c-f91977f096c7	admin@example.com	update	post	e0d2977b-00ce-4e88-aae0-c2decd5938d9	Дизайн дитячої кімнати	{"blocks_count": 4, "hero_updated": false}	2026-02-21 20:50:48.910348+00
b0d7b418-ae11-4814-ad05-efafb2f51500	admin@example.com	create	post	431d3d7e-f873-4197-ac7a-0ac6dc0ccc83	TEST TEST	{"hero_fields": ["hero_tags"], "blocks_count": 1, "hero_updated": true}	2026-03-06 11:17:57.390504+00
b4c56523-2381-49b3-bf1f-77f8d828d352	admin@example.com	update	post	431d3d7e-f873-4197-ac7a-0ac6dc0ccc83	TEST TEST	{"fields": ["status"], "blocks_count": 1, "hero_updated": false}	2026-03-06 11:18:31.882166+00
f85b5a28-a789-49a5-a598-064f28465804	admin@example.com	update	post	431d3d7e-f873-4197-ac7a-0ac6dc0ccc83	TEST TEST	{"blocks_count": 1, "hero_updated": false}	2026-03-06 11:18:56.694678+00
7d3c9c88-5846-4d00-bdbe-7af243925672	admin@example.com	update	post	0ed4abdf-2b14-42f0-b663-477e772d44e1	Спа-зона у заміському будинку	{"blocks_count": 7, "hero_updated": false}	2026-03-06 12:50:47.071088+00
cbf74930-4728-4dab-88e9-3739323efdc6	admin@example.com	update	post	6fab4cd6-e7cf-427e-903c-aff6db10c301	Еко-будинок у Полтавській області	{"blocks_count": 6, "hero_updated": false}	2026-03-14 13:34:20.563115+00
67d33aeb-cec0-49f4-91f2-efc3de24c222	admin@example.com	update	post	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	Креативна студія в Подолі	{"blocks_count": 5, "hero_updated": false}	2026-03-15 20:09:38.516866+00
dec72877-76e5-4fc9-8803-f2777b530039	admin@example.com	update	post	bd595cf1-b9f5-4926-a21e-d1c34786f671	Креативна студія в Подолі	{"hero_fields": ["hero_subtitle"], "blocks_count": 5, "hero_updated": true}	2026-03-16 06:58:56.228739+00
da44db62-cf96-49c9-ba06-1fe5d57eea39	admin@b710.design	create	post	923df883-90be-46e5-ab8c-8759d5b07f2c	Найкращий супер пупер ресторан	{"hero_fields": ["hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-24 17:17:05.942961+00
2586304b-3daf-4066-9300-faefade7f866	admin@b710.design	update	post	923df883-90be-46e5-ab8c-8759d5b07f2c	Найкращий супер пупер ресторан	{"fields": ["status"], "blocks_count": 0, "hero_updated": false}	2026-04-24 17:17:12.38227+00
70d34727-b8c9-4817-ad5f-22c32a4498e1	admin@b710.design	create	post	e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	{"hero_fields": ["hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-24 17:56:06.525075+00
5c64b03e-604c-490c-852c-0b01ae764495	admin@b710.design	update	post	bd595cf1-b9f5-4926-a21e-d1c34786f671	Креативна студія в Подолі	{"blocks_count": 5, "hero_updated": false}	2026-04-24 17:57:10.367381+00
5997fc6e-9ad5-4806-9d6b-b4ee0faa8d03	admin@b710.design	update	post	e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	{"hero_fields": ["hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-24 18:00:08.220179+00
c007f0e1-e8a0-4558-9e89-7791bb088b4f	admin@b710.design	update	post	e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	{"blocks_count": 0, "hero_updated": false}	2026-04-24 18:00:15.582179+00
90f0f4f5-6c00-4b35-9078-2689f213afb2	admin@b710.design	update	post	e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	{"blocks_count": 0, "hero_updated": false}	2026-04-24 18:00:38.230544+00
4982374d-479f-4b29-a25e-8ee4d6974e75	admin@b710.design	update	post	e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	{"fields": ["status"], "blocks_count": 0, "hero_updated": false}	2026-04-24 18:00:45.492637+00
80a2af72-84ce-44aa-accf-d1fda5966096	admin@b710.design	delete	post	e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	{}	2026-04-25 04:59:35.6385+00
777d1a0e-7f1b-4c77-991f-8288220a1ebc	admin@b710.design	delete	post	923df883-90be-46e5-ab8c-8759d5b07f2c	Найкращий супер пупер ресторан	{}	2026-04-25 04:59:42.360985+00
a7f082b3-fba3-41c6-a32a-573dcfaf0aee	admin@b710.design	create	post	574fc5b2-af1a-43c1-a121-99a38b219d22	Проєкт кав	{"hero_fields": ["hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-25 05:01:25.507347+00
14088e4d-0537-453f-a2a6-b49f1da65638	admin@b710.design	delete	post	574fc5b2-af1a-43c1-a121-99a38b219d22	Проєкт кав	{}	2026-04-25 05:02:55.31183+00
c53fbeb5-482c-4e6e-ba0f-e3d3502d0312	admin@b710.design	create	post	334fd28c-33c2-4691-b73a-dfe39101a388	ffffff	{"hero_fields": ["hero_image", "hero_subtitle", "hero_tags", "hero_location"], "blocks_count": 0, "hero_updated": true}	2026-04-25 16:19:35.636862+00
be84ca80-184d-4854-8db0-145665fef924	admin@b710.design	create	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"hero_fields": ["hero_image", "hero_title", "hero_subtitle", "hero_tags", "hero_location", "hero_year"], "blocks_count": 0, "hero_updated": true}	2026-04-25 05:45:11.974124+00
4e9cdf30-4ad6-40af-bf44-c00ecbd90a0f	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"hero_fields": ["hero_image"], "blocks_count": 0, "hero_updated": true}	2026-04-25 06:00:44.952955+00
98fae7af-4b91-4df9-bd9c-4376f6155177	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"hero_fields": ["hero_image"], "blocks_count": 0, "hero_updated": true}	2026-04-25 06:04:31.878859+00
6c561d2e-1a1b-41f4-90e3-9cc455c71760	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"hero_fields": ["hero_image"], "blocks_count": 0, "hero_updated": true}	2026-04-25 06:30:44.81945+00
24efca58-d1bf-40c4-91f4-01aab7efd114	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"hero_fields": ["hero_subtitle"], "blocks_count": 1, "hero_updated": true}	2026-04-25 07:21:10.461537+00
cd21eca0-d9d1-40eb-bb0a-e5a6ed23c60b	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"blocks_count": 2, "hero_updated": false}	2026-04-25 07:22:06.234685+00
177f7544-f50e-4a9d-a377-9560d1afbf48	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"blocks_count": 3, "hero_updated": false}	2026-04-25 07:26:44.959499+00
8d56d67a-39d5-4244-a98b-3c5a75695370	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"blocks_count": 3, "hero_updated": false}	2026-04-25 07:34:01.615334+00
68236218-82f0-4088-95b8-a391d3b635c1	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"blocks_count": 4, "hero_updated": false}	2026-04-25 07:35:22.017539+00
2701c6af-da90-45c7-b007-3cd48bb6bf7b	admin@b710.design	update	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{"blocks_count": 5, "hero_updated": false}	2026-04-25 07:48:14.641358+00
e29217a6-9ca0-4ac0-a409-fe6630c21ee3	admin@b710.design	delete	post	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	{}	2026-04-25 08:10:33.67807+00
addb9ac9-7e83-42ca-b44f-8304b75155a0	admin@b710.design	create	post	50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	{"hero_fields": ["hero_image", "hero_title", "hero_tags", "hero_year"], "blocks_count": 0, "hero_updated": true}	2026-04-25 08:20:01.271433+00
497e6871-4f19-4a23-88ea-27ab8bb24390	admin@b710.design	update	post	50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	{"hero_fields": ["hero_image"], "blocks_count": 0, "hero_updated": true}	2026-04-25 08:25:49.451269+00
eef82f9f-6bf0-4cc1-b61e-fc0686772127	admin@b710.design	update	post	50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	{"blocks_count": 0, "hero_updated": false}	2026-04-25 08:32:13.471812+00
3b0a0a9a-df7a-40fc-824c-c51e5f4041bb	admin@b710.design	update	post	50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	{"blocks_count": 1, "hero_updated": false}	2026-04-25 08:33:58.411573+00
26be87e1-e30f-4be9-ad0b-608cb8f12bfb	admin@b710.design	update	post	50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	{"fields": ["status"], "blocks_count": 1, "hero_updated": false}	2026-04-25 08:34:11.604927+00
81056dc4-f893-4c6b-9959-b1b5aaee856f	admin@b710.design	create	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"hero_fields": ["hero_image", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-25 10:06:13.238492+00
8ea31aa8-db96-4697-8bda-de16763f24b9	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:07:52.43626+00
063c7376-0558-440f-9744-b99c7b3b4cb9	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:08:17.058305+00
29919966-dc87-45f5-ae80-f0ac82a4bc4b	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:10:08.244122+00
27aeadd2-2a64-4fde-a8c6-2b51c3fadcc3	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:10:12.193915+00
a1d9efea-b52a-46f0-8655-faf1eeb33d27	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"fields": ["status"], "blocks_count": 1, "hero_updated": false}	2026-04-25 10:10:18.551261+00
faced628-4d87-49a0-9c2a-fe32bcd288ca	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:15:25.395789+00
aa174b8d-b4bc-475a-abfa-5ee4fba9190d	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"fields": ["status"], "blocks_count": 1, "hero_updated": false}	2026-04-25 10:15:33.649682+00
2e6ea2b9-1607-4421-a722-0ea8c72e4985	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"fields": ["status"], "blocks_count": 1, "hero_updated": false}	2026-04-25 10:15:46.491338+00
91036384-f979-4570-a92f-41b5fe5d5d70	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:22:13.64469+00
188f86fa-0084-4387-8ea2-d3f4676d62c9	admin@b710.design	delete	post	bd595cf1-b9f5-4926-a21e-d1c34786f671	Креативна студія в Подолі	{}	2026-04-25 10:24:08.247758+00
0d78595b-e8d4-4d90-8a4f-89ef5e6dce1e	admin@b710.design	delete	post	50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	{}	2026-04-25 10:24:19.196531+00
a531efe9-1af0-4c46-8bde-68a6194b885b	admin@b710.design	delete	post	05c52245-70e5-4803-8be4-696ef03a797e	Сучасний офіс IT-компанії у Львові	{}	2026-04-25 10:24:22.916226+00
6094bb32-c086-48d2-8bc4-7ed93f22f0a6	admin@b710.design	delete	post	a7302580-dcf6-4d8a-9234-65b963d7c161	Спа-зона у заміському будинку	{}	2026-04-25 10:24:24.527387+00
e64b0cea-d203-4cd7-9044-5d169e4b1dc6	admin@b710.design	delete	post	5d8d9cbb-658a-4646-958d-f91ff0092b76	Альпійський шале у Карпатах	{}	2026-04-25 10:24:26.186353+00
45f32665-2fff-42f2-9a74-deba913a7413	admin@b710.design	delete	post	50c54bd6-4cab-43e9-bc85-358f71a24d33	Морська квартира в Одесі	{}	2026-04-25 10:24:28.679502+00
7963218b-a466-4097-80c2-2f7d2e5cbc7f	admin@b710.design	delete	post	646d8336-e8f3-4d8f-9d9e-d68a93253582	Мінімалістична квартира в центрі Києва	{}	2026-04-25 10:24:38.937731+00
fecc857b-f58f-4445-ad77-22109c004cc2	admin@b710.design	delete	post	49cc5332-43ab-4947-a33f-0af03bf81aa9	Скандинавська вітальня у Дніпрі	{}	2026-04-25 10:24:40.301778+00
6e490ec8-50c3-4def-bf09-cdefb55e5f8c	admin@b710.design	delete	post	64ae2739-3203-4599-a72e-3f20508853f9	Лофт-квартира в Одесі	{}	2026-04-25 10:24:41.7865+00
3e00560f-17a2-450d-9b18-04fe027fcea1	admin@b710.design	delete	post	3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	Японський сад у Києві	{}	2026-04-25 10:24:43.271519+00
d489215b-172d-4195-ba1a-56dc133039b8	admin@b710.design	delete	post	0f50200f-f129-432f-942d-04721342a83d	Київський пентхаус з терасою	{}	2026-04-25 10:24:49.406226+00
c989c60a-5431-41d1-869b-1c5d9c69863f	admin@b710.design	delete	post	6fab4cd6-e7cf-427e-903c-aff6db10c301	Еко-будинок у Полтавській області	{}	2026-04-25 10:24:50.963017+00
483b308e-9396-452d-b376-f68965579c51	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	тестовий пост номер 2	{"blocks_count": 1, "hero_updated": false}	2026-04-25 10:31:26.920409+00
8d0be2aa-19a1-4495-b917-e9137496e391	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"fields": ["title", "slug"], "blocks_count": 1, "hero_updated": false}	2026-04-25 10:32:02.441759+00
3e8403b7-8e4f-49c0-988a-925b11ab8ada	admin@b710.design	delete	post	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	Креативна студія в Подолі	{}	2026-04-25 14:30:37.329809+00
297e9795-a4a4-4d51-a849-8850b35c7b7b	admin@b710.design	create	post	679f998f-f0a1-4429-b853-f90b20ae3cd1	sss	{"hero_fields": ["hero_image", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-25 15:25:07.353697+00
142e91b3-d1dc-4548-a255-6b95db1ca2fb	admin@b710.design	delete	post	679f998f-f0a1-4429-b853-f90b20ae3cd1	sss	{}	2026-04-25 16:19:48.130363+00
f9a79e68-e319-40ae-a55c-c77f1882b721	admin@b710.design	delete	post	334fd28c-33c2-4691-b73a-dfe39101a388	ffffff	{}	2026-04-25 16:19:48.156909+00
4f4d9eac-80a6-4b33-950a-8e7f119a08e0	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"blocks_count": 1, "hero_updated": false}	2026-04-25 17:57:50.232477+00
0b269c3e-b071-4c14-bc78-539c93c5160f	admin@b710.design	create	post	7a07c1c2-3bc8-4f12-b5b4-877f4dc1915d	Treskare	{"hero_fields": ["hero_image", "hero_title", "hero_tags", "hero_location", "hero_year"], "blocks_count": 0, "hero_updated": true}	2026-04-27 13:18:41.615113+00
48695e7d-c65d-4789-8b2f-c0836d150986	admin@b710.design	update	post	7a07c1c2-3bc8-4f12-b5b4-877f4dc1915d	Treskare	{"fields": ["status"], "blocks_count": 0, "hero_updated": false}	2026-04-27 13:19:26.836971+00
707ac4ba-ad71-412d-99a0-d1606a293e2a	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"blocks_count": 2, "hero_updated": false}	2026-04-27 13:40:52.146786+00
2499b648-d77b-49c1-8574-c16c940576e8	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"blocks_count": 2, "hero_updated": false}	2026-04-27 13:41:51.123591+00
f20237de-d97a-49b6-bed5-57696b016bd6	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"blocks_count": 2, "hero_updated": false}	2026-04-27 13:45:04.09523+00
f82a8620-028a-4e19-b089-ce421694b8fc	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"blocks_count": 2, "hero_updated": false}	2026-04-27 13:45:39.989441+00
4346b9c1-ba26-448d-9bd2-0fa1b5ac1689	admin@b710.design	update	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{"blocks_count": 2, "hero_updated": false}	2026-04-27 13:46:47.649628+00
4784cab7-8df2-4c89-b87e-a2af7c65493f	admin@b710.design	update	post	7a07c1c2-3bc8-4f12-b5b4-877f4dc1915d	Treskare	{"blocks_count": 1, "hero_updated": false}	2026-04-27 13:54:17.224191+00
9db53e2c-4c53-4a69-b7c0-7f951af7c36e	admin@b710.design	create	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"hero_fields": ["hero_title", "hero_subtitle", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-27 18:07:54.217463+00
df8d6c01-d0b0-4628-9f2f-6291795e3c38	diana@b710.design	create	post	27d69682-b5d9-41c0-8d17-c8d13ca4a312	ssssss	{"hero_fields": ["hero_image", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-27 18:15:57.23755+00
d1b326b8-6e20-41da-94b8-0f4b58d1e58d	admin@b710.design	delete	post	27d69682-b5d9-41c0-8d17-c8d13ca4a312	ssssss	{}	2026-04-27 18:20:52.111943+00
c25b3bb2-d6ad-4bbd-8dd2-083c2b0188bb	admin@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"hero_fields": ["hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-27 18:24:06.972784+00
04d2a049-41f8-4de3-a7db-6903b49f89a1	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"hero_fields": ["hero_tags", "hero_location"], "blocks_count": 0, "hero_updated": true}	2026-04-27 18:44:54.319223+00
ef44e330-0e39-4b69-8892-50999977e801	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"hero_fields": ["hero_year"], "blocks_count": 1, "hero_updated": true}	2026-04-27 18:49:24.153759+00
55e5b3d8-faf9-4900-9bea-122702b88fef	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"fields": ["status"], "blocks_count": 5, "hero_updated": false}	2026-04-27 19:22:48.821976+00
64359839-5d34-4d75-96c2-9aeb3de63e3e	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"blocks_count": 5, "hero_updated": false}	2026-04-27 19:23:50.278369+00
c54a334e-10a4-4d52-97e0-ad03f73a7d41	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"blocks_count": 5, "hero_updated": false}	2026-04-27 19:24:55.75919+00
2c30393d-7f01-4745-a8ac-1183a3e58bc0	admin@admin.com	create	post	dcd175ce-ebd6-4c06-82e7-9cb85a9a58d2	Test Post	{"hero_fields": ["hero_image", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-28 04:50:24.783423+00
7b6ce433-c42b-4d19-b4c5-fe263ae20193	admin@admin.com	create	post	39e14c2c-6066-4f50-833b-f5f7c1150e2b	Test Post With Block Image	{"hero_fields": ["hero_tags"], "blocks_count": 1, "hero_updated": true}	2026-04-28 04:50:54.111123+00
5beb21a2-c775-4113-b2e4-66b1dd59917a	admin@b710.design	create	post	63db0503-09f4-4857-8840-896cf6eafb40	YesChess	{"hero_fields": ["hero_image", "hero_title", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-28 05:04:27.068092+00
00d566fb-f505-4b50-96b4-00a633e00604	admin@admin.com	create	post	e423aade-9a57-4af1-ae38-dd3a4f9a84b8	Verify Upload	{"hero_fields": ["hero_image", "hero_tags"], "blocks_count": 0, "hero_updated": true}	2026-04-28 05:20:09.44758+00
58842ee7-01fb-4bca-b20b-6a8e04aea27e	admin@b710.design	delete	post	e423aade-9a57-4af1-ae38-dd3a4f9a84b8	Verify Upload	{}	2026-04-28 05:22:59.47904+00
7e1c0329-df34-4b17-814a-cb9ae3395670	admin@b710.design	delete	post	dcd175ce-ebd6-4c06-82e7-9cb85a9a58d2	Test Post	{}	2026-04-28 05:22:59.48025+00
2cb91a69-2f27-4fd5-b46a-c22cdd3b3c68	admin@b710.design	delete	post	39e14c2c-6066-4f50-833b-f5f7c1150e2b	Test Post With Block Image	{}	2026-04-28 05:22:59.480519+00
1b115830-9779-4086-9e94-892ebb27a62a	admin@b710.design	create	post	d9f5e807-1e80-4116-bc17-838775da21e4	фф	{"hero_fields": ["hero_image", "hero_tags"], "blocks_count": 2, "hero_updated": true}	2026-04-28 05:23:30.460062+00
d0b8fb18-1cc8-45f5-b06c-f41a1588379b	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"blocks_count": 5, "hero_updated": false}	2026-04-28 07:14:33.893305+00
1c865ed5-bfaf-4f46-8a4e-5f6c75a962b7	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"hero_fields": ["hero_image"], "blocks_count": 5, "hero_updated": true}	2026-04-28 07:14:54.254088+00
240a78f3-1449-4f99-9f44-4bb59cf694f6	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	Проект кав᾿ярні-квіткарні QUARTER	{"blocks_count": 5, "hero_updated": false}	2026-04-28 07:16:12.446491+00
d2d16efc-825e-4a5e-be36-fc70a00053b6	diana@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"fields": ["title"], "hero_fields": ["hero_title"], "blocks_count": 5, "hero_updated": true}	2026-04-28 10:32:40.675673+00
f901817e-ecfb-4167-8b08-dfb77be561d4	admin@b710.design	delete	post	d9f5e807-1e80-4116-bc17-838775da21e4	фф	{}	2026-04-28 16:28:45.886724+00
f0d2d47d-b62e-4c1d-96bd-e7b1c8c59343	admin@b710.design	delete	post	63db0503-09f4-4857-8840-896cf6eafb40	YesChess	{}	2026-04-28 16:28:45.885045+00
efb4e9b5-4b86-4d30-9786-2b4f4921e660	admin@b710.design	create	post	358b9553-ddfb-4978-ba76-6bb6aed3ec90	Супер ресторан	{"hero_fields": ["hero_image", "hero_title", "hero_subtitle", "hero_tags", "hero_location", "hero_year"], "blocks_count": 0, "hero_updated": true}	2026-04-28 16:29:36.36022+00
ccdd07eb-a788-4d69-aaef-9d5bb91aaee9	admin@b710.design	update	post	358b9553-ddfb-4978-ba76-6bb6aed3ec90	Супер ресторан	{"blocks_count": 2, "hero_updated": false}	2026-04-28 16:32:05.429238+00
9e6cac40-0e30-4f46-b81a-7a280ade1ff9	admin@b710.design	update	post	358b9553-ddfb-4978-ba76-6bb6aed3ec90	Супер ресторан	{"blocks_count": 3, "hero_updated": false}	2026-04-28 16:33:22.278595+00
7693340b-9825-4fed-9186-083ca3ed9c18	admin@b710.design	update	post	358b9553-ddfb-4978-ba76-6bb6aed3ec90	Супер ресторан	{"blocks_count": 3, "hero_updated": false}	2026-04-28 16:34:16.675694+00
aa762c6b-de89-42f1-9312-38bad67f7846	admin@b710.design	create	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца 2	{"hero_fields": ["hero_image", "hero_title", "hero_subtitle", "hero_tags", "hero_location", "hero_year"], "blocks_count": 0, "hero_updated": true}	2026-04-28 17:14:35.863271+00
8fa22354-c451-460a-8483-60eafe7f7e00	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"fields": ["title", "slug"], "blocks_count": 0, "hero_updated": false}	2026-04-28 17:14:44.026777+00
858a7d86-ddc1-4ffe-afeb-2a540a27cd90	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 1, "hero_updated": false}	2026-04-28 17:16:07.519091+00
d5fbe3d9-a839-4dd6-9baf-84ae75988b52	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 3, "hero_updated": false}	2026-04-28 17:17:47.186667+00
207b92ab-c3d4-4727-8aad-faa1cdb2a7c3	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 3, "hero_updated": false}	2026-04-28 17:19:05.684087+00
16831495-d407-48dd-8428-e9f2ede03518	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 3, "hero_updated": false}	2026-04-28 17:19:56.836942+00
c24c7733-e5b4-4843-aace-e7efdb8c1ad7	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 4, "hero_updated": false}	2026-04-28 17:20:55.845122+00
0b7e071f-126b-41f4-a77a-c3aef2ec0e83	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 4, "hero_updated": false}	2026-04-28 17:21:35.102706+00
b57393d3-ca50-41a0-82a5-326bc9c3621c	admin@b710.design	update	post	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	{"blocks_count": 5, "hero_updated": false}	2026-04-28 17:23:09.27302+00
f9be14fd-5cbb-4135-a4b6-a7fb6b625bd9	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:26:39.235774+00
3d8c4fd5-fa10-4257-b5f5-d8628d8b12d7	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:27:26.005899+00
1a986e97-5992-4686-8c89-e750a2b83812	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:47:32.281972+00
dbfc334b-deec-4af1-b853-d642f6a5cf34	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:48:12.390486+00
933128cc-3da5-4695-84aa-1c35d50f0f04	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:48:28.185315+00
b45bfb0a-17cb-4673-b62f-077606ddecc8	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:48:43.001971+00
0302e870-2672-42d9-906e-bbee33a6f5f3	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:49:03.330065+00
22828d94-a57b-4b30-a1ca-5cd7b97fa866	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 10:50:42.282089+00
62646a50-0fb3-4ff5-82c4-4d0ab6eca3a7	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 11:05:33.664815+00
4a1650dc-95d6-45f2-b1db-5b847ada47c4	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 11:05:50.068637+00
8a38d30b-5151-4b9c-8b33-6f7afd93d4f7	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 11:06:14.503383+00
dbb19449-afa6-4afe-94ac-3c452c21a7a6	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 11:07:27.224691+00
2a570f06-febb-4be1-afba-cbb38d43276d	diana2@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 11:16:52.671899+00
f977f936-1766-45f3-ad37-a9e7f2b9924e	admin@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 19:15:34.746659+00
4a76747e-cc85-44e9-9ca8-ccdcdd11f0d8	admin@b710.design	update	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{"blocks_count": 5, "hero_updated": false}	2026-04-29 19:16:00.783429+00
15db5441-9e22-4cc4-8850-86ce79a2df25	diana@b710.design	delete	post	d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	{}	2026-05-06 09:22:36.686059+00
36acf6ea-79f7-4c0d-826d-12ee3c285de7	diana@b710.design	delete	post	242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	{}	2026-05-06 09:22:43.522397+00
\.


--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blocks (id, post_id, type, data, sort_order, created_at) FROM stdin;
ee33d7f6-96c0-4931-90fd-ce327d738bd3	646d8336-e8f3-4d8f-9d9e-d68a93253582	text_full	{"area": "78 м²", "year": 2024, "label": "Про проєкт", "months": "4 місяці", "content": "Цей проєкт — приклад того, як менше може бути більше. Площа 78 м², але завдяки продуманій плануванні та світлій палітрі простір здається набагато більшим."}	0	2026-03-06 21:19:39.17918+00
0f5d2a62-ae94-44cc-85b4-bbe01404a429	646d8336-e8f3-4d8f-9d9e-d68a93253582	image_full	{"alt": "Вітальня з панорамними вікнами", "caption": "Вітальня — серце квартири", "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920"}	1	2026-03-06 21:19:39.17918+00
c489e417-96d0-443f-979a-b93470634290	646d8336-e8f3-4d8f-9d9e-d68a93253582	text_image	{"icon": "solar:sofa-linear", "text": "Вітальня — серце квартири. М'які лінії меблів, натуральні матеріали та акцентні рослини створюють атмосферу затишку.", "label": "Вітальня", "title": "Зона відпочинку", "features": ["Площа 28 м²", "Натуральне дерево", "Розумне освітлення"], "image_url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920"}	2	2026-03-06 21:19:39.17918+00
6a6727bb-3c49-47c0-8acd-ff7fdd031b27	646d8336-e8f3-4d8f-9d9e-d68a93253582	image_text	{"icon": "solar:chef-hat-linear", "text": "Кухонна зона поєднана з вітальнею, що дозволяє спілкуватися з близькими під час готування.", "label": "Кухня", "title": "Кухонна зона", "features": ["Кухонний острів", "Вбудована техніка"], "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"}	3	2026-03-06 21:19:39.17918+00
af59ac20-b6e8-4733-b4c9-4a5d01222d5a	646d8336-e8f3-4d8f-9d9e-d68a93253582	text_image	{"icon": "solar:bed-linear", "text": "Спальня — місце для відновлення сил. Спокійні відтінки та м'які текстури створюють атмосферу розслаблення.", "label": "Спальня", "title": "Головна спальня", "features": ["Площа 18 м²", "Гардеробна"], "image_url": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920"}	4	2026-03-06 21:19:39.17918+00
db6432e0-f044-493a-ab5c-f0acde8a4b38	646d8336-e8f3-4d8f-9d9e-d68a93253582	text_full	{"label": "Матеріали", "content": "Ми використали виключно натуральні та екологічні матеріали: дуб, камінь, льон."}	5	2026-03-06 21:19:39.17918+00
9f40689e-ab4b-410e-837b-d81b727d8b13	49cc5332-43ab-4947-a33f-0af03bf81aa9	text_full	{"area": "32 м²", "year": 2024, "label": "Про проєкт", "months": "3 місяці", "content": "Скандинавський стиль — це про функціональність, затишок та світло. Ця вітальня стала серцем дому, де сім'я проводить вечори разом."}	0	2026-03-06 21:19:39.519511+00
ece90500-f89b-422b-bbb3-03cdf3b99005	49cc5332-43ab-4947-a33f-0af03bf81aa9	image_full	{"alt": "Світла вітальня з дерев'яними акцентами", "caption": "Гармонія світла та текстур", "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920"}	1	2026-03-06 21:19:39.519511+00
fba62723-7df8-428f-a601-a356b7b0a310	49cc5332-43ab-4947-a33f-0af03bf81aa9	text_image	{"icon": "solar:sofa-linear", "text": "М'які дивани, пледи та подушки створюють атмосферу hygge — данського затишку.", "label": "Зона відпочинку", "title": "Місце збору родини", "features": ["Натуральні тканини", "Тепле освітлення", "Дерев'яні акценти"], "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920"}	2	2026-03-06 21:19:39.519511+00
9bb484c6-130b-4fd2-bafd-c077510e5de2	49cc5332-43ab-4947-a33f-0af03bf81aa9	image_text	{"icon": "solar:book-linear", "text": "Куток для читання з комфортним кріслом та торшером — ідеальне місце для вечірнього відпочинку.", "label": "Куток читання", "title": "Зона релаксації", "features": ["Ергономічне крісло", "Регульоване освітлення"], "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920"}	3	2026-03-06 21:19:39.519511+00
80c8d939-c0d5-46d9-a1d3-062bae92e59e	49cc5332-43ab-4947-a33f-0af03bf81aa9	text_full	{"label": "Матеріали", "content": "Біла деревина, льон, вовна — натуральні матеріали, що дихають."}	4	2026-03-06 21:19:39.519511+00
1c4a06e6-02ec-4d07-8a15-f59e6b3f5625	64ae2739-3203-4599-a72e-3f20508853f9	text_full	{"area": "95 м²", "year": 2024, "label": "Про проєкт", "months": "5 місяців", "content": "Колишній промисловий простір перетворено на сучасне житло зі збереженням індустріального характеру."}	0	2026-03-06 21:19:39.785609+00
7e272994-7d34-4741-a05c-a00c5e24d3a8	64ae2739-3203-4599-a72e-3f20508853f9	image_full	{"alt": "Відкритий простір лофту", "caption": "Високі стелі та відкрита цегла", "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920"}	1	2026-03-06 21:19:39.785609+00
65df60dd-bd13-4d69-932b-849a3f11dbd0	64ae2739-3203-4599-a72e-3f20508853f9	text_image	{"icon": "solar:sofa-linear", "text": "Відкрита планування поєднує вітальню, кухню та обідню зону в єдиний простір.", "label": "Вітальня", "title": "Відкритий простір", "features": ["Висота стелі 4.5 м", "Відкрита цегла", "Металеві балки"], "image_url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920"}	2	2026-03-06 21:19:39.785609+00
6898b2cf-4099-4d72-969f-21956c72bde0	64ae2739-3203-4599-a72e-3f20508853f9	image_text	{"icon": "solar:chef-hat-linear", "text": "Кухня з бетонними стільницями та професійною технікою.", "label": "Кухня", "title": "Кулінарна зона", "features": ["Бетонні стільниці", "Професійна техніка"], "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"}	3	2026-03-06 21:19:39.785609+00
e3081e4f-bc21-4a00-9dea-ca8727f30d9f	64ae2739-3203-4599-a72e-3f20508853f9	text_image	{"icon": "solar:bed-linear", "text": "Спальня на антресолі — приватний простір над загальним.", "label": "Спальня", "title": "Антресоль", "features": ["Площа 20 м²", "Вікна у підлогу"], "image_url": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920"}	4	2026-03-06 21:19:39.785609+00
09c58545-a4e2-4233-b3b7-6afaeb442617	64ae2739-3203-4599-a72e-3f20508853f9	text_full	{"label": "Матеріали", "content": "Цегла, бетон, метал, скло — матеріали, що розповідають історію місця."}	5	2026-03-06 21:19:39.785609+00
e3e3c76c-a6d2-42ce-bd9c-1e1647456d54	05c52245-70e5-4803-8be4-696ef03a797e	text_full	{"area": "450 м²", "year": 2024, "label": "Про проєкт", "months": "6 місяців", "content": "Офіс для IT-команди, що поєднує open-space з приватними зонами для фокусної роботи."}	0	2026-03-06 21:19:40.07321+00
ffb7532a-1ab5-41f6-8579-ba2b805874ef	05c52245-70e5-4803-8be4-696ef03a797e	image_full	{"alt": "Open-space робоча зона", "caption": "Простір для командної роботи", "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"}	1	2026-03-06 21:19:40.07321+00
e0f7ff40-4122-4d5a-b292-5627023485db	05c52245-70e5-4803-8be4-696ef03a797e	text_image	{"icon": "solar:monitor-linear", "text": "Open-space з ергономічними робочими місцями та природним освітленням.", "label": "Робоча зона", "title": "Open-space", "features": ["50 робочих місць", "Ергономічні меблі", "Природне світло"], "image_url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920"}	2	2026-03-06 21:19:40.07321+00
c38807eb-c6e6-4524-97c3-22725ccce03c	05c52245-70e5-4803-8be4-696ef03a797e	image_text	{"icon": "solar:users-group-rounded-linear", "text": "Переговорні кімнати різного розміру для командних зустрічей та дзвінків.", "label": "Переговорні", "title": "Зони для зустрічей", "features": ["6 переговорних", "Звуконепроникність"], "image_url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920"}	3	2026-03-06 21:19:40.07321+00
2f07b493-dc6d-4275-ade7-9658e3e4fa86	05c52245-70e5-4803-8be4-696ef03a797e	text_full	{"label": "Матеріали", "content": "Метал, скло, акустичні панелі — матеріали для продуктивного середовища."}	4	2026-03-06 21:19:40.07321+00
89dae240-7da3-4b64-b677-e9b0e3c08830	3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	text_full	{"area": "120 м²", "year": 2024, "label": "Про проєкт", "months": "4 місяці", "content": "Японський сад — це медитація у русі. Кожен елемент має значення, кожен камінь — історію."}	0	2026-03-06 21:19:56.328588+00
e3bde746-9532-4a3a-ae29-107c28eabf8f	3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	image_full	{"alt": "Сад з камінням та рослинами", "caption": "Гармонія природи", "image_url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920"}	1	2026-03-06 21:19:56.328588+00
7f486405-a305-4efe-91bc-9ae585d523fa	3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	text_image	{"icon": "solar:leaf-linear", "text": "Рослини обрані за принципом чотирьох сезонів — цвітіння навесні, зелень влітку, барви восени, структура взимку.", "label": "Рослини", "title": "Сезонна гармонія", "features": ["Японські клени", "Сакура", "Хвоя"], "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920"}	2	2026-03-06 21:19:56.328588+00
ec686420-28d4-42d1-a702-7e79fb385c6b	3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	image_text	{"icon": "solar:water-linear", "text": "Мініатюрний ставок з коропами кої та кам'яним містком.", "label": "Водойма", "title": "Зона води", "features": ["Ставок з кої", "Кам'яний місток"], "image_url": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920"}	3	2026-03-06 21:19:56.328588+00
e5461e6c-d949-4f83-a9b8-0ee2d6026dde	3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	text_full	{"label": "Матеріали", "content": "Природний камінь, бамбук, галька — матеріали, що старіють разом із садом."}	4	2026-03-06 21:19:56.328588+00
caf14260-1080-4908-8c7c-29f470892110	a7302580-dcf6-4d8a-9234-65b963d7c161	text_full	{"area": "35 м²", "year": 2024, "label": "Про проєкт", "months": "3 місяці", "content": "Приватна спа-зона з сауною, басейном та зоною релаксації — місце для відновлення енергії."}	0	2026-03-06 21:19:40.337689+00
88595280-0318-4122-9d16-7963900211ef	a7302580-dcf6-4d8a-9234-65b963d7c161	image_full	{"alt": "Басейн з підсвічуванням", "caption": "Вода як джерело спокою", "image_url": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920"}	1	2026-03-06 21:19:40.337689+00
c55ca07c-e478-4fd0-9e35-6b2a88f59950	a7302580-dcf6-4d8a-9234-65b963d7c161	text_image	{"icon": "solar:bath-linear", "text": "Фінська сауна з дерев'яним оздобленням та ергономічними лавами.", "label": "Сауна", "title": "Зона тепла", "features": ["Температура до 90°C", "Ароматерапія", "Дерев'яне оздоблення"], "image_url": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920"}	2	2026-03-06 21:19:40.337689+00
5e51fcc9-bbc8-4cab-8774-8a1fee4f5950	a7302580-dcf6-4d8a-9234-65b963d7c161	image_text	{"icon": "solar:swimming-linear", "text": "Купіль з холодною водою для контрастних процедур.", "label": "Купіль", "title": "Зона охолодження", "features": ["Контрастні процедури", "Підігрів підлоги"], "image_url": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920"}	3	2026-03-06 21:19:40.337689+00
9fbe85a0-aa70-45b3-b75e-7aec26b16613	a7302580-dcf6-4d8a-9234-65b963d7c161	text_full	{"label": "Матеріали", "content": "Кедр, камінь, натуральний камінь — матеріали, що створюють атмосферу wellness."}	4	2026-03-06 21:19:40.337689+00
f9c9f0b0-0bd9-42b5-980e-67384012a555	0f50200f-f129-432f-942d-04721342a83d	text_full	{"area": "150 м²", "year": 2024, "label": "Про проєкт", "months": "7 місяців", "content": "Пентхаус на останньому поверсі з 360-градусним видом на Київ та приватною терасою."}	0	2026-03-06 21:19:56.634641+00
91987d96-d71d-4960-b771-bba83ff4c914	0f50200f-f129-432f-942d-04721342a83d	image_full	{"alt": "Вітальня з панорамним видом", "caption": "Київ як частина інтер'єру", "image_url": "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1920"}	1	2026-03-06 21:19:56.634641+00
bda8a923-5f1a-45cf-9947-0bce9239eff5	0f50200f-f129-432f-942d-04721342a83d	text_image	{"icon": "solar:city-linear", "text": "Панорамні вікна від підлоги до стелі відкривають вид на місто.", "label": "Вітальня", "title": "Місто у вікні", "features": ["360° вид", "Панорамні вікна", "Домашній кінотеатр"], "image_url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920"}	2	2026-03-06 21:19:56.634641+00
be5e3cef-9011-4bde-9f38-9f4bc6180bb1	0f50200f-f129-432f-942d-04721342a83d	image_text	{"icon": "solar:sun-linear", "text": "Приватна тераса 45 м² з зоною барбекю та джакузі.", "label": "Тераса", "title": "Під відкритим небом", "features": ["Зона барбекю", "Джакузі", "Зона відпочинку"], "image_url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920"}	3	2026-03-06 21:19:56.634641+00
4f395de4-1136-4717-9e4d-1ae396437919	0f50200f-f129-432f-942d-04721342a83d	text_full	{"label": "Матеріали", "content": "Марmur, шкіра, латунь — матеріали, що підкреслюють статус."}	4	2026-03-06 21:19:56.634641+00
f3c91d15-37d5-4ff0-8382-b9fabeb628e8	5d8d9cbb-658a-4646-958d-f91ff0092b76	text_full	{"area": "180 м²", "year": 2024, "label": "Про проєкт", "months": "8 місяців", "content": "Традиційне альпійське шале з сучасними акцентами — місце, де природа зустрічається з комфортом."}	0	2026-03-06 21:19:55.752916+00
39e9904b-7b3b-4317-a712-e6523b8d4c87	5d8d9cbb-658a-4646-958d-f91ff0092b76	image_full	{"alt": "Вітальня з каміном", "caption": "Камін — серце шале", "image_url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920"}	1	2026-03-06 21:19:55.752916+00
d5c836a8-a5a1-428a-8315-edd5fd252f5e	5d8d9cbb-658a-4646-958d-f91ff0092b76	text_image	{"icon": "solar:fire-linear", "text": "Двоповерхова вітальня з панорамними вікнами та відкритим каміном.", "label": "Вітальня", "title": "Головна зона", "features": ["Двоповерхова висота", "Панорамні вікна", "Камін на дровах"], "image_url": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1920"}	2	2026-03-06 21:19:55.752916+00
f2a7cf96-9125-47eb-bcb5-13c9959230b3	5d8d9cbb-658a-4646-958d-f91ff0092b76	image_text	{"icon": "solar:bed-linear", "text": "Три спальнї з видом на гори та власними ванними кімнатами.", "label": "Спальні", "title": "Приватні зони", "features": ["3 спальні", "Вид на гори", "Ванні кімнати"], "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920"}	3	2026-03-06 21:19:55.752916+00
b9d3e2e2-b5df-442a-b87f-60216490beae	5d8d9cbb-658a-4646-958d-f91ff0092b76	text_full	{"label": "Матеріали", "content": "Масив сосни, камінь, мідь — натуральні матеріали гірського краю."}	4	2026-03-06 21:19:55.752916+00
af4c3c55-4f97-4393-b120-004f8e97d948	6fab4cd6-e7cf-427e-903c-aff6db10c301	text_full	{"area": "200 м²", "year": 2024, "label": "Про проєкт", "months": "10 місяців", "content": "Будинок з мінімальним впливом на довкілля: сонячні панелі, збирання дощової води, локальна система очищення."}	0	2026-03-06 21:19:56.948485+00
5911bd54-c91d-4ae4-ac9a-a67b3745fe05	6fab4cd6-e7cf-427e-903c-aff6db10c301	image_full	{"alt": "Фасад з натуральних матеріалів", "caption": "Гармонія з природою", "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"}	1	2026-03-06 21:19:56.948485+00
21bbe940-e5e2-4fa7-9043-87698906f3a3	6fab4cd6-e7cf-427e-903c-aff6db10c301	text_image	{"icon": "solar:sun-linear", "text": "Сонячні панелі на даху забезпечують 80% енергопотреб будинку.", "label": "Енергоефективність", "title": "Сонячна енергія", "features": ["Сонячні панелі", "Тепловий насос", "Тришарові вікна"], "image_url": "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920"}	2	2026-03-06 21:19:56.948485+00
a09ebf0a-992a-4229-a29e-2e78c2eff216	6fab4cd6-e7cf-427e-903c-aff6db10c301	image_text	{"icon": "solar:water-linear", "text": "Система збирання дощової води для поливу та технічних потреб.", "label": "Водозбір", "title": "Дощова вода", "features": ["Збір дощової води", "Локальна очистка"], "image_url": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920"}	3	2026-03-06 21:19:56.948485+00
44f656b7-fab0-48dd-a195-e53152e20879	6fab4cd6-e7cf-427e-903c-aff6db10c301	text_full	{"label": "Матеріали", "content": "Дерево з сталих лісів, глиняна штукатурка, очерет — локальні матеріали."}	4	2026-03-06 21:19:56.948485+00
ea55f2c9-62d0-4cec-a6d2-7466d1f766a1	50c54bd6-4cab-43e9-bc85-358f71a24d33	text_full	{"area": "85 м²", "year": 2024, "label": "Про проєкт", "months": "4 місяці", "content": "Квартира з видом на море, де середземноморський стиль поєднується з українським гостинністю."}	0	2026-03-06 21:19:56.043901+00
1e34bf04-d1db-4cf9-a7e2-b62f30f659cc	50c54bd6-4cab-43e9-bc85-358f71a24d33	image_full	{"alt": "Вітальня з морським видом", "caption": "Світло та простір", "image_url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920"}	1	2026-03-06 21:19:56.043901+00
a2836999-63d3-46f2-b54f-cc0fcc3c552a	50c54bd6-4cab-43e9-bc85-358f71a24d33	text_image	{"icon": "solar:sun-linear", "text": "Світла палітра, натуральні тканини та акценти блакитного нагадують про море.", "label": "Вітальня", "title": "Зона світла", "features": ["Панорамні вікна", "Блакитні акценти", "Льон та бавовна"], "image_url": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920"}	2	2026-03-06 21:19:56.043901+00
11b97e36-2232-412a-a43e-0c3935a0dd10	50c54bd6-4cab-43e9-bc85-358f71a24d33	image_text	{"icon": "solar:chef-hat-linear", "text": "Кухня з відкритими полицями та керамічною посудом ручної роботи.", "label": "Кухня", "title": "Кулінарна зона", "features": ["Кераміка ручної роботи", "Відкриті полиці"], "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920"}	3	2026-03-06 21:19:56.043901+00
0580869a-208e-4716-8c72-625f68f429c0	50c54bd6-4cab-43e9-bc85-358f71a24d33	text_full	{"label": "Матеріали", "content": "Біла штукатурка, деревина, льон, кераміка — матеріали сонячного узбережжя."}	4	2026-03-06 21:19:56.043901+00
01b0cd9b-cf10-46b7-bc57-303f137b9fa3	6fab4cd6-e7cf-427e-903c-aff6db10c301	three_images	{"images": [{"alt": "", "url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773495257021-rhtjne.png"}, {"alt": "", "url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773495257989-py8is5.jpg"}, {"alt": "", "url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773495258291-sruc9i.jpg"}]}	5	2026-03-14 13:34:19.726973+00
6679f19a-4938-44f2-829f-496b0603c688	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	three_images	{"alt_1": "Робочі столи", "alt_2": "Переговорна кімната", "alt_3": "Зона відпочинку", "images": [{"url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773605376896-8ikd5y.jpg"}, {"url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773605376897-u7zt3g.jpg"}, {"url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773605376897-a5eb8l.jpg"}], "image_url_1": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", "image_url_2": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800", "image_url_3": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"}	1	2026-03-15 20:08:18.340797+00
f10fdc22-4250-4017-8950-d371f5c4c1de	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	image_text	{"icon": "solar:users-group-rounded-linear", "text": "Звуконепроникна перегорна кімната для зустрічей.", "label": "Переговорна", "title": "Зона нарад", "features": ["Звуконепроникність", "Маркерні стіни", "4K дисплеї"], "image_alt": "", "image_url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773605376897-wogay3.png"}	3	2026-03-15 20:08:18.340797+00
9fd1e09b-a5dd-48c4-b393-be1c12b055e5	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	text_full	{"label": "Матеріали", "content": "Ми використали натуральні та стали матеріали: береза, корк, метал, скло."}	4	2026-03-15 20:08:18.340797+00
b91489b2-d452-414e-9ae3-5d98cd9a1d09	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	text_full	{"area": "120 м²", "year": 2024, "label": "Про проєкт", "months": "4 місяці", "content": "Креативна студія для команди з 8 дизайнерів. Простір розділений на зони: open-space для командної роботи, кімнати для фокусу, зона для нарад та кухня-вітальня."}	0	2026-03-15 20:08:18.340797+00
312cd381-9252-45b2-80b9-d361cd613e17	b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	text_image	{"icon": "solar:monitor-linear", "text": "Центральна зона студії — open-space на 8 робочих місць.", "label": "Робоча зона", "title": "Open-space", "features": ["8 ергономічних місць", "Природне освітлення", "Акустичні панелі"], "image_alt": "Open-space робоча зона", "image_url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920"}	2	2026-03-15 20:08:18.340797+00
20f050a2-7846-4c4e-b85a-6e9ffe9ab375	bd595cf1-b9f5-4926-a21e-d1c34786f671	three_images	{"alt_1": "Робочі столи", "alt_2": "Переговорна кімната", "alt_3": "Зона відпочинку", "image_url_1": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", "image_url_2": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800", "image_url_3": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"}	1	2026-03-15 20:08:55.594485+00
22e27d25-aa2b-4bfe-83f4-441451f45d41	bd595cf1-b9f5-4926-a21e-d1c34786f671	text_full	{"area": "120 м²", "year": 2024, "label": "Про проєкт", "months": "4 місяці", "content": "Креативна студія для команди з 8 дизайнерів. Простір розділений на зони: open-space для командної роботи, кімнати для фокусу, зона для нарад та кухня-вітальня."}	0	2026-03-15 20:08:55.594485+00
66880ec1-bc07-4fd6-b31b-9862448cd25b	bd595cf1-b9f5-4926-a21e-d1c34786f671	text_full	{"label": "Матеріали", "content": "Ми використали натуральні матеріали: береза, корк, метал, скло."}	4	2026-03-15 20:08:55.594485+00
bda2057b-cf7d-4779-92c1-4745adb396e7	bd595cf1-b9f5-4926-a21e-d1c34786f671	text_image	{"icon": "solar:monitor-linear", "text": "Центральна зона студії — open-space на 8 робочих місць.", "label": "Робоча зона", "title": "Open-space", "features": ["8 ергономічних місць", "Природне освітлення", "Акустичні панелі"], "image_alt": "Open-space", "image_url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920"}	2	2026-03-15 20:08:55.594485+00
b82ce13d-6569-4c24-a6e6-b53156fcec8d	bd595cf1-b9f5-4926-a21e-d1c34786f671	image_text	{"icon": "solar:users-group-rounded-linear", "text": "Звуконепроникна кімната для зустрічей.", "label": "Переговорна", "title": "Зона нарад", "features": ["Звуконепроникність", "Маркерні стіни", "4K дисплеї"], "image_alt": "", "image_url": "https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/blocks/blocks/1773644334378-l0uztc.jpg"}	3	2026-03-15 20:08:55.594485+00
63c7ee2e-f0e0-4109-9e38-729804b6af28	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	three_images	{"images": [{"alt": "Інтер'єр кав'ярні QUARTER — арковий прохід з цегляними стінами", "url": "/uploads/blocks/1777101725805-hm3r1z.jpg"}, {"alt": "Флористична зона QUARTER — живі квіти та вінтажний декор", "url": "/uploads/blocks/1777101725805-6iwdaw.jpg"}, {"alt": "Вхідна група QUARTER — французькі двері та вивіска", "url": "/uploads/blocks/1777101725805-2n6fkr.jpg"}]}	1	2026-04-25 07:22:06.169227+00
f0700094-84cd-414c-976c-e77f74186293	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	three_images	{"images": [{"alt": "", "url": "/uploads/blocks/1777102521333-njd34f.jpg"}, {"alt": "", "url": "/uploads/blocks/1777102521333-sa2ohl.jpg"}, {"alt": "", "url": "/uploads/blocks/1777102521333-9pfdeg.jpg"}]}	2	2026-04-25 07:26:44.655341+00
088ce349-5a72-48ed-be31-39f2d9711618	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	image_full	{"alt": "", "caption": "", "image_url": "/uploads/blocks/1777103293960-cywguz.jpg"}	4	2026-04-25 07:48:14.323452+00
e76b5f7f-6574-4e6b-a71e-bd0980c2884f	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	text_full	{"area": "110", "year": "2023", "label": "The Concept", "months": "3", "content": "QUARTER — це простір, у якому естетика стає частиною повсякденного життя. Камерний простір, що поєднує кав'ярню, флористику та події. Інтер'єр виконаний в естетиці французького вінтажного ретро: аркові прорізи, фактурна цегла, м'яке світло та відреставровані меблі й люстри з Франції."}	0	2026-04-25 07:21:10.386466+00
0e4b6b27-0fbc-4384-a532-ab3566d2df2a	20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	image_text	{"icon": "solar:buildings-linear", "text": "Барна зона оформлена як центральна точка тяжіння — з округлими формами, теплим світлом та французьким шармом.", "label": "центральна частина", "title": "Барна стійка", "features": [], "image_alt": "Барна стійка кав'ярні QUARTER з округлими формами та теплим освітленням  БЛОК #4 — Зображення + Текст (\\"Зала для івентів\\") Іконка: Без іконки Мітка: Зала з великим столом Заголовок: Зала для івентів Текст: Зала для особливих подій та єднання. Ключова особливість інтер'єру — легкий французький ретро-шик без надмірної демонстративності. Особливості: великий стіл, вінтажні відреставровані меблі, люстри з Франції Alt зображення: Зала для івентів у кав'ярні QUARTER — великий дерев'яний стіл та вінтажна люстра  БЛОК #5 — Текст на повну ширину (\\"Матеріали\\") Мітка: Materials Текст цитати: Ми використовували вінтажні предмети з історією: люстри та меблі, привезені з Франції й відреставровані. Статистика: (залишити порожньою)  ГАЛЕРЕЯ Alt-тексти для фото:  Інтер'єр QUARTER — люстра та живі квіти Вхід до кав'ярні QUARTER — вивіска та фасад   Якщо потрібно — можу адаптувати тексти під коротший або більш маркетинговий формат.", "image_url": "/uploads/blocks/1777102521333-dm0uv7.jpg"}	3	2026-04-25 07:35:21.706958+00
08dfc1eb-205d-4108-afb1-4464f31b0d72	50d6eb5b-448f-4e84-abb4-e1947051d80a	three_images	{"images": [{"alt": "", "url": "/uploads/blocks/1777106038255-m2uwxy.jpg"}, {"alt": "", "url": "/uploads/blocks/1777106038255-bb8oko.jpg"}, {"alt": "", "url": "/uploads/blocks/1777106038255-43028m.jpg"}]}	0	2026-04-25 08:33:58.376846+00
6babf60c-6538-4ca4-a39f-879550bd81e6	d7788c5e-59a0-4602-85f8-c5041e4f66ac	text_full	{"area": "110", "year": "2023", "label": "Про проект", "months": "3", "content": "Проект QUARTER - це простір, у якому естетика стає частиною повсякденного життя.\\nQUARTER - камерний простір, що поєднує кав'ярню, флористику та події.\\nІнтер'єр виконаний в естетиці французького вінтажного ретро: аркові прорізи, фактурна цегла, м'яке світло та відреставровані меблі й люстри з Франції."}	0	2026-04-27 18:49:24.117788+00
fe3ed306-659d-452f-8544-4748a8245235	d7788c5e-59a0-4602-85f8-c5041e4f66ac	three_images	{"images": [{"alt": "", "url": "/uploads/blocks/1777360473618-h572cf.jpg"}, {"alt": "", "url": "/uploads/blocks/1777460846973-xbds5l.jpg"}, {"alt": "", "url": "/uploads/blocks/1777460774237-t4xy2c.jpg"}]}	1	2026-04-27 19:22:48.787201+00
cd9fde70-c795-4751-a7d3-3f1ec3b7e2e6	242aaae0-7c4f-4510-b6ff-729089a561e1	text_image	{"icon": "solar:armchair-2-linear", "text": "ЦЕ ТЕКСТ В БЛОЦІ ТЕКСТ + ЗОБРАЖЕННЯ", "label": "ЦЕ МІТКА БЛОКУ", "title": "ЦЕ ЗАГОЛОВОК ТЕКСТ + ЗОБРАЖЕННЯ", "features": ["ЦЕ ОСОБЛИВІСТЬ", "ЦЕ ДРУГА ОСОБЛИВІСТЬ"], "image_alt": "", "image_url": ""}	1	2026-04-27 13:40:52.113495+00
94283057-c7cd-4b38-bfc5-bb53c5ac2b71	242aaae0-7c4f-4510-b6ff-729089a561e1	three_images	{"images": [{"alt": "", "url": "/uploads/blocks/1777112125259-b5298g.jpg"}, {"alt": "", "url": "/uploads/blocks/1777112125260-bvxzg7.jpg"}, {"alt": "", "url": "/uploads/blocks/1777112125260-qn0bqo.jpg"}]}	0	2026-04-25 10:07:52.405247+00
69e8e604-c7c4-400b-aea0-531deee362cd	7a07c1c2-3bc8-4f12-b5b4-877f4dc1915d	text_image	{"icon": "solar:armchair-2-linear", "text": "Поєднати практичність та адаптувати простір під сучасний магазин", "label": "Ритейл", "title": "Концепція магазину", "features": [], "image_alt": "", "image_url": "/uploads/blocks/1777298057045-cos52j.jpg"}	0	2026-04-27 13:54:17.18951+00
1a1a3e35-fbf8-4509-8449-53ec5d8ba7bb	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	image_full	{"alt": "Тераса сонячна", "caption": "Тераса", "image_url": "/uploads/blocks/1777396745416-0foqfs.jpg"}	1	2026-04-28 17:17:47.156572+00
6fbc1f69-0be0-4fbc-801f-b66c0cd69ca7	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	three_images	{"images": [{"alt": "Тераса", "url": "/uploads/blocks/1777396855590-k9yc9m.jpg"}, {"alt": "Вигляд зсередини ", "url": "/uploads/blocks/1777396855591-fubq23.jpg"}, {"alt": "Вигляд зсередини ракурс 2", "url": "/uploads/blocks/1777396855591-98msy1.jpg"}]}	3	2026-04-28 17:20:55.691967+00
3dead234-f616-4226-918d-52f845aa5603	358b9553-ddfb-4978-ba76-6bb6aed3ec90	text_full	{"area": "", "year": "", "label": "CONCEPT", "months": "", "content": "Lorem ipsum la la laLorem ipsum la la laLorem ipsum la la laLorem ipsum la la laLorem ipsum la la laLorem ipsum la la laLorem ipsum la la laLorem ipsum la la laLorem ipsum la la la"}	0	2026-04-28 16:32:05.39261+00
b360234c-a6de-4fcd-85fc-978aec0c93f7	358b9553-ddfb-4978-ba76-6bb6aed3ec90	text_image	{"icon": "solar:armchair-2-linear", "text": "Ми тут зробили супер ресторан, ото ми молодці", "label": "Interior", "title": "Organic textures", "features": ["Особливість 1", "Особливість 2", "Особливість 3"], "image_alt": "тут ресторан на фотці", "image_url": "/uploads/blocks/1777393925286-d9aggi.jpg"}	1	2026-04-28 16:32:05.39261+00
89c7d98d-c84d-48ef-a148-f7d6e4776bbb	d7788c5e-59a0-4602-85f8-c5041e4f66ac	image_text	{"icon": "", "text": "Зала для особливих подій та єднання. Ключова особливість інтер'єру -\\nлегкий французький ретро-шик без надмірної демонстративності.\\n", "label": "", "title": "Зала для івентів", "features": ["великий стіл", "вінтажний відреставровані меблі", "люстри з Франціїї"], "image_alt": "", "image_url": "/uploads/blocks/1777459842008-zitzeg.jpg"}	3	2026-04-27 19:22:48.787201+00
29f39e44-3724-42f3-8e7b-0a464fe3f2df	39e14c2c-6066-4f50-833b-f5f7c1150e2b	image_full	{"alt": "", "caption": "", "image_url": "/uploads/blocks/1777351851012-b4ko74.jpg"}	0	2026-04-28 04:50:53.914552+00
359190e5-583c-463e-87a6-fef07f41a619	d9f5e807-1e80-4116-bc17-838775da21e4	image_full	{"alt": "", "caption": "", "image_url": "/uploads/blocks/1777353810215-ootqbb.png"}	0	2026-04-28 05:23:30.152496+00
3b153dae-a465-4e0e-a73d-c1c13ae87416	d9f5e807-1e80-4116-bc17-838775da21e4	text_image	{"icon": "", "text": "", "label": "", "title": "", "features": [], "image_alt": "", "image_url": "/uploads/blocks/1777353810215-1j02uy.jpg"}	1	2026-04-28 05:23:30.152496+00
44cb60ac-3f06-451b-ad4b-5170162f6719	358b9553-ddfb-4978-ba76-6bb6aed3ec90	image_text	{"icon": "solar:sun-2-linear", "text": "Ми тут зробили супер ресторан, ото ми молодці", "label": "Exterior", "title": "Organic textures", "features": ["Особливість 4", "Особливість 5", "особливість 6"], "image_alt": "тут ресторан на фотці 2", "image_url": "/uploads/blocks/1777394001999-t1b5qu.jpg"}	2	2026-04-28 16:33:22.130685+00
6ed839f8-6f28-475d-a2d9-8c5016f3b696	d7788c5e-59a0-4602-85f8-c5041e4f66ac	text_image	{"icon": "", "text": "Барна зона оформлена як центральна точка тяжіння - з округлими формами,\\nтеплим світлом та французьким шармом.\\n", "label": "центральна частина", "title": "Барна стійка", "features": ["тепле освітлення", "картина на стіні", "вінтажні люстри"], "image_alt": "", "image_url": "/uploads/blocks/1777459651977-jc04jw.jpg"}	2	2026-04-27 19:22:48.787201+00
1730360a-5ea0-478b-9a4e-dd444babd9da	d7788c5e-59a0-4602-85f8-c5041e4f66ac	text_full	{"area": "", "year": "", "label": "Матеріали", "months": "", "content": "Ми використали вінтажні предмети з історією: люстри та меблі, привезені з Франції й відреставровані\\n"}	4	2026-04-27 19:22:48.787201+00
f56a0b11-d89c-48d6-bc2e-8ffeb51bdac6	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	text_full	{"area": "", "year": "", "label": "Екстер'єр", "months": "", "content": "Фасад повинен був «запрошувати» з вулиці. Велике вікно, тепле світло зсередини та невеликий козирок — і цього виявилось достатньо."}	2	2026-04-28 17:17:47.156572+00
ec63a649-9950-472b-84bf-c2fc3a16d6e5	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	text_image	{"icon": "solar:armchair-2-linear", "text": "Хороший ресторанний інтер'єр не помічається — він просто робить їжу смачнішою.", "label": "Interioi", "title": "Клієнт прийшов з одним реченням у брифі: «Хочу, щоб тут пахло хлібом і відчувалася Італія». ", "features": ["#архітектура", "#інтер'єр", "#дизайнінтер'єру", "#проєктування", "#бюроархітектури"], "image_alt": "Хороший ресторанний", "image_url": "/uploads/blocks/1777396989014-798lnu.jpg"}	4	2026-04-28 17:23:09.120215+00
1ad0752d-d195-4ca6-9694-6b1bdf06366a	532d2b8d-fc53-45b6-a3f1-7f8898bcc906	text_full	{"area": "120 ", "year": "2026", "label": "Думка", "months": "9", "content": "Завдання було просте: зробити так, щоб гість відчував себе не в ресторані, а вдома у друга, який вміє готувати.\\nВузька вулиця, старий будинок, велике вікно на фасад. Саме те, з чого починається характер місця."}	0	2026-04-28 17:16:07.488092+00
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, name, email, subject, message, telegram_sent, telegram_message_id, created_at) FROM stdin;
b05743b9-3730-4fe1-8944-c240d01dcf68	Олександр	inlook4air@gmail.com	Привіт !	Привіт, я тестую телеграм. Як справи?	f	\N	2026-02-14 18:02:35.775047+00
31ea882f-4621-4020-8a59-8f8c20fc012e	Олександр	inlook4air@gmail.com	Привіт !	Це тестове повідомлення. Прийом?	f	\N	2026-02-14 18:06:09.332166+00
7de665bd-3dcd-40a6-9ca0-ab02b4f9161f	івів	aaaa@ssss.com	вівів	sdsdasdadasdasdasdsa	t	10	2026-02-14 18:06:47.560855+00
75179801-4d0c-49b3-920c-3762d7f8d7fe	Олександр	inlook4air@gmail.com	Привіт !	Тестове повідомлення з форми зворотнього зв'язку сайту.	t	11	2026-02-14 18:07:24.229716+00
466500b6-1dfc-48bd-8d8f-d117de147e8e	івівфівфівф	saassa@ssss.com	12312312312	213123123123123123123	t	12	2026-02-16 17:31:42.811196+00
4051ce85-8d6f-4dbf-a50b-6390699d49c2	Аліна	stavcanska@gmail.com	Бубка	Любов моя 💙	t	13	2026-02-17 08:38:47.770471+00
e537c772-43a7-4b89-923c-35f147e0de46	Diana Samardak	yeremichuk@gmail.com	Співпраця	привіт привіт привіт привіт привіт привіт привіт привіт 	f	\N	2026-03-05 10:46:31.70032+00
3a84acbe-6f47-478c-a23b-fee6bb78fdba	Oleksandr	inlook4air@gmail.com	Співпраця	СпівпрацяСпівпрацяСпівпрацяСпівпрацяСпівпрацяСпівпрацяСпівпрацяСпівпраця	t	15	2026-03-08 16:52:56.041519+00
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media (id, project_id, url, role, sort_order, alt, created_at) FROM stdin;
4b6016b1-7f57-4264-abd7-5b7df79958f4	9585060c-dfab-4240-b2b1-2786b3504172	https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/projects/projects/media/1770921735226-lq3o5l.jpg	hero	0	\N	2026-02-12 18:42:16.191616+00
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (id, title, slug, status, seo_title, seo_description, og_image_url, created_at, updated_at, hero_image_url, hero_title, hero_subtitle, hero_tags, hero_location, hero_year, gallery_images, featured, deleted_at) FROM stdin;
679f998f-f0a1-4429-b853-f90b20ae3cd1	sss	sss	draft			\N	2026-04-25 15:25:07.317604+00	2026-04-25 16:19:48.1622+00	/uploads/blocks/1777130707274-2xl18q.jpg			{}			{}	f	2026-04-25 16:19:48.15+00
63db0503-09f4-4857-8840-896cf6eafb40	YesChess	yeschess	published			\N	2026-04-28 05:04:27.033227+00	2026-04-28 16:28:45.942556+00	/uploads/blocks/1777352666985-788ii6.png	Проєкт кав'ярні-квіткарні QUARTER		{}			{}	f	2026-04-28 16:28:45.93+00
242aaae0-7c4f-4510-b6ff-729089a561e1	Супер ресторан	super-restoran	published			\N	2026-04-25 10:06:13.197508+00	2026-05-06 09:22:43.555388+00	/uploads/blocks/1777111573051-uic96x.jpg			{}			{/uploads/blocks/1777111672295-tuleit.jpg,/uploads/blocks/1777111672295-4pn3qy.jpg,/uploads/blocks/1777111672295-j3y3lx.jpg,/uploads/blocks/1777111672295-b4t5wd.jpg,/uploads/blocks/1777111672295-bnf7n2.jpg,/uploads/blocks/1777139870092-p5ubqg.jpg,/uploads/blocks/1777139870093-mt8uj7.jpg,/uploads/blocks/1777139870093-esivat.jpg}	f	2026-05-06 09:22:43.539+00
bd595cf1-b9f5-4926-a21e-d1c34786f671	Креативна студія в Подолі	kreatyvna-studiia-v-podoli-v2	published	Креативна студія в Подолі | Buro 710	Дизайн креативної студії 120 м² для команди дизайнерів від студії Buro 710	https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200	2026-03-15 20:08:55.532001+00	2026-04-25 10:24:08.277676+00	https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920	Креативна студія	Простір для натхнення та творчості 120	{Студія,Комерційний,Креатив}	Київ, Поділ, Україна	2024	{https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200,https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200,https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200,https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1200,https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200,https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200}	f	2026-04-25 10:24:08.262+00
334fd28c-33c2-4691-b73a-dfe39101a388	ffffff	ffffff	draft			\N	2026-04-25 16:19:35.602984+00	2026-04-25 16:19:48.186057+00	/uploads/blocks/1777133975561-icosv7.jpg		ssss	{"ssss'\\\\"}	Чернівці, Садова 14, Україна		{}	f	2026-04-25 16:19:48.174+00
e423aade-9a57-4af1-ae38-dd3a4f9a84b8	Verify Upload	verify-1777353605918	draft			\N	2026-04-28 05:20:09.382998+00	2026-04-28 05:22:59.510283+00	/uploads/blocks/1777353606243-3sl6c8.jpg			{}			{}	f	2026-04-28 05:22:59.496+00
7a07c1c2-3bc8-4f12-b5b4-877f4dc1915d	Treskare	treskare	published	Магазин		\N	2026-04-27 13:18:41.568077+00	2026-04-27 13:54:17.107693+00	/uploads/blocks/1777295921517-09abqe.jpg	Treskare by Kostumchik		{}	Чернівці	2024	{}	f	\N
0f50200f-f129-432f-942d-04721342a83d	Київський пентхаус з терасою	kyivskyi-pentkhaus-z-terasoju	published	Київський пентхаус з терасою | Buro 710	Дизайн пентхаусу 150 м² з терасою від студії Buro 710	\N	2026-03-06 21:19:56.56669+00	2026-04-25 10:24:49.436792+00	https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1920	Пентхаус з терасою	Місто під ногами 150 м²	{Пентхаус,Тераса,Люкс}	Київ, Україна	2024	{https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1920,https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920,https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920}	f	2026-04-25 10:24:49.419+00
d9f5e807-1e80-4116-bc17-838775da21e4	фф	ff	draft			\N	2026-04-28 05:23:30.106593+00	2026-04-28 16:28:45.942556+00	/uploads/blocks/1777353810052-wyg74r.png			{}			{}	f	2026-04-28 16:28:45.929+00
923df883-90be-46e5-ab8c-8759d5b07f2c	Найкращий супер пупер ресторан	naykrashchyy-super-puper-restoran	published			\N	2026-04-24 17:17:05.857178+00	2026-04-25 04:59:42.420511+00	\N			{}			{}	t	2026-04-25 04:59:42.38+00
a7302580-dcf6-4d8a-9234-65b963d7c161	Спа-зона у заміському будинку	spa-zona-u-zamiskomu-budynku	published	Спа-зона у заміському будинку | Buro 710	Дизайн спа-зони 35 м² від студії Buro 710	\N	2026-03-06 21:19:40.277713+00	2026-04-25 10:24:24.555707+00	https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920	Спа-зона	Особистий оазис спокою 35 м²	{Спа,Релакс,"Заміський будинок"}	Київська область, Україна	2024	{https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920,https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920,https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920,https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200}	f	2026-04-25 10:24:24.542+00
646d8336-e8f3-4d8f-9d9e-d68a93253582	Мінімалістична квартира в центрі Києва	minimalistychna-kvartyra-v-tsentri-kyyeva	published	Мінімалістична квартира в Києві | Buro 710	Дизайн інтер'єру квартири 78 м² у стилі мінімалізм від студії Buro 710	\N	2026-03-06 21:19:39.109315+00	2026-04-25 10:24:38.965435+00	https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920	Мінімалістична квартира	Світлий простір 78 м² для сучасної сім'ї	{Інтер'єр,Квартира,Мінімалізм}	Київ, Україна	2024	{https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920,https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920,https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1920,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920}	f	2026-04-25 10:24:38.951+00
358b9553-ddfb-4978-ba76-6bb6aed3ec90	Супер ресторан	super-restoran-1	published			\N	2026-04-28 16:29:36.3263+00	2026-04-28 16:34:16.454747+00	/uploads/blocks/1777393776249-hrjum6.jpg	Проєкт кав'ярні-квіткарні QUARTER	Проєкт кав'ярні-квіткарні QUARTERПроєкт кав'ярні-квіткарні QUARTERПроєкт кав'ярні-квіткарні QUARTERПроєкт кав'ярні-квіткарні QUARTERПроєкт кав'ярні-квіткарні QUARTER	{Привіт,Медвід,"ЯК СПРАВИ",уляля}	Чернівці, Садова 14, Україна	2023	{/uploads/blocks/1777394056402-hx7aap.jpg,/uploads/blocks/1777394056402-k6zsim.jpg,/uploads/blocks/1777394056402-7o702q.jpg}	t	\N
d7788c5e-59a0-4602-85f8-c5041e4f66ac	QUARTER кав᾿ярня-квіткарня	proekt-kav-yarni-kvitkarni-quarter	published			\N	2026-04-27 18:07:54.172577+00	2026-05-06 09:22:36.750162+00	/uploads/blocks/1777360493974-tp3u9o.jpg	QUARTER кав᾿ярня-квіткарня	Простір як місце сили - смачна кави, квіти та атмосферні зустрічі	{квітковий,кав᾿ярня,"комерційний проект"}	Чернівці, Україна	2023	{/uploads/blocks/1777317829975-ujz4xw.jpg,/uploads/blocks/1777317829975-jgnx9e.jpg,/uploads/blocks/1777317829975-7k3d8p.jpg,/uploads/blocks/1777460749811-zgdotu.jpg}	f	2026-05-06 09:22:36.733+00
e8479e86-b14f-4b74-af5d-182facb3b65b	івфівфівіфвфів	ivfivfivifvfiv	published			\N	2026-04-24 17:56:06.490805+00	2026-04-25 04:59:35.721385+00	\N			{Привіт,медвід,"щетам шось"}			{}	f	2026-04-25 04:59:35.681+00
5d8d9cbb-658a-4646-958d-f91ff0092b76	Альпійський шале у Карпатах	alpiiskyi-shale-u-karpatakh	published	Альпійський шале у Карпатах | Buro 710	Дизайн альпійського шале 180 м² від студії Buro 710	\N	2026-03-06 21:19:55.681828+00	2026-04-25 10:24:26.214582+00	https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920	Альпійський шале	Гірський притулок 180 м²	{Шале,Гори,"Заміський будинок"}	Карпати, Україна	2024	{https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920,https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1920,https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920,https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1920}	f	2026-04-25 10:24:26.201+00
49cc5332-43ab-4947-a33f-0af03bf81aa9	Скандинавська вітальня у Дніпрі	skandinavska-vitalnia-u-dnipri	published	Скандинавська вітальня у Дніпрі | Buro 710	Дизайн вітальні 32 м² у скандинавському стилі від студії Buro 710	\N	2026-03-06 21:19:39.463181+00	2026-04-25 10:24:40.328379+00	https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920	Скандинавська вітальня	Затишок 32 м² у кожній деталі	{Вітальня,Скандинавський,Затишок}	Дніпро, Україна	2024	{https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920,https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920}	f	2026-04-25 10:24:40.314+00
6fab4cd6-e7cf-427e-903c-aff6db10c301	Еко-будинок у Полтавській області	eko-budynok-u-poltavskii-oblasti	published	Еко-будинок у Полтавській області | Buro 710	Дизайн еко-будинку 200 м² від студії Buro 710	\N	2026-03-06 21:19:56.881634+00	2026-04-25 10:24:50.991268+00	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920	Еко-будинок	Сталий дизайн 200 м²	{Еко,"Заміський будинок","Сталий дизайн"}	Полтавська область, Україна	2024	{https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920,https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1920,https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920,https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920,https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1920}	t	2026-04-25 10:24:50.977+00
27d69682-b5d9-41c0-8d17-c8d13ca4a312	ssssss	ssssss	draft			\N	2026-04-27 18:15:57.205098+00	2026-04-27 18:20:52.142863+00	/uploads/blocks/1777313757159-xdz2mm.jpg			{}			{}	f	2026-04-27 18:20:52.127+00
574fc5b2-af1a-43c1-a121-99a38b219d22	Проєкт кав	proyekt-kav	draft			\N	2026-04-25 05:01:25.444851+00	2026-04-25 05:02:55.401529+00	\N			{}			{}	f	2026-04-25 05:02:55.357+00
50c54bd6-4cab-43e9-bc85-358f71a24d33	Морська квартира в Одесі	morska-kvartyra-v-odesi	published	Морська квартира в Одесі | Buro 710	Дизайн квартири 85 м² у середземноморському стилі від студії Buro 710	\N	2026-03-06 21:19:55.978198+00	2026-04-25 10:24:28.713578+00	https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920	Морська квартира	Середземноморський стиль 85 м²	{Квартира,Морський,Середземномор'я}	Одеса, Україна	2024	{https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920,https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920}	f	2026-04-25 10:24:28.694+00
64ae2739-3203-4599-a72e-3f20508853f9	Лофт-квартира в Одесі	loft-kvartyra-v-odesi	published	Лофт-квартира в Одесі | Buro 710	Дизайн лофт-квартири 95 м² від студії Buro 710	\N	2026-03-06 21:19:39.728698+00	2026-04-25 10:24:41.813557+00	https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1920	Лофт-квартира	Індустріальний простір 95 м² з комфортом	{Квартира,Лофт,Індустріальний}	Одеса, Україна	2024	{https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1920,https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920,https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920,https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920}	f	2026-04-25 10:24:41.8+00
532d2b8d-fc53-45b6-a3f1-7f8898bcc906	Просто Піца	prosto-pitsa	published			\N	2026-04-28 17:14:35.8205+00	2026-04-28 17:23:09.059294+00	/uploads/blocks/1777396475765-pxb51n.jpg	Просто Піца 	Інтер'єр піцерії — де тепло дров'яної печі стало відправною точкою для всього дизайну.	{}	Чернівці, Україна	2026	{/uploads/blocks/1777396796588-6evowp.jpg,/uploads/blocks/1777396796588-t5e1p7.jpg,/uploads/blocks/1777396796588-cr9za6.jpg,/uploads/blocks/1777396796589-tsfiuv.jpg,/uploads/blocks/1777396796589-u5fpor.jpg,/uploads/blocks/1777396796589-3ujw5e.jpg}	t	\N
dcd175ce-ebd6-4c06-82e7-9cb85a9a58d2	Test Post	test-post-1777351821245	draft			\N	2026-04-28 04:50:24.71323+00	2026-04-28 05:22:59.509482+00	/uploads/blocks/1777351821619-xds0k1.jpg			{}			{}	f	2026-04-28 05:22:59.495+00
20e3f6be-1228-4fc3-9d21-3c2aa29bcf74	Тестовий пост 1 2 3	testovyy-post-1-2-3	published			\N	2026-04-25 05:45:11.90299+00	2026-04-25 08:10:33.730982+00	/uploads/blocks/1777098644490-u8u00b.jpg	Проєкт кав'ярні-квіткарні QUARTER	Простір як місце сили — смачна кава, квіти та атмосферні зустрічі	{квітковий,комерційний,кав'ярня}	Чернівці, Садова 14, Україна	2023	{/uploads/blocks/1777102004291-rfnjoj.jpg,/uploads/blocks/1777102004291-k1n3pv.jpg,/uploads/blocks/1777102004291-8d3gev.jpg,/uploads/blocks/1777102440957-yqzjut.jpg,/uploads/blocks/1777102440957-uosyjh.jpg}	t	2026-04-25 08:10:33.716+00
05c52245-70e5-4803-8be4-696ef03a797e	Сучасний офіс IT-компанії у Львові	suchasnyi-ofis-it-kompaniyi-u-lvovi	published	Сучасний офіс для IT-компанії у Львові | Buro 710	Дизайн офісу 450 м² для IT-компанії від студії Buro 710	\N	2026-03-06 21:19:40.014795+00	2026-04-25 10:24:22.945186+00	https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920	Сучасний офіс	Простір 450 м² для натхнення та продуктивності	{Офіс,Комерційний,IT}	Львів, Україна	2024	{https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920,https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920,https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920,https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200}	f	2026-04-25 10:24:22.929+00
3575eabf-57ef-44a0-b09a-9d2f3ab9ad2f	Японський сад у Києві	yaponskyi-sad-u-kyievi	published	Японський сад у Києві | Buro 710	Дизайн японського саду 120 м² від студії Buro 710	\N	2026-03-06 21:19:56.259931+00	2026-04-25 10:24:43.299963+00	https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920	Японський сад	Дзен-простір 120 м²	{Сад,"Японський стиль",Ландшафт}	Київ, Україна	2024	{https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920,https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920,https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920,https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200}	f	2026-04-25 10:24:43.285+00
b9b3bb4e-0211-4fd0-8088-3c8c2f525a3d	Креативна студія в Подолі	kreatyvna-studiia-v-podoli	published	Креативна студія в Подолі | Buro 710	Дизайн креативної студії 120 м² для команди дизайнерів від студії Buro 710	https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200	2026-03-15 19:03:35.394652+00	2026-04-25 14:30:37.372118+00	https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920	Креативна студія	Простір для натхнення та творчості 120 м²	{Студія,Комерційний,Креатив}	Київ, Поділ, Україна	2024	{https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200,https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200,https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200,https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200,https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200,https://images.unsplash.com/photo-1564069114553-7215e1ff1870?w=1200}	f	2026-04-25 14:30:37.357+00
39e14c2c-6066-4f50-833b-f5f7c1150e2b	Test Post With Block Image	test-post-block-1777351850430	draft			\N	2026-04-28 04:50:53.851125+00	2026-04-28 05:22:59.511241+00	\N			{}			{}	f	2026-04-28 05:22:59.495+00
50d6eb5b-448f-4e84-abb4-e1947051d80a	івівівів	iviviviv	published			\N	2026-04-25 08:20:01.233497+00	2026-04-25 10:24:19.22725+00	/uploads/blocks/1777105549347-g0qygy.jpg	Проєкт кав'ярні-квіткарні QUARTER		{}		2023	{/uploads/blocks/1777105933370-ve1znb.jpg,/uploads/blocks/1777105933370-hfnxma.jpg,/uploads/blocks/1777105933370-gayt5k.jpg,/uploads/blocks/1777105933370-aw4x1u.jpg,/uploads/blocks/1777105933370-oubzs7.jpg}	t	2026-04-25 10:24:19.213+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, image_url, tags, location, area, year, created_at, updated_at, subtitle, sections) FROM stdin;
9585060c-dfab-4240-b2b1-2786b3504172	Пекарня “Рецептура”	https://zrcaowbpewulytlwnbnb.supabase.co/storage/v1/object/public/projects/projects/media/1770921733907-d9e4o2.jpg	{Ресторан,Horeca,Реновація,Архітектура,Стиль}	Чернівці, Україна	100	2022	2026-02-12 18:42:15.510164+00	2026-02-13 09:17:35.17642+00	Проект повної реконструкції занедбаної будівлі в самому серці старого міста.	[]
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, created_at) FROM stdin;
9bafdeee-4de7-48ce-9ec8-19e379fbad4e	d5057af4-4c47-4721-b84a-f2b67be486f0	5272f4d3ab8e22a87b1a2aba1ede3070c50cf961cec536c5b32cce796752b918	2026-05-04 18:15:48.48+00	2026-04-27 18:15:48.496137+00
f1841b41-50a1-4bf9-b0bb-8486a409d57b	ab047c53-0a68-404e-bbdc-e3cabac3567d	f868cd3a63a32fcf226cde50136efbba1eddd4a5acb5a7c355285d1549b674ba	2026-05-04 19:31:13.558+00	2026-04-27 19:31:13.571105+00
86dee06c-318c-44d3-9360-69264db22857	a8ca6478-18f3-4553-9b72-cf60db03411a	8e6c562ba4451c86bed6610b31cfef3e3489b611f416772e0eb1ccea5aa8cf93	2026-05-05 04:49:18.96+00	2026-04-28 04:49:21.991167+00
2cba1ec8-8b83-4775-91e0-8044c4cb67a3	a8ca6478-18f3-4553-9b72-cf60db03411a	4772cea05d057898f820f1dab4f1535c29a27bb8dce7933538bf449f99774df4	2026-05-05 05:19:46.451+00	2026-04-28 05:19:49.528739+00
2f6f59a1-fdd1-41ec-80a6-3f356645cd42	7bdacdd2-b51d-4049-8b07-3f61b965da98	8d5e684454b094e246e86dc01facaab2f5e1e5e328f5448010bd03654fd9b329	2026-05-05 07:14:23.834+00	2026-04-28 07:14:23.851067+00
8d266c6f-c47a-486a-a674-0bb9470fb820	d5057af4-4c47-4721-b84a-f2b67be486f0	8dc4b80f525047b882df7033a2c1da8c02b0de7711adc244981f2d651829a851	2026-05-05 07:52:48.396+00	2026-04-28 07:52:48.411493+00
46c4ca64-4713-4608-aec7-f88854f788d9	ab047c53-0a68-404e-bbdc-e3cabac3567d	24da4c8d41af9d4cbf0c0d77098f55936359a3b16942890874b62df7645d57f3	2026-05-05 10:29:47.151+00	2026-04-28 10:29:47.167222+00
ad0d5ed8-b24b-4319-8a93-d0fd4a2aa8c0	7bdacdd2-b51d-4049-8b07-3f61b965da98	1fee3f072738a5f591bda8e7c0df9e5b9c5bf1b5d2738e1882bb333abed9bde6	2026-05-06 09:27:59.571+00	2026-04-29 09:27:59.589541+00
283f668d-3471-4bf9-91a2-5c6dd343fb3a	ab047c53-0a68-404e-bbdc-e3cabac3567d	e244c10f33e237ee4289d453a1698a0119cb3f11602271da8046a98a3c69a8f1	2026-05-06 13:32:28.861+00	2026-04-29 13:32:28.875906+00
d4d8e639-ff9a-49e4-8ef1-86f6a5c38996	ab047c53-0a68-404e-bbdc-e3cabac3567d	309edd70a434c1b722284f0743dac4f278abdac49f335fb9a13793b0bd12a5ad	2026-05-06 18:51:13.206+00	2026-04-29 18:51:13.222486+00
ca97b6bc-5326-466c-9f2a-9972e6387237	7bdacdd2-b51d-4049-8b07-3f61b965da98	42b9535710d82afd837abe8627c37eb23c3a848e87c89b02cb7009bbf7d78893	2026-05-08 06:14:24.842+00	2026-05-01 06:14:24.85518+00
283775cd-e327-4947-898c-33d37d4f4463	ab047c53-0a68-404e-bbdc-e3cabac3567d	9d0b502560efd5b3a82d4b1d26349bdb77c3f3799a9e2d55f1bbb970d8c9285f	2026-05-11 06:36:44.879+00	2026-05-04 06:36:44.901023+00
541b9a0e-50a2-4f11-8657-f0f678c6c967	d5057af4-4c47-4721-b84a-f2b67be486f0	a19ac98ac9cfa561dfe37f0d4602f5bd2d6d0f12b1bebb9646fba220f7d6b0fe	2026-05-13 09:05:06.899+00	2026-05-06 09:05:06.914912+00
e809917b-9b34-481e-8447-3ff3384fe958	ab047c53-0a68-404e-bbdc-e3cabac3567d	5b7fd2cb6200e63d9cf07b73fd00e81b92cd67c46dd6bdb2e5db69a32319d7a7	2026-05-13 11:57:08.903+00	2026-05-06 11:57:08.918295+00
350d70a4-86a4-44fd-94e2-09939b6f37aa	ab047c53-0a68-404e-bbdc-e3cabac3567d	8e6747088fdf54c7a790d4efe57e90962ecc3ba6d3ca3790a152b92c9ab6a087	2026-05-13 14:25:26.532+00	2026-05-06 14:25:26.54534+00
5035fc49-e8de-4824-b11b-49613caa9786	ab047c53-0a68-404e-bbdc-e3cabac3567d	460a98c4e7a688ebaef7fb92a9e4149b4a55172bc85bfb358b2a3d859af94b52	2026-05-13 15:52:51.078+00	2026-05-06 15:52:51.092442+00
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, key, value, created_at, updated_at) FROM stdin;
d42bac46-84d5-4087-bd79-19f62fc827b8	company_location	Kyiv, Ukraine	2026-02-06 19:01:29.137813+00	2026-02-06 19:01:29.137813+00
5a31ab0e-3dc3-4e27-b781-cbb32934df86	company_tagline	Architecture & Consulting	2026-02-06 19:01:29.137813+00	2026-02-07 07:13:37.749+00
a9359e23-a2eb-4b00-adbd-eb63e07a1de4	company_name	Test Company	2026-02-06 19:01:29.137813+00	2026-02-07 07:51:13.853+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, created_at, token_version) FROM stdin;
a8ca6478-18f3-4553-9b72-cf60db03411a	admin@admin.com	$2b$10$1by4deRmyrsD3eJzD9cj7OnMm1vEI2PpriwMI5SjceKgVdwO/nucK	admin	2026-04-27 18:22:09.867625+00	0
d5057af4-4c47-4721-b84a-f2b67be486f0	diana@b710.design	$2b$10$j2cmTo1HlPIxjJwjbcx30OgA3ScA8..2LgaBW6gncPxT8JOkKuETC	admin	2026-04-27 18:15:28.066351+00	0
7bdacdd2-b51d-4049-8b07-3f61b965da98	diana2@b710.design	$2b$10$kiwQx.yWRvgRsPgt4IY7O.sWcmIMZ18WL.Gzaky/ImBISIlVBv6t2	admin	2026-04-27 18:16:49.081493+00	0
ab047c53-0a68-404e-bbdc-e3cabac3567d	admin@b710.design	$2b$10$zAxUsdjPylEahppfWqfbOuYEBmpF2Q5rZAO9IInlct/dXgv7JAkt6	admin	2026-04-01 17:56:33.227201+00	6
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-02-06 10:25:44
20211116045059	2026-02-06 10:25:44
20211116050929	2026-02-06 10:25:44
20211116051442	2026-02-06 10:25:44
20211116212300	2026-02-06 10:25:44
20211116213355	2026-02-06 10:25:44
20211116213934	2026-02-06 10:25:44
20211116214523	2026-02-06 10:25:44
20211122062447	2026-02-06 10:25:44
20211124070109	2026-02-06 10:25:44
20211202204204	2026-02-06 10:25:44
20211202204605	2026-02-06 10:25:44
20211210212804	2026-02-06 10:25:45
20211228014915	2026-02-06 10:25:45
20220107221237	2026-02-06 10:25:45
20220228202821	2026-02-06 10:25:45
20220312004840	2026-02-06 10:25:45
20220603231003	2026-02-06 10:25:45
20220603232444	2026-02-06 10:25:45
20220615214548	2026-02-06 10:25:45
20220712093339	2026-02-06 10:25:45
20220908172859	2026-02-06 10:25:45
20220916233421	2026-02-06 10:25:45
20230119133233	2026-02-06 10:25:45
20230128025114	2026-02-06 10:25:45
20230128025212	2026-02-06 10:25:45
20230227211149	2026-02-06 10:25:45
20230228184745	2026-02-06 10:25:45
20230308225145	2026-02-06 10:25:45
20230328144023	2026-02-06 10:25:45
20231018144023	2026-02-06 10:25:45
20231204144023	2026-02-06 10:25:45
20231204144024	2026-02-06 10:25:45
20231204144025	2026-02-06 10:25:45
20240108234812	2026-02-06 10:25:45
20240109165339	2026-02-06 10:25:45
20240227174441	2026-02-06 10:25:45
20240311171622	2026-02-06 10:25:45
20240321100241	2026-02-06 10:25:45
20240401105812	2026-02-06 10:25:45
20240418121054	2026-02-06 10:25:45
20240523004032	2026-02-06 10:25:45
20240618124746	2026-02-06 10:25:45
20240801235015	2026-02-06 10:25:45
20240805133720	2026-02-06 10:25:45
20240827160934	2026-02-06 10:25:45
20240919163303	2026-02-06 10:25:45
20240919163305	2026-02-06 10:25:45
20241019105805	2026-02-06 10:25:45
20241030150047	2026-02-06 10:25:45
20241108114728	2026-02-06 10:25:45
20241121104152	2026-02-06 10:25:45
20241130184212	2026-02-06 10:25:45
20241220035512	2026-02-06 10:25:45
20241220123912	2026-02-06 10:25:45
20241224161212	2026-02-06 10:25:45
20250107150512	2026-02-06 10:25:45
20250110162412	2026-02-06 10:25:45
20250123174212	2026-02-06 10:25:45
20250128220012	2026-02-06 10:25:45
20250506224012	2026-02-06 10:25:45
20250523164012	2026-02-06 10:25:45
20250714121412	2026-02-06 10:25:45
20250905041441	2026-02-06 10:25:45
20251103001201	2026-02-06 10:25:45
20251120212548	2026-02-06 10:25:45
20251120215549	2026-02-06 10:25:45
20260218120000	2026-04-24 17:24:17
20260326120000	2026-04-24 17:24:17
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
projects	projects	\N	2026-02-06 10:59:56.919881+00	2026-02-06 10:59:56.919881+00	t	f	\N	\N	\N	STANDARD
blocks	blocks	\N	2026-02-13 10:00:14.130922+00	2026-02-13 10:00:14.130922+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-02-06 10:25:51.956018
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-02-06 10:25:51.964283
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-02-06 10:25:51.983062
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-02-06 10:25:51.991093
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-02-06 10:25:51.994821
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-02-06 10:25:52.003493
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-02-06 10:25:52.007609
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-02-06 10:25:52.020516
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-02-06 10:25:52.024901
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-02-06 10:25:52.028482
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-02-06 10:25:52.032284
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-02-06 10:25:52.054744
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-02-06 10:25:52.058865
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-02-06 10:25:52.062419
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-02-06 10:25:52.066159
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-02-06 10:25:52.072908
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-02-06 10:25:52.076818
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-02-06 10:25:52.082863
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-02-06 10:25:52.093622
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-02-06 10:25:52.102729
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-02-06 10:25:52.106979
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-02-06 10:25:52.110966
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-02-06 10:25:52.176252
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-02-06 10:25:52.222393
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-02-06 10:25:52.230527
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-02-06 10:25:52.24057
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-02-06 10:25:52.245169
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-02-06 10:25:52.263741
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-02-06 10:25:51.968367
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-02-06 10:25:51.999148
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-02-06 10:25:52.01174
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-02-06 10:25:52.015705
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-02-06 10:25:52.11523
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-02-06 10:25:52.126581
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-02-06 10:25:52.134033
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-02-06 10:25:52.14014
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-02-06 10:25:52.145927
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-02-06 10:25:52.150541
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-02-06 10:25:52.155166
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-02-06 10:25:52.15986
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-02-06 10:25:52.161183
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-02-06 10:25:52.166112
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-02-06 10:25:52.169993
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-02-06 10:25:52.180691
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-02-06 10:25:52.18957
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-02-06 10:25:52.193923
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-02-06 10:25:52.201954
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-02-06 10:25:52.206519
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-02-06 10:25:52.215533
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-02-06 10:25:52.249514
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-10 08:26:02.203001
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-10 08:26:02.279494
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-02-10 08:26:02.282674
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-10 08:26:02.338988
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-10 08:26:02.342546
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-10 08:26:02.34413
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-02-10 08:26:02.351577
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-15 11:50:03.007678
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-15 11:50:03.052124
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
7bdfe851-8741-4302-8bfa-4634e12b6a2a	projects	projects/1770379211350-0-02-0a-82db1a3a243dbfbd9fe4d9dc946ce70ace9c30fd14860d9f2fa316de47151783_f903f021.jpg	\N	2026-02-06 12:00:13.415919+00	2026-02-06 12:00:13.415919+00	2026-02-06 12:00:13.415919+00	{"eTag": "\\"9aa35556623847591cb5361277605517\\"", "size": 216476, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T12:00:14.000Z", "contentLength": 216476, "httpStatusCode": 200}	215f9020-78d9-4b5a-8d6f-a69857293dc8	\N	{}
8b648b0f-22fa-40db-a573-de84dadb20ba	blocks	blocks/1771003255124-idu9v7.jpg	\N	2026-02-13 17:20:56.879748+00	2026-02-13 17:20:56.879748+00	2026-02-13 17:20:56.879748+00	{"eTag": "\\"bd7bed6996476ad06f3721f31d787834\\"", "size": 95367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T17:20:57.000Z", "contentLength": 95367, "httpStatusCode": 200}	977cb114-c00e-4a54-863f-8643b7bee100	\N	{}
8056fd9f-3ccc-42a1-9136-6b9446c9a8f7	projects	projects/1770380685512-0-02-0a-1a863e76a9792ec18f48934fdd026985d9ce39afa2f68a9bfdb8d160d3cba884_1f7e6470.jpg	\N	2026-02-06 12:24:47.531471+00	2026-02-06 12:24:47.531471+00	2026-02-06 12:24:47.531471+00	{"eTag": "\\"1571975050cc9c3ad5d66d88635e0894\\"", "size": 244386, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T12:24:48.000Z", "contentLength": 244386, "httpStatusCode": 200}	475624ec-696f-46c8-b075-a112994cd65c	\N	{}
ea15e003-7752-49e5-ac71-8d3d1a9cafb5	projects	projects/1770404853579-image (5).png	\N	2026-02-06 19:07:36.999796+00	2026-02-06 19:07:36.999796+00	2026-02-06 19:07:36.999796+00	{"eTag": "\\"cb274f461e2e8a1196083098346535e8\\"", "size": 4031797, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-06T19:07:37.000Z", "contentLength": 4031797, "httpStatusCode": 200}	376b4451-b6c6-4e7d-a4e8-3d43b726de74	\N	{}
3fe9eaea-8ac4-422a-99ae-fb4b8feb8a72	blocks	blocks/1771003255582-w7rsbl.jpg	\N	2026-02-13 17:20:57.148854+00	2026-02-13 17:20:57.148854+00	2026-02-13 17:20:57.148854+00	{"eTag": "\\"380c1b2fdde5bee72992ad1970d5e219\\"", "size": 126319, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T17:20:58.000Z", "contentLength": 126319, "httpStatusCode": 200}	9eac5410-3d4e-49bb-824e-76aba2348cec	\N	{}
e8a18eda-e380-4a98-8008-ea6450796933	projects	projects/1770655639199-image_2026-02-07_21-19-53.png	\N	2026-02-09 16:47:20.262291+00	2026-02-09 16:47:20.262291+00	2026-02-09 16:47:20.262291+00	{"eTag": "\\"4bfc96da1ecd5d76947bda2a45de11b6\\"", "size": 149294, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-09T16:47:21.000Z", "contentLength": 149294, "httpStatusCode": 200}	ed890666-7a39-4202-bb0f-7e2c90097636	\N	{}
21f0f0e9-e108-4457-b6ca-529bd08e4c51	projects	projects/media/1770665075184-14.jpg	\N	2026-02-09 19:24:36.416491+00	2026-02-09 19:24:36.416491+00	2026-02-09 19:24:36.416491+00	{"eTag": "\\"385d86fc97e1e1d3413c9a43ca35dc9e\\"", "size": 137751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-09T19:24:37.000Z", "contentLength": 137751, "httpStatusCode": 200}	c8836f37-cd3b-4b3e-9a08-b8e37405f16e	\N	{}
a51b5eb6-0e12-4b58-b27b-c01ea2ecb7c6	blocks	blocks/1773605376896-8ikd5y.jpg	\N	2026-03-15 20:09:37.522741+00	2026-03-15 20:09:37.522741+00	2026-03-15 20:09:37.522741+00	{"eTag": "\\"bd7bed6996476ad06f3721f31d787834\\"", "size": 95367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-15T20:09:38.000Z", "contentLength": 95367, "httpStatusCode": 200}	cc8a632b-3dbf-40a3-b275-2413f4d0516a	\N	{}
5953bcde-a395-453a-b252-78d31c14aa3f	projects	projects/media/1770665075918-14.jpg	\N	2026-02-09 19:24:36.981295+00	2026-02-09 19:24:36.981295+00	2026-02-09 19:24:36.981295+00	{"eTag": "\\"385d86fc97e1e1d3413c9a43ca35dc9e\\"", "size": 137751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-09T19:24:37.000Z", "contentLength": 137751, "httpStatusCode": 200}	f15d7b23-16ef-440b-91c3-8b5ada6901ce	\N	{}
8033adee-3497-471b-bba8-8f73b5b144d1	projects	projects/media/1770665076367-4.jpg	\N	2026-02-09 19:24:37.464044+00	2026-02-09 19:24:37.464044+00	2026-02-09 19:24:37.464044+00	{"eTag": "\\"ebe0deafc5b301c5f128b619d5d09295\\"", "size": 114064, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-09T19:24:38.000Z", "contentLength": 114064, "httpStatusCode": 200}	a42f1337-5c74-4cd5-906f-48e788c5fbca	\N	{}
5d0daebd-fc67-495b-8b53-c27b54c4170f	blocks	blocks/1773605376897-wogay3.png	\N	2026-03-15 20:09:37.82663+00	2026-03-15 20:09:37.82663+00	2026-03-15 20:09:37.82663+00	{"eTag": "\\"9e7a3fa2a8d613119ee4a286c1d02466\\"", "size": 1420434, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-15T20:09:38.000Z", "contentLength": 1420434, "httpStatusCode": 200}	b2d34c86-7bb9-4268-86e9-72f7a364bcb5	\N	{}
562d7613-1c87-4fe9-97ea-6441ac21514a	projects	projects/media/1770711957145-19.jpg	\N	2026-02-10 08:25:59.633206+00	2026-02-10 08:25:59.633206+00	2026-02-10 08:25:59.633206+00	{"eTag": "\\"ed8e71e0d7e3f42c3a762441f0e5e083\\"", "size": 168022, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:00.000Z", "contentLength": 168022, "httpStatusCode": 200}	5b57f966-4e1c-4bd2-b1ba-2c602fdf0983	\N	{}
bf94c3ee-d6ae-4fa8-b89f-4d656d160637	projects	projects/media/1770711957145-20.jpg	\N	2026-02-10 08:25:59.840019+00	2026-02-10 08:25:59.840019+00	2026-02-10 08:25:59.840019+00	{"eTag": "\\"42df7cb65025f4fe30f696467d60aa65\\"", "size": 155871, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:00.000Z", "contentLength": 155871, "httpStatusCode": 200}	189f131e-9af4-4a98-a72c-62490c7bb1bb	\N	{}
47822045-ccad-4220-8fb9-4c47fc44b401	projects	projects/media/1770711957145-21.jpg	\N	2026-02-10 08:25:59.877667+00	2026-02-10 08:25:59.877667+00	2026-02-10 08:25:59.877667+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:00.000Z", "contentLength": 166740, "httpStatusCode": 200}	184c7c44-08c4-4b04-a301-66f7bbe2e9d7	\N	{}
af63c5aa-3244-45db-acfe-5ee700a3e01a	projects	projects/media/1770711957944-19.jpg	\N	2026-02-10 08:26:00.294064+00	2026-02-10 08:26:00.294064+00	2026-02-10 08:26:00.294064+00	{"eTag": "\\"ed8e71e0d7e3f42c3a762441f0e5e083\\"", "size": 168022, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:01.000Z", "contentLength": 168022, "httpStatusCode": 200}	54b6f765-eeae-4882-a1dc-c315364e85af	\N	{}
351103aa-ffe8-41fd-a9eb-3185f0c8656d	projects	projects/media/1770711957944-21.jpg	\N	2026-02-10 08:26:00.449404+00	2026-02-10 08:26:00.449404+00	2026-02-10 08:26:00.449404+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:01.000Z", "contentLength": 166740, "httpStatusCode": 200}	d7df7e04-b4b2-4163-b2c3-ef1fb96d4cc2	\N	{}
cdc3dbe2-67ab-465d-a9b9-2dabc8fe752d	projects	projects/media/1770711957944-20.jpg	\N	2026-02-10 08:26:00.608488+00	2026-02-10 08:26:00.608488+00	2026-02-10 08:26:00.608488+00	{"eTag": "\\"42df7cb65025f4fe30f696467d60aa65\\"", "size": 155871, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:01.000Z", "contentLength": 155871, "httpStatusCode": 200}	e8a787b8-bd54-482a-9ae3-3d49f2a07f2f	\N	{}
1931f3e7-5abb-4deb-9253-53bfc9fbf121	projects	projects/media/1770711958660-21.jpg	\N	2026-02-10 08:26:01.055384+00	2026-02-10 08:26:01.055384+00	2026-02-10 08:26:01.055384+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T08:26:01.000Z", "contentLength": 166740, "httpStatusCode": 200}	48e81066-a0f2-4bbe-9e3f-ccc7f0d9e844	\N	{}
9e049754-51ee-4052-a570-7b3bdcaa6851	projects	projects/media/1770748862273-18.jpg	\N	2026-02-10 18:41:05.571688+00	2026-02-10 18:41:05.571688+00	2026-02-10 18:41:05.571688+00	{"eTag": "\\"b8261e61b920cfbb6d40b2570821031e\\"", "size": 76171, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:06.000Z", "contentLength": 76171, "httpStatusCode": 200}	d25c3f9e-236c-4684-b063-b09187278400	\N	{}
e80bdf9e-46d7-4c06-abe5-e7fef85e9aa4	projects	projects/media/1770748862274-17.jpg	\N	2026-02-10 18:41:05.601533+00	2026-02-10 18:41:05.601533+00	2026-02-10 18:41:05.601533+00	{"eTag": "\\"fa8e3c9bd84406af23d7d1da0c6029ee\\"", "size": 184216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:06.000Z", "contentLength": 184216, "httpStatusCode": 200}	2bdcfe9d-7e65-4347-b891-ecd6b7a7b362	\N	{}
d22ce398-46aa-43c0-9e94-5c73eb047777	projects	projects/media/1770748862274-15.jpg	\N	2026-02-10 18:41:05.620386+00	2026-02-10 18:41:05.620386+00	2026-02-10 18:41:05.620386+00	{"eTag": "\\"d2faa949386d4e6881eaa0c934cdde30\\"", "size": 110941, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:06.000Z", "contentLength": 110941, "httpStatusCode": 200}	88afff10-ff6f-4479-9830-c0832a2ee4a9	\N	{}
ced38725-1468-44cd-93c4-484dcbbe4d9c	projects	projects/media/1770748862274-16.jpg	\N	2026-02-10 18:41:05.631159+00	2026-02-10 18:41:05.631159+00	2026-02-10 18:41:05.631159+00	{"eTag": "\\"a8dab24565a940d00486ea9c309e9178\\"", "size": 166120, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:06.000Z", "contentLength": 166120, "httpStatusCode": 200}	00cc1445-1e8a-40ba-b95f-c9bc875d0330	\N	{}
1d172336-07f9-46d1-811c-f944e057192e	projects	projects/media/1770748862274-14.jpg	\N	2026-02-10 18:41:05.855015+00	2026-02-10 18:41:05.855015+00	2026-02-10 18:41:05.855015+00	{"eTag": "\\"385d86fc97e1e1d3413c9a43ca35dc9e\\"", "size": 137751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:06.000Z", "contentLength": 137751, "httpStatusCode": 200}	0defcbe6-7dc9-40eb-824d-dac1e317e6a0	\N	{}
1c9f9d73-8231-41ab-ba4d-49e71e8710e1	blocks	blocks/1773605376897-u7zt3g.jpg	\N	2026-03-15 20:09:37.518264+00	2026-03-15 20:09:37.518264+00	2026-03-15 20:09:37.518264+00	{"eTag": "\\"ed8e71e0d7e3f42c3a762441f0e5e083\\"", "size": 168022, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-15T20:09:38.000Z", "contentLength": 168022, "httpStatusCode": 200}	52bde8be-f640-4cb2-b865-5d5ba862d00a	\N	{}
386fbabe-ca8d-44bc-add3-672cb52ef9cc	projects	projects/media/1770748863122-18.jpg	\N	2026-02-10 18:41:06.231817+00	2026-02-10 18:41:06.231817+00	2026-02-10 18:41:06.231817+00	{"eTag": "\\"b8261e61b920cfbb6d40b2570821031e\\"", "size": 76171, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 76171, "httpStatusCode": 200}	32e72696-03f6-4126-9ce6-9ffcb1efe50a	\N	{}
b5883a9e-2402-4a5c-ac2c-49e6f6a4ac2b	projects	projects/media/1770748863122-20.jpg	\N	2026-02-10 18:41:06.234781+00	2026-02-10 18:41:06.234781+00	2026-02-10 18:41:06.234781+00	{"eTag": "\\"42df7cb65025f4fe30f696467d60aa65\\"", "size": 155871, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 155871, "httpStatusCode": 200}	00461799-f9d1-4194-8bbd-75f00b37fb3b	\N	{}
6b6ecca2-15ad-4223-a9bc-c117e21fda18	projects	projects/media/1770748863122-17.jpg	\N	2026-02-10 18:41:06.250572+00	2026-02-10 18:41:06.250572+00	2026-02-10 18:41:06.250572+00	{"eTag": "\\"fa8e3c9bd84406af23d7d1da0c6029ee\\"", "size": 184216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 184216, "httpStatusCode": 200}	6e4421fa-68c0-4249-9222-4a827ccab122	\N	{}
fb99e3ab-c324-45a9-a3c2-e64d2998efff	projects	projects/media/1770748863122-19.jpg	\N	2026-02-10 18:41:06.286514+00	2026-02-10 18:41:06.286514+00	2026-02-10 18:41:06.286514+00	{"eTag": "\\"ed8e71e0d7e3f42c3a762441f0e5e083\\"", "size": 168022, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 168022, "httpStatusCode": 200}	cdd1016f-98d9-4971-89eb-b7249f47e7d0	\N	{}
2e5568fa-bd8e-4eef-b97a-40656ba7d39c	projects	projects/media/1770748863122-15.jpg	\N	2026-02-10 18:41:06.356099+00	2026-02-10 18:41:06.356099+00	2026-02-10 18:41:06.356099+00	{"eTag": "\\"d2faa949386d4e6881eaa0c934cdde30\\"", "size": 110941, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 110941, "httpStatusCode": 200}	ef41fe86-6228-4c2c-be2f-fb82befb4fed	\N	{}
c9a7bdd4-01f1-487a-8356-eb783ff02412	blocks	blocks/1773605376897-a5eb8l.jpg	\N	2026-03-15 20:09:37.51342+00	2026-03-15 20:09:37.51342+00	2026-03-15 20:09:37.51342+00	{"eTag": "\\"0b14e50e26ecfd99697e04b894ad80c7\\"", "size": 99490, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-15T20:09:38.000Z", "contentLength": 99490, "httpStatusCode": 200}	39fc2943-1c06-403e-840f-aceec60c9aa8	\N	{}
194eb7c8-1b3c-42a5-a23b-0e4ef4395697	projects	projects/media/1770748863122-13.jpg	\N	2026-02-10 18:41:06.432797+00	2026-02-10 18:41:06.432797+00	2026-02-10 18:41:06.432797+00	{"eTag": "\\"ca699306378d47ae33fd81dfb70e2a41\\"", "size": 91601, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 91601, "httpStatusCode": 200}	19e23e2b-873e-43d5-afa5-52bda9589f9e	\N	{}
95ee40d7-269a-4418-a8ba-48dd2ed34711	projects	projects/media/1770748863122-14.jpg	\N	2026-02-10 18:41:06.532387+00	2026-02-10 18:41:06.532387+00	2026-02-10 18:41:06.532387+00	{"eTag": "\\"385d86fc97e1e1d3413c9a43ca35dc9e\\"", "size": 137751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 137751, "httpStatusCode": 200}	57fe2384-f6b3-47ec-980d-76adf0d1d313	\N	{}
cbe1a4ba-2b4c-4268-b6c4-4396fd9624da	projects	projects/media/1770748863122-16.jpg	\N	2026-02-10 18:41:06.559559+00	2026-02-10 18:41:06.559559+00	2026-02-10 18:41:06.559559+00	{"eTag": "\\"a8dab24565a940d00486ea9c309e9178\\"", "size": 166120, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 166120, "httpStatusCode": 200}	bf41518e-36e2-4645-9824-7f07a7064586	\N	{}
c3a99e1f-c28e-40be-9611-d67da1bd6477	projects	projects/media/1770748863122-21.jpg	\N	2026-02-10 18:41:06.592503+00	2026-02-10 18:41:06.592503+00	2026-02-10 18:41:06.592503+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 166740, "httpStatusCode": 200}	2511dfed-c77f-4a13-aa6e-a570f5faa31a	\N	{}
fa4d7242-4c54-4ee2-8d16-465c5dcea333	projects	projects/media/1770748863865-18.jpg	\N	2026-02-10 18:41:06.917661+00	2026-02-10 18:41:06.917661+00	2026-02-10 18:41:06.917661+00	{"eTag": "\\"b8261e61b920cfbb6d40b2570821031e\\"", "size": 76171, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:41:07.000Z", "contentLength": 76171, "httpStatusCode": 200}	a32025aa-5e01-45cf-a40f-ad0952dd2d61	\N	{}
3e38de37-2ad5-4d49-865a-2cb9b9f75331	projects	projects/media/1770749393605-image (5).png	\N	2026-02-10 18:49:57.544502+00	2026-02-10 18:49:57.544502+00	2026-02-10 18:49:57.544502+00	{"eTag": "\\"cb274f461e2e8a1196083098346535e8\\"", "size": 4031797, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:49:58.000Z", "contentLength": 4031797, "httpStatusCode": 200}	00446275-4d5c-4fec-8f71-5f2fe508fc67	\N	{}
41d51219-c04a-4ab1-ab51-0271ea8f872d	blocks	blocks/1773495120418-tzyibg.jpg	\N	2026-03-14 13:32:01.890339+00	2026-03-14 13:32:01.890339+00	2026-03-14 13:32:01.890339+00	{"eTag": "\\"4ad61959ae4de5b16d47dc2b9f9efd6a\\"", "size": 509387, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:32:02.000Z", "contentLength": 509387, "httpStatusCode": 200}	cc0e7245-0f09-458d-b0d0-c497972d4c90	\N	{}
f3887260-03d5-412e-a7c0-e72304dca71d	projects	projects/media/1770749395098-image (5).png	\N	2026-02-10 18:49:58.94915+00	2026-02-10 18:49:58.94915+00	2026-02-10 18:49:58.94915+00	{"eTag": "\\"cb274f461e2e8a1196083098346535e8\\"", "size": 4031797, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T18:49:59.000Z", "contentLength": 4031797, "httpStatusCode": 200}	5c39b373-058d-4b50-9cb0-3ce2bb819632	\N	{}
5cc15196-ba30-4391-a73a-a58f91ec1af3	projects	projects/media/1770750311985-2.jpg	\N	2026-02-10 19:05:15.176929+00	2026-02-10 19:05:15.176929+00	2026-02-10 19:05:15.176929+00	{"eTag": "\\"bd7bed6996476ad06f3721f31d787834\\"", "size": 95367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T19:05:16.000Z", "contentLength": 95367, "httpStatusCode": 200}	705f5cd9-abec-4e33-8aa5-63d9bd05255b	\N	{}
5537f74b-7a7e-42ca-b92d-9a76e0e5af45	blocks	blocks/1773495121176-hrkovz.png	\N	2026-03-14 13:32:02.625+00	2026-03-14 13:32:02.625+00	2026-03-14 13:32:02.625+00	{"eTag": "\\"9e7a3fa2a8d613119ee4a286c1d02466\\"", "size": 1420434, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:32:03.000Z", "contentLength": 1420434, "httpStatusCode": 200}	5ea21aeb-5c09-4623-a0d3-643ed48ded25	\N	{}
15c272c1-506c-407f-b7a0-255c6f43a89f	projects	projects/media/1770750312703-2.jpg	\N	2026-02-10 19:05:15.863381+00	2026-02-10 19:05:15.863381+00	2026-02-10 19:05:15.863381+00	{"eTag": "\\"bd7bed6996476ad06f3721f31d787834\\"", "size": 95367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-10T19:05:16.000Z", "contentLength": 95367, "httpStatusCode": 200}	88f96e61-fb89-423a-a75d-97ba21649661	\N	{}
cd565a99-3e96-45a9-b45e-4c64f3ee5c0f	projects	projects/media/1770913960647-2d8584.jpg	\N	2026-02-12 16:32:41.294611+00	2026-02-12 16:32:41.294611+00	2026-02-12 16:32:41.294611+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-12T16:32:42.000Z", "contentLength": 409990, "httpStatusCode": 200}	f64ab971-6972-4185-886d-8f2a2b82fb73	\N	{}
1b933f48-4f23-49c2-9a77-2d3d3230c6c9	blocks	blocks/1773495121908-s1y1cm.png	\N	2026-03-14 13:32:03.421222+00	2026-03-14 13:32:03.421222+00	2026-03-14 13:32:03.421222+00	{"eTag": "\\"9b2af176c1915979f2a1eb3bc6c92120\\"", "size": 1214223, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:32:04.000Z", "contentLength": 1214223, "httpStatusCode": 200}	61159e6a-c4c4-4c89-bf89-fda50b4ea82b	\N	{}
e41f9131-d353-45ce-9b57-2ced907b6917	projects	projects/media/1770913961223-ylklj2.jpg	\N	2026-02-12 16:32:41.954489+00	2026-02-12 16:32:41.954489+00	2026-02-12 16:32:41.954489+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-12T16:32:42.000Z", "contentLength": 409990, "httpStatusCode": 200}	3f1bd123-2a77-4ff4-9673-19884b5f495d	\N	{}
8d7b7717-b0a8-4f92-94d8-dc2f3f76ee5f	projects	projects/media/1770918361521-7dxq68.jpg	\N	2026-02-12 17:46:02.381732+00	2026-02-12 17:46:02.381732+00	2026-02-12 17:46:02.381732+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-12T17:46:03.000Z", "contentLength": 409990, "httpStatusCode": 200}	03280157-6e57-4d39-abab-df1d828bedff	\N	{}
bedcdfdc-ac90-4760-bc98-912b1525ff1a	blocks	blocks/1773495128340-1mphr6.jpg	\N	2026-03-14 13:32:09.623068+00	2026-03-14 13:32:09.623068+00	2026-03-14 13:32:09.623068+00	{"eTag": "\\"4ad61959ae4de5b16d47dc2b9f9efd6a\\"", "size": 509387, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:32:10.000Z", "contentLength": 509387, "httpStatusCode": 200}	5db8240f-6c88-405e-af3a-608d6c689c40	\N	{}
c85cc9a6-d6d0-4344-8585-f8134e9a5157	projects	projects/media/1770921733907-d9e4o2.jpg	\N	2026-02-12 18:42:14.95922+00	2026-02-12 18:42:14.95922+00	2026-02-12 18:42:14.95922+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-12T18:42:15.000Z", "contentLength": 409990, "httpStatusCode": 200}	bc109f47-b6e8-40c9-8b3b-199929f91d91	\N	{}
5483ecf4-647c-4c1a-9b24-4e8b87068826	projects	projects/media/1770921735226-lq3o5l.jpg	\N	2026-02-12 18:42:15.986985+00	2026-02-12 18:42:15.986985+00	2026-02-12 18:42:15.986985+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-12T18:42:16.000Z", "contentLength": 409990, "httpStatusCode": 200}	c2befa6b-e7a6-4acc-8666-f2b32dd4d472	\N	{}
aae896ef-ddb6-421b-815c-9f49ddd7a640	blocks	blocks/1773495128947-ya45zo.png	\N	2026-03-14 13:32:10.290119+00	2026-03-14 13:32:10.290119+00	2026-03-14 13:32:10.290119+00	{"eTag": "\\"9e7a3fa2a8d613119ee4a286c1d02466\\"", "size": 1420434, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:32:11.000Z", "contentLength": 1420434, "httpStatusCode": 200}	64f7e4aa-0da4-45da-b178-0ce1c4fc2ce5	\N	{}
a79cf51e-292a-4e34-bf8e-05579e6618fa	blocks	blocks/1770978347168-8f7ca3.jpg	\N	2026-02-13 10:25:49.13194+00	2026-02-13 10:25:49.13194+00	2026-02-13 10:25:49.13194+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T10:25:50.000Z", "contentLength": 409990, "httpStatusCode": 200}	f0f2324f-1143-4125-8582-9e0e029363b3	\N	{}
c00e5448-c891-40bc-b40d-fa5ab1d7ac97	blocks	blocks/1770979373059-b29oxq.jpg	\N	2026-02-13 10:42:54.879571+00	2026-02-13 10:42:54.879571+00	2026-02-13 10:42:54.879571+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T10:42:55.000Z", "contentLength": 166740, "httpStatusCode": 200}	6019522e-418e-449e-b0ba-a34bd3b0ee7c	\N	{}
14d60f93-4db3-4c01-8a22-b14def262303	blocks	blocks/1773495129600-gnqajx.png	\N	2026-03-14 13:32:10.771016+00	2026-03-14 13:32:10.771016+00	2026-03-14 13:32:10.771016+00	{"eTag": "\\"9b2af176c1915979f2a1eb3bc6c92120\\"", "size": 1214223, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:32:11.000Z", "contentLength": 1214223, "httpStatusCode": 200}	46ea3a41-aa58-4465-9bb5-90ac150cfe4d	\N	{}
e67f5e61-ea77-4ccf-b752-a6c9394a2c84	blocks	blocks/1770988637174-h8h2d7.jpg	\N	2026-02-13 13:17:18.717276+00	2026-02-13 13:17:18.717276+00	2026-02-13 13:17:18.717276+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T13:17:19.000Z", "contentLength": 409990, "httpStatusCode": 200}	a1848d28-ebac-436c-9461-abcea6b29e77	\N	{}
48f525fb-e574-4034-abbd-d0d9435b58ef	blocks	blocks/1770993161664-pw14yb.jpg	\N	2026-02-13 14:32:43.516264+00	2026-02-13 14:32:43.516264+00	2026-02-13 14:32:43.516264+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T14:32:44.000Z", "contentLength": 166740, "httpStatusCode": 200}	c3ddb2f7-d9c3-4a47-ad35-ca753e09d596	\N	{}
f45c617e-349b-4d9d-b064-94236c316641	blocks	blocks/1773495257021-rhtjne.png	\N	2026-03-14 13:34:18.709482+00	2026-03-14 13:34:18.709482+00	2026-03-14 13:34:18.709482+00	{"eTag": "\\"cb274f461e2e8a1196083098346535e8\\"", "size": 4031797, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:34:19.000Z", "contentLength": 4031797, "httpStatusCode": 200}	23f9d888-13d1-4f35-9717-5a9f7879e62d	\N	{}
302301d7-a205-4bce-8023-95cf91e0ef31	blocks	blocks/1770994140596-1a1pit.png	\N	2026-02-13 14:49:02.208921+00	2026-02-13 14:49:02.208921+00	2026-02-13 14:49:02.208921+00	{"eTag": "\\"4bfc96da1ecd5d76947bda2a45de11b6\\"", "size": 149294, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T14:49:03.000Z", "contentLength": 149294, "httpStatusCode": 200}	67da654e-87a5-40f3-ae3a-f08bcff4c6db	\N	{}
f2d589d7-dc10-48d4-b5ab-ce91635b8a2a	blocks	blocks/1771001508096-z8kbjx.jpg	\N	2026-02-13 16:51:50.101345+00	2026-02-13 16:51:50.101345+00	2026-02-13 16:51:50.101345+00	{"eTag": "\\"da28e183a3c269eb64854534308c71ee\\"", "size": 409990, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:51.000Z", "contentLength": 409990, "httpStatusCode": 200}	f5fe1ea2-50a8-40a7-964d-7247cd554b21	\N	{}
7f9869f8-1507-414c-9263-671fd77488e6	blocks	blocks/1771001508843-uvum8w.jpg	\N	2026-02-13 16:51:50.367026+00	2026-02-13 16:51:50.367026+00	2026-02-13 16:51:50.367026+00	{"eTag": "\\"3d3be6671a55e2fa3560cbf575b45d78\\"", "size": 166740, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:51.000Z", "contentLength": 166740, "httpStatusCode": 200}	df1075af-1fb5-450c-86e3-5c545a321e61	\N	{}
a9a71819-484c-4552-95ba-e169ce22dcc0	blocks	blocks/1771001509102-40lwmj.jpg	\N	2026-02-13 16:51:50.640863+00	2026-02-13 16:51:50.640863+00	2026-02-13 16:51:50.640863+00	{"eTag": "\\"42df7cb65025f4fe30f696467d60aa65\\"", "size": 155871, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:51.000Z", "contentLength": 155871, "httpStatusCode": 200}	120c1c99-fa16-46e5-b28a-8bab508e593e	\N	{}
6d07cdc5-88f2-49fe-9232-212083afc3ed	blocks	blocks/1771001509379-s04j7f.jpg	\N	2026-02-13 16:51:50.932793+00	2026-02-13 16:51:50.932793+00	2026-02-13 16:51:50.932793+00	{"eTag": "\\"ed8e71e0d7e3f42c3a762441f0e5e083\\"", "size": 168022, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:51.000Z", "contentLength": 168022, "httpStatusCode": 200}	f489cea6-af82-47fe-96a7-6da10dc80f6f	\N	{}
f8b50ff9-0e73-4379-87d6-b9b038253b46	blocks	blocks/1771001509673-pcoa63.jpg	\N	2026-02-13 16:51:51.154174+00	2026-02-13 16:51:51.154174+00	2026-02-13 16:51:51.154174+00	{"eTag": "\\"b8261e61b920cfbb6d40b2570821031e\\"", "size": 76171, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:52.000Z", "contentLength": 76171, "httpStatusCode": 200}	0ce8e3b8-dfa5-4d9a-8af9-404c6b862924	\N	{}
48f6247f-af38-4000-b6b2-7b008958ab6f	blocks	blocks/1771001509891-vqgw3e.jpg	\N	2026-02-13 16:51:51.406279+00	2026-02-13 16:51:51.406279+00	2026-02-13 16:51:51.406279+00	{"eTag": "\\"fa8e3c9bd84406af23d7d1da0c6029ee\\"", "size": 184216, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:52.000Z", "contentLength": 184216, "httpStatusCode": 200}	9dbd29f8-66d5-4096-aa08-a91a7ed5815a	\N	{}
d73d490f-b3e1-4a21-8b4b-168ca7eaf83e	blocks	blocks/1773495257989-py8is5.jpg	\N	2026-03-14 13:34:19.005719+00	2026-03-14 13:34:19.005719+00	2026-03-14 13:34:19.005719+00	{"eTag": "\\"385d86fc97e1e1d3413c9a43ca35dc9e\\"", "size": 137751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:34:19.000Z", "contentLength": 137751, "httpStatusCode": 200}	35e238f6-3e2c-4225-a1c5-08b79def7c92	\N	{}
90bd8973-842b-40b9-a364-5dac3f7a7c27	blocks	blocks/1771001510146-1rvnn6.jpg	\N	2026-02-13 16:51:51.67518+00	2026-02-13 16:51:51.67518+00	2026-02-13 16:51:51.67518+00	{"eTag": "\\"a8dab24565a940d00486ea9c309e9178\\"", "size": 166120, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:52.000Z", "contentLength": 166120, "httpStatusCode": 200}	3af9830b-60a4-4596-a614-53e78de82b03	\N	{}
4b763118-144d-43a0-b9de-ab4ddf968279	blocks	blocks/1771001510409-ux8ghn.jpg	\N	2026-02-13 16:51:51.903561+00	2026-02-13 16:51:51.903561+00	2026-02-13 16:51:51.903561+00	{"eTag": "\\"d2faa949386d4e6881eaa0c934cdde30\\"", "size": 110941, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:52.000Z", "contentLength": 110941, "httpStatusCode": 200}	9f197bcb-adfd-44e6-9d68-cf395ed03c6a	\N	{}
1e284c78-ae9b-4142-a20d-304a4df93e27	blocks	blocks/1773495258291-sruc9i.jpg	\N	2026-03-14 13:34:19.243085+00	2026-03-14 13:34:19.243085+00	2026-03-14 13:34:19.243085+00	{"eTag": "\\"bd7bed6996476ad06f3721f31d787834\\"", "size": 95367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-14T13:34:20.000Z", "contentLength": 95367, "httpStatusCode": 200}	f78ac364-aa43-4a0f-8e01-1bb069436905	\N	{}
5fbaaa88-d8c2-45ae-b4ab-3cef299edef5	blocks	blocks/1771001510639-rolk67.jpg	\N	2026-02-13 16:51:52.162015+00	2026-02-13 16:51:52.162015+00	2026-02-13 16:51:52.162015+00	{"eTag": "\\"385d86fc97e1e1d3413c9a43ca35dc9e\\"", "size": 137751, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:53.000Z", "contentLength": 137751, "httpStatusCode": 200}	a4095e9e-231e-40d6-b3f5-0fb87b6784cb	\N	{}
10f7e280-c9b8-4aeb-8a5a-268ecc302395	blocks	blocks/1773644334378-l0uztc.jpg	\N	2026-03-16 06:58:55.384538+00	2026-03-16 06:58:55.384538+00	2026-03-16 06:58:55.384538+00	{"eTag": "\\"bd7bed6996476ad06f3721f31d787834\\"", "size": 95367, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-16T06:58:56.000Z", "contentLength": 95367, "httpStatusCode": 200}	9c1f2696-e615-4f46-88fa-fa2b71091221	\N	{}
85fda293-c203-4174-926f-e0b6f9912d6b	blocks	blocks/1771001510905-v2g6tm.jpg	\N	2026-02-13 16:51:52.396764+00	2026-02-13 16:51:52.396764+00	2026-02-13 16:51:52.396764+00	{"eTag": "\\"ca699306378d47ae33fd81dfb70e2a41\\"", "size": 91601, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:53.000Z", "contentLength": 91601, "httpStatusCode": 200}	40bbebbb-eb79-4e06-868c-a4be9efecac4	\N	{}
b2c9d729-8dd1-42f3-9d6b-d194e31d354c	blocks	blocks/1771001511138-oz4d04.jpg	\N	2026-02-13 16:51:52.647632+00	2026-02-13 16:51:52.647632+00	2026-02-13 16:51:52.647632+00	{"eTag": "\\"e314acf1fdb926c35c225be66515d174\\"", "size": 83477, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-13T16:51:53.000Z", "contentLength": 83477, "httpStatusCode": 200}	0b63e8c3-2df1-4ca1-94d7-d63cd5e1e98d	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 3, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key UNIQUE (slug);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_activity_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_entity_id ON public.activity_logs USING btree (entity_id);


--
-- Name: idx_activity_logs_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_email ON public.activity_logs USING btree (user_email);


--
-- Name: idx_blocks_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocks_post_id ON public.blocks USING btree (post_id);


--
-- Name: idx_blocks_post_id_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocks_post_id_sort ON public.blocks USING btree (post_id, sort_order);


--
-- Name: idx_blocks_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blocks_sort_order ON public.blocks USING btree (post_id, sort_order);


--
-- Name: idx_contact_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages USING btree (created_at DESC);


--
-- Name: idx_contact_messages_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_messages_email ON public.contact_messages USING btree (email);


--
-- Name: idx_media_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_project_id ON public.media USING btree (project_id);


--
-- Name: idx_posts_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_deleted_at ON public.posts USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: idx_posts_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_featured ON public.posts USING btree (featured) WHERE (featured = true);


--
-- Name: idx_posts_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_slug ON public.posts USING btree (slug);


--
-- Name: idx_posts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_status ON public.posts USING btree (status);


--
-- Name: idx_posts_status_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_status_slug ON public.posts USING btree (status, slug);


--
-- Name: idx_projects_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_created ON public.projects USING btree (created_at DESC);


--
-- Name: idx_projects_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_location ON public.projects USING btree (location);


--
-- Name: idx_projects_sections; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_sections ON public.projects USING gin (sections);


--
-- Name: idx_projects_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_tags ON public.projects USING gin (tags);


--
-- Name: idx_projects_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_year ON public.projects USING btree (year);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: projects_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_created_at_idx ON public.projects USING btree (created_at DESC);


--
-- Name: projects_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_location_idx ON public.projects USING btree (location);


--
-- Name: projects_tags_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_tags_gin ON public.projects USING gin (tags);


--
-- Name: projects_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_year_idx ON public.projects USING btree (year);


--
-- Name: site_settings_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_key_idx ON public.site_settings USING btree (key);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: posts update_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blocks blocks_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: blocks blocks_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: media media_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: projects Admin write access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin write access" ON public.projects TO authenticated USING (((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = ( SELECT site_settings.value
   FROM public.site_settings
  WHERE (site_settings.key = 'admin_email'::text)
 LIMIT 1)))) WITH CHECK (((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = ( SELECT site_settings.value
   FROM public.site_settings
  WHERE (site_settings.key = 'admin_email'::text)
 LIMIT 1))));


--
-- Name: site_settings Admin write access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin write access" ON public.site_settings TO authenticated USING (((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = ( SELECT site_settings_1.value
   FROM public.site_settings site_settings_1
  WHERE (site_settings_1.key = 'admin_email'::text)
 LIMIT 1)))) WITH CHECK (((auth.jwt() IS NOT NULL) AND ((auth.jwt() ->> 'email'::text) = ( SELECT site_settings_1.value
   FROM public.site_settings site_settings_1
  WHERE (site_settings_1.key = 'admin_email'::text)
 LIMIT 1))));


--
-- Name: projects Public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access" ON public.projects FOR SELECT TO authenticated, anon USING (true);


--
-- Name: site_settings Public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access" ON public.site_settings FOR SELECT TO authenticated, anon USING (true);


--
-- Name: activity_logs Users can insert activity logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: activity_logs Users can view activity logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict J2hTppvjwJhbCbunBgHoEGmWAzP1zo8dbDEqAvsQ4T2KHK6Pf9OzhdXsvSnB3iC

