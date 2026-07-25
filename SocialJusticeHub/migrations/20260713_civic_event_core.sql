-- ¡BASTA! mobile — authenticated, append-only civic event core.
-- Device identities are pseudonymous continuity credentials, never proof of
-- civil identity. Elevated roles are granted only by a later account/circle
-- linking flow.

CREATE TABLE IF NOT EXISTS civic_devices (
  id serial PRIMARY KEY,
  actor_key text NOT NULL UNIQUE,
  secret_hash text NOT NULL,
  role text NOT NULL DEFAULT 'contributor',
  linked_user_id integer REFERENCES users(id),
  revoked_at text,
  last_seen_at text DEFAULT now(),
  created_at text DEFAULT now(),
  updated_at text DEFAULT now(),
  CONSTRAINT civic_devices_role_check
    CHECK (role IN ('contributor', 'verifier', 'coordinator')),
  CONSTRAINT civic_devices_actor_key_check
    CHECK (actor_key ~ '^actor_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
);

CREATE INDEX IF NOT EXISTS civic_devices_linked_user_idx ON civic_devices(linked_user_id);
CREATE INDEX IF NOT EXISTS civic_devices_role_idx ON civic_devices(role);

CREATE TABLE IF NOT EXISTS civic_events (
  id serial PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  idempotency_key text NOT NULL UNIQUE,
  actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  operation text NOT NULL,
  payload_json text NOT NULL,
  event_hash text NOT NULL,
  occurred_at text NOT NULL,
  received_at text DEFAULT now(),
  CONSTRAINT civic_events_entity_type_check CHECK (
    entity_type IN ('observation', 'need', 'resource', 'verification', 'match', 'action', 'territory', 'consent')
  ),
  CONSTRAINT civic_events_operation_check CHECK (
    operation IN ('create', 'update', 'transition', 'delete')
  ),
  CONSTRAINT civic_events_event_id_check CHECK (
    event_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_events_entity_id_check CHECK (
    entity_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
);

CREATE INDEX IF NOT EXISTS civic_events_actor_idx ON civic_events(actor_key);
CREATE INDEX IF NOT EXISTS civic_events_entity_idx ON civic_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS civic_events_occurred_idx ON civic_events(occurred_at);

CREATE TABLE IF NOT EXISTS civic_entity_owners (
  id serial PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  owner_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  created_at text DEFAULT now(),
  CONSTRAINT civic_entity_owners_entity_unique UNIQUE (entity_type, entity_id),
  CONSTRAINT civic_entity_owners_entity_id_check CHECK (
    entity_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
);

CREATE INDEX IF NOT EXISTS civic_entity_owners_actor_idx ON civic_entity_owners(owner_actor_key);

CREATE TABLE IF NOT EXISTS civic_verification_claims (
  id serial PRIMARY KEY,
  observation_id text NOT NULL,
  verifier_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  verification_id text NOT NULL UNIQUE,
  created_at text DEFAULT now(),
  CONSTRAINT civic_verification_claims_actor_once UNIQUE (observation_id, verifier_actor_key),
  CONSTRAINT civic_verification_claims_observation_id_check CHECK (
    observation_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_verification_claims_verification_id_check CHECK (
    verification_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
);

CREATE INDEX IF NOT EXISTS civic_verification_claims_observation_idx
  ON civic_verification_claims(observation_id);

CREATE TABLE IF NOT EXISTS civic_match_participants (
  id serial PRIMARY KEY,
  match_id text NOT NULL UNIQUE,
  need_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  resource_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  created_by_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  need_accepted_at text,
  resource_accepted_at text,
  fulfilled_at text,
  confirmed_at text,
  created_at text DEFAULT now(),
  CONSTRAINT civic_match_participants_distinct_sides CHECK (need_actor_key <> resource_actor_key),
  CONSTRAINT civic_match_participants_match_id_check CHECK (
    match_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
);

CREATE INDEX IF NOT EXISTS civic_match_participants_need_idx
  ON civic_match_participants(need_actor_key);
CREATE INDEX IF NOT EXISTS civic_match_participants_resource_idx
  ON civic_match_participants(resource_actor_key);

-- Safe when an early pilot applied the first draft of this migration.
ALTER TABLE civic_match_participants ADD COLUMN IF NOT EXISTS need_accepted_at text;
ALTER TABLE civic_match_participants ADD COLUMN IF NOT EXISTS resource_accepted_at text;
ALTER TABLE civic_match_participants ADD COLUMN IF NOT EXISTS fulfilled_at text;
ALTER TABLE civic_match_participants ADD COLUMN IF NOT EXISTS confirmed_at text;

CREATE TABLE IF NOT EXISTS civic_action_links (
  id serial PRIMARY KEY,
  action_id text NOT NULL UNIQUE,
  match_id text NOT NULL,
  created_by_actor_key text NOT NULL REFERENCES civic_devices(actor_key),
  completed_at text,
  confirmed_at text,
  created_at text DEFAULT now(),
  CONSTRAINT civic_action_links_action_id_check CHECK (
    action_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  CONSTRAINT civic_action_links_match_id_check CHECK (
    match_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  )
);

CREATE INDEX IF NOT EXISTS civic_action_links_match_idx ON civic_action_links(match_id);

ALTER TABLE civic_action_links ADD COLUMN IF NOT EXISTS completed_at text;
ALTER TABLE civic_action_links ADD COLUMN IF NOT EXISTS confirmed_at text;
