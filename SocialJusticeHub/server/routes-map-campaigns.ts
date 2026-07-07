// server/routes-map-campaigns.ts
// GET /api/map/campaign-layers — capas públicas de campañas para el mapa.
// Regla dura: CERO identidad de usuarios (sin submittedBy, sin flag anonymous);
// coordenadas ya snapeadas al escribir. Shape: shared/campaign-layers.ts.
import type { Express } from 'express';
import { publicReadRateLimit } from './middleware';
import type { CampaignLayersResponse } from '@shared/campaign-layers';
import { computeCampaignLayers } from './services/campanas-service';

let layersCache: { data: CampaignLayersResponse; generatedAt: number } | null = null;
const LAYERS_TTL_MS = 60 * 1000;

export function registerMapCampaignsRoutes(app: Express): void {
  app.get('/api/map/campaign-layers', publicReadRateLimit, async (_req, res) => {
    try {
      if (layersCache && Date.now() - layersCache.generatedAt < LAYERS_TTL_MS) {
        return res.json(layersCache.data);
      }
      const data = await computeCampaignLayers();
      layersCache = { data, generatedAt: Date.now() };
      return res.json(data);
    } catch (error) {
      console.error('[map-campaigns] layers error:', error);
      return res.status(500).json({ message: 'No pudimos cargar las capas de campañas.' });
    }
  });
}
