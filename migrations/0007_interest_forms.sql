-- Interest forms table for recording user interest.
-- DDL here is the schema source of truth; src/db/schema.ts mirrors it.

CREATE TABLE interest_forms (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name     TEXT        NOT NULL,
  last_name      TEXT        NOT NULL,
  year_in_school TEXT        NOT NULL,
  email          TEXT        NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX interest_forms_created_at_idx ON interest_forms (created_at DESC);
