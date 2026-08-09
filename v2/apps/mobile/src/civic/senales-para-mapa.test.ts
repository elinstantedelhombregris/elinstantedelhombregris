import { describe, expect, it } from 'vitest';

import {
  nadieHabloTodavia,
  planificarLucesDeZona,
  provinciaDeMobile,
  senalesParaMapa,
  type FuentesSenales,
} from './senales-para-mapa';

import type { CivicNeedRow, CivicObservationRow, CivicResourceRow } from '@/db/schema';

const AHORA = '2026-08-09T12:00:00.000Z';

const observacion = (parcial: Partial<CivicObservationRow> = {}): CivicObservationRow => ({
  id: 'obs-1',
  campaignKey: 'ollas-v1',
  campaignVersion: 1,
  territoryId: null,
  starId: null,
  creatorKey: 'actor-ana',
  category: 'comedor',
  title: 'Comedor activo',
  summary: null,
  dataJson: '{}',
  evidenceJson: '[]',
  status: 'corroborated',
  confidence: 0.8,
  exactLat: null,
  exactLng: null,
  publicLat: -34.62,
  publicLng: -58.45,
  publicPrecision: '500m',
  locationLabel: null,
  observedAt: AHORA,
  expiresAt: null,
  createdAt: AHORA,
  updatedAt: AHORA,
  syncedAt: null,
  ...parcial,
});

const necesidad = (parcial: Partial<CivicNeedRow> = {}): CivicNeedRow => ({
  id: 'need-1',
  observationId: null,
  territoryId: null,
  ownedByMe: true,
  category: 'alimentos',
  title: 'Falta arroz',
  description: null,
  quantity: null,
  unit: null,
  urgency: 3,
  status: 'submitted',
  publicLat: -34.62,
  publicLng: -58.45,
  publicPrecision: 'neighborhood',
  locationLabel: null,
  contactConsent: false,
  expiresAt: null,
  createdAt: AHORA,
  updatedAt: AHORA,
  ...parcial,
});

const recurso = (parcial: Partial<CivicResourceRow> = {}): CivicResourceRow => ({
  id: 'res-1',
  territoryId: null,
  ownedByMe: true,
  category: 'alimentos',
  title: '20kg de arroz',
  description: null,
  quantity: 20,
  unit: 'kg',
  availabilityJson: '{}',
  radiusKm: 5,
  confidence: 0.65,
  status: 'available',
  publicLat: -34.62,
  publicLng: -58.45,
  publicPrecision: 'neighborhood',
  locationLabel: null,
  contactConsent: false,
  expiresAt: null,
  createdAt: AHORA,
  updatedAt: AHORA,
  ...parcial,
});

const SIN_FUENTES: FuentesSenales = { observations: [], needs: [], resources: [] };

describe('senalesParaMapa', () => {
  it('aplana las tres fuentes en señales verificables', () => {
    const senales = senalesParaMapa({
      observations: [observacion()],
      needs: [necesidad()],
      resources: [recurso()],
    });
    expect(senales).toHaveLength(3);
    expect(senales.every((s) => s.verificable)).toBe(true);
  });

  it('una observación corroborada llega confirmada; una recién enviada no', () => {
    const [corroborada] = senalesParaMapa({ ...SIN_FUENTES, observations: [observacion({ status: 'corroborated' })] });
    const [enviada] = senalesParaMapa({ ...SIN_FUENTES, observations: [observacion({ id: 'obs-2', status: 'queued' })] });
    expect(corroborada?.confirmada).toBe(true);
    expect(enviada?.confirmada).toBe(false);
  });

  it('descarta un borrador: los estados no operativos no cuentan como voz', () => {
    const senales = senalesParaMapa({ ...SIN_FUENTES, observations: [observacion({ status: 'draft' })] });
    expect(senales).toHaveLength(0);
  });

  it('descarta una fila vencida', () => {
    const senales = senalesParaMapa({
      ...SIN_FUENTES,
      needs: [necesidad({ expiresAt: '2020-01-01T00:00:00.000Z' })],
    });
    expect(senales).toHaveLength(0);
  });

  it('descarta un recurso sin cantidad disponible', () => {
    const senales = senalesParaMapa({ ...SIN_FUENTES, resources: [recurso({ quantity: 0 })] });
    expect(senales).toHaveLength(0);
  });

  it('descarta una fila sin ubicación pública', () => {
    const senales = senalesParaMapa({ ...SIN_FUENTES, observations: [observacion({ publicLat: null })] });
    expect(senales).toHaveLength(0);
  });

  it('un recurso nunca llega confirmado: ResourceStatus no tiene corroborated', () => {
    const [s] = senalesParaMapa({ ...SIN_FUENTES, resources: [recurso()] });
    expect(s?.confirmada).toBe(false);
  });

  it('dos observaciones de la misma persona son una sola actorKey', () => {
    const senales = senalesParaMapa({
      ...SIN_FUENTES,
      observations: [observacion({ id: 'a' }), observacion({ id: 'b' })],
    });
    expect(new Set(senales.map((s) => s.actorKey)).size).toBe(1);
  });
});

describe('provinciaDeMobile', () => {
  it('resuelve Plaza de Mayo a CABA', () => {
    expect(provinciaDeMobile({ lat: -34.6037, lng: -58.3816 })).toBe('Ciudad Autónoma de Buenos Aires');
  });

  it('resuelve un punto en el interior de Córdoba a Córdoba', () => {
    expect(provinciaDeMobile({ lat: -31.42, lng: -64.19 })).toBe('Córdoba');
  });

  it('devuelve null para un punto fuera del país', () => {
    expect(provinciaDeMobile({ lat: -40, lng: -50 })).toBeNull();
  });
});

describe('planificarLucesDeZona', () => {
  const zona = {
    points: [
      { lat: -34.62, lng: -58.5 },
      { lat: -34.58, lng: -58.5 },
      { lat: -34.58, lng: -58.4 },
      { lat: -34.62, lng: -58.4 },
    ],
  };

  it('devuelve una luz por celda del plan, sin señales', () => {
    const { plan, luces } = planificarLucesDeZona(zona, SIN_FUENTES);
    expect(plan.valid).toBe(true);
    expect(luces).toHaveLength(plan.cells.length);
  });

  it('una celda muda sin señales no tiene intensidad nula: CABA tiene denominador conocido', () => {
    const { luces } = planificarLucesDeZona(zona, SIN_FUENTES);
    // Sin voces, brillo = 0/habitantes = 0 (no null): la celda está muda, no
    // "sin dato" — CABA aparece en la tabla de referencia.
    expect(luces.some((l) => l.intensidad === 0)).toBe(true);
  });

  it('una señal adentro de la zona enciende su celda', () => {
    const { plan, luces: sinSenales } = planificarLucesDeZona(zona, SIN_FUENTES);
    const primeraCelda = plan.cells[0];
    if (!primeraCelda) throw new Error('debería haber celda');
    const conSenales = planificarLucesDeZona(zona, {
      ...SIN_FUENTES,
      observations: [observacion({
        publicLat: primeraCelda.center.lat,
        publicLng: primeraCelda.center.lng,
      })],
    }).luces;
    const antes = sinSenales.find((l) => l.cellId === primeraCelda.id);
    const despues = conSenales.find((l) => l.cellId === primeraCelda.id);
    expect(antes?.intensidad).toBe(0);
    expect(despues?.intensidad).not.toBeNull();
    expect(despues?.intensidad ?? 0).toBeGreaterThan(0);
  });

  it('nadieHabloTodavia es cierto sin señales y falso apenas hay una voz', () => {
    const { conteos: sinSenales, plan } = planificarLucesDeZona(zona, SIN_FUENTES);
    expect(nadieHabloTodavia(sinSenales)).toBe(true);
    const primeraCelda = plan.cells[0];
    if (!primeraCelda) throw new Error('debería haber celda');
    const { conteos: conSenales } = planificarLucesDeZona(zona, {
      ...SIN_FUENTES,
      observations: [observacion({ publicLat: primeraCelda.center.lat, publicLng: primeraCelda.center.lng })],
    });
    expect(nadieHabloTodavia(conSenales)).toBe(false);
  });
});
