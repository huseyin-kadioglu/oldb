-- Schemas for environment isolation (same Postgres database, separate schemas).
-- Applied automatically by docker-compose on first volume init.
CREATE SCHEMA IF NOT EXISTS oldb_local;
CREATE SCHEMA IF NOT EXISTS oldb_test;
CREATE SCHEMA IF NOT EXISTS oldb_prod;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'myuser') THEN
    GRANT ALL ON SCHEMA oldb_local TO myuser;
    GRANT ALL ON SCHEMA oldb_test TO myuser;
    GRANT ALL ON SCHEMA oldb_prod TO myuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA oldb_local GRANT ALL ON TABLES TO myuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA oldb_test GRANT ALL ON TABLES TO myuser;
    ALTER DEFAULT PRIVILEGES IN SCHEMA oldb_prod GRANT ALL ON TABLES TO myuser;
  END IF;
END$$;
