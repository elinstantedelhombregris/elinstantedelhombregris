-- Canonical UUID identity for the civic core. The API normalizes UUID v4 and
-- actor keys to lowercase; these checks prevent a direct database writer from
-- recreating the same identity with different casing.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM civic_devices
    GROUP BY lower(actor_key)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'civic actor keys collide after lowercase canonicalization';
  END IF;
  IF EXISTS (
    SELECT 1 FROM civic_events
    GROUP BY lower(event_id)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'civic event ids collide after lowercase canonicalization';
  END IF;
  IF EXISTS (
    SELECT 1 FROM civic_entity_owners
    GROUP BY entity_type, lower(entity_id)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'civic entity owners collide after lowercase canonicalization';
  END IF;
  IF EXISTS (
    SELECT 1 FROM civic_verification_claims
    GROUP BY lower(verification_id)
    HAVING count(*) > 1
  ) OR EXISTS (
    SELECT 1 FROM civic_verification_claims
    GROUP BY lower(observation_id), verifier_actor_key
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'civic verification claims collide after lowercase canonicalization';
  END IF;
  IF EXISTS (
    SELECT 1 FROM civic_match_participants
    GROUP BY lower(match_id)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'civic match ids collide after lowercase canonicalization';
  END IF;
  IF EXISTS (
    SELECT 1 FROM civic_action_links
    GROUP BY lower(action_id)
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'civic action ids collide after lowercase canonicalization';
  END IF;
END $$;

-- Actor keys participate in foreign keys without ON UPDATE CASCADE. Refuse an
-- ambiguous legacy state instead of attempting a partial rewrite.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM civic_devices WHERE actor_key <> lower(actor_key)) THEN
    RAISE EXCEPTION 'uppercase civic actor keys require an explicit coordinated migration';
  END IF;
END $$;

UPDATE civic_events
SET event_id = lower(event_id), entity_id = lower(entity_id)
WHERE event_id <> lower(event_id) OR entity_id <> lower(entity_id);

UPDATE civic_entity_owners
SET entity_id = lower(entity_id)
WHERE entity_id <> lower(entity_id);

UPDATE civic_verification_claims
SET observation_id = lower(observation_id), verification_id = lower(verification_id)
WHERE observation_id <> lower(observation_id) OR verification_id <> lower(verification_id);

UPDATE civic_match_participants
SET match_id = lower(match_id)
WHERE match_id <> lower(match_id);

UPDATE civic_action_links
SET action_id = lower(action_id), match_id = lower(match_id)
WHERE action_id <> lower(action_id) OR match_id <> lower(match_id);

ALTER TABLE civic_devices
  DROP CONSTRAINT IF EXISTS civic_devices_actor_key_check;
ALTER TABLE civic_devices
  ADD CONSTRAINT civic_devices_actor_key_check CHECK (
    actor_key ~ '^actor_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE civic_events
  DROP CONSTRAINT IF EXISTS civic_events_event_id_check,
  DROP CONSTRAINT IF EXISTS civic_events_entity_id_check;
ALTER TABLE civic_events
  ADD CONSTRAINT civic_events_event_id_check CHECK (
    event_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  ADD CONSTRAINT civic_events_entity_id_check CHECK (
    entity_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE civic_entity_owners
  DROP CONSTRAINT IF EXISTS civic_entity_owners_entity_id_check;
ALTER TABLE civic_entity_owners
  ADD CONSTRAINT civic_entity_owners_entity_id_check CHECK (
    entity_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE civic_verification_claims
  DROP CONSTRAINT IF EXISTS civic_verification_claims_observation_id_check,
  DROP CONSTRAINT IF EXISTS civic_verification_claims_verification_id_check;
ALTER TABLE civic_verification_claims
  ADD CONSTRAINT civic_verification_claims_observation_id_check CHECK (
    observation_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  ADD CONSTRAINT civic_verification_claims_verification_id_check CHECK (
    verification_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE civic_match_participants
  DROP CONSTRAINT IF EXISTS civic_match_participants_match_id_check;
ALTER TABLE civic_match_participants
  ADD CONSTRAINT civic_match_participants_match_id_check CHECK (
    match_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE civic_action_links
  DROP CONSTRAINT IF EXISTS civic_action_links_action_id_check,
  DROP CONSTRAINT IF EXISTS civic_action_links_match_id_check;
ALTER TABLE civic_action_links
  ADD CONSTRAINT civic_action_links_action_id_check CHECK (
    action_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  ADD CONSTRAINT civic_action_links_match_id_check CHECK (
    match_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );
