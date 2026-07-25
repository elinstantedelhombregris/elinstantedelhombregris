import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../../migrations/20260714_civic_custody_execution.sql', import.meta.url),
  'utf8',
);

describe('migración custody execution', () => {
  it('crea raíz inmutable y un único ledger durable para aplicados y rechazos', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS civic_custody_executions');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS civic_custody_execution_commands');
    expect(migration).toContain('rejection_reason text');
    expect(migration).toContain('WHERE applied = TRUE');
    expect(migration).toContain('BEFORE UPDATE OR DELETE ON civic_custody_executions');
    expect(migration).toContain('BEFORE UPDATE OR DELETE ON civic_custody_execution_commands');
  });

  it('fija el orden de locks, la cadena optimista y el deadline autoritativo', () => {
    const grantLock = migration.indexOf('FROM civic_custody_grants\n  WHERE grant_id = execution_grant_id\n  FOR UPDATE');
    const rootLock = migration.indexOf('FROM civic_custody_executions\n  WHERE proposal_id = NEW.proposal_id\n  FOR UPDATE', grantLock);
    const proposalLock = migration.indexOf('FROM civic_custody_coordination_proposals\n  WHERE proposal_id = NEW.proposal_id\n  FOR UPDATE', rootLock);
    expect(grantLock).toBeGreaterThan(0);
    expect(rootLock).toBeGreaterThan(grantLock);
    expect(proposalLock).toBeGreaterThan(rootLock);
    expect(migration).toContain("previous_version text := '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945'");
    expect(migration).toContain("start_event.created_at + interval '24 hours'");
    expect(migration).toContain("required_rejection := 'version_changed'");
    expect(migration).toContain("required_rejection := 'transition_not_allowed'");
    expect(migration).toContain('AND NOT reserve_exists');
    expect(migration).toContain("NEW.event_type = 'grantor_ready' AND NOT grantor_ready_exists");
    expect(migration).toContain("NEW.event_type = 'coordinator_ready' AND NOT coordinator_ready_exists");
  });

  it('no agrega campos de relato, contacto, ubicación o JSON y revoca PUBLIC', () => {
    const tableSection = migration.slice(
      migration.indexOf('CREATE TABLE IF NOT EXISTS civic_custody_executions'),
      migration.indexOf('-- No se conceden lecturas implícitas'),
    );
    expect(tableSection).not.toMatch(/\b(note|story|contact|phone|email|address|latitude|longitude|location|payload|jsonb?)\b/i);
    expect(migration).toContain('REVOKE ALL ON TABLE civic_custody_executions FROM PUBLIC');
    expect(migration).toContain('REVOKE ALL ON TABLE civic_custody_execution_commands FROM PUBLIC');
    expect(migration).toContain('schema contains non-contract columns');
  });
});
