import { describe, expect, it } from 'vitest';

import { resolveCivicApiUrl } from './config';

describe('política de transporte de la red cívica', () => {
  it('acepta HTTPS y normaliza query, fragmento y barra final', () => {
    expect(resolveCivicApiUrl(' https://civic.example/?debug=1#x ')).toEqual({
      url: 'https://civic.example',
      error: null,
    });
  });

  it('permite HTTP sólo para loopback cuando desarrollo lo habilita', () => {
    expect(resolveCivicApiUrl('http://localhost:5000/', { allowLoopbackHttp: true })).toEqual({
      url: 'http://localhost:5000',
      error: null,
    });
    expect(resolveCivicApiUrl('http://127.0.0.1:5000', { allowLoopbackHttp: false })).toEqual({
      url: null,
      error: 'insecure_transport',
    });
  });

  it('rechaza HTTP de red, protocolos extraños y credenciales embebidas', () => {
    expect(resolveCivicApiUrl('http://192.168.1.20:5000', { allowLoopbackHttp: true }).error)
      .toBe('insecure_transport');
    expect(resolveCivicApiUrl('file:///tmp/civic').error).toBe('unsupported_protocol');
    expect(resolveCivicApiUrl('https://user:secret@civic.example').error).toBe('credentials_forbidden');
  });

  it('falla cerrado ante valores vacíos o malformados', () => {
    expect(resolveCivicApiUrl(undefined).url).toBeNull();
    expect(resolveCivicApiUrl('civic.example').error).toBe('invalid_url');
  });
});
