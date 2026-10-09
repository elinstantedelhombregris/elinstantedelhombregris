import { describe, expect, it, vi } from 'vitest';

import { logger } from '../../lib/logger';
import { errorHandler } from '../error-handler';

import type { Request, Response } from 'express';
vi.mock('../../lib/logger', () => ({ logger: { error: vi.fn() } }));
describe('El diagnóstico no copia el relato ni credenciales', () => {
  it('un error de consulta publica un mensaje genérico y registra solo procedencia', () => {
    const secreto = 'relato-reservado-de-la-persona';
    const err = Object.assign(new Error('SQL con ' + secreto), {
      params: [secreto],
      code: '23503',
    });
    const status = vi.fn().mockReturnThis(),
      json = vi.fn();
    const req = { path: '/api/v1/contribuciones', method: 'POST' } as Request;
    const res = { locals: { requestId: 'prueba' }, status, json } as unknown as Response;
    errorHandler()(err, req, res, () => undefined);
    expect(status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain(secreto);
    expect(logger.error).toHaveBeenCalledWith(
      {
        errorName: 'Error',
        errorCode: '23503',
        requestId: 'prueba',
        path: '/api/v1/contribuciones',
        method: 'POST',
      },
      'Unhandled error',
    );
  });
});
