import { describe, it, expect } from 'vitest';
import { parsePagination } from '../../server/lib/pagination';

const fakeReq = (query: Record<string, string>) => ({ query }) as any;

describe('parsePagination', () => {
  it('clamps oversized limit', () => {
    expect(parsePagination(fakeReq({ limit: '99999' })).limit).toBe(20);
  });
  it('rejects negative offset', () => {
    expect(parsePagination(fakeReq({ offset: '-5' })).offset).toBe(0);
  });
  it('handles non-numeric input', () => {
    expect(parsePagination(fakeReq({ limit: 'abc' }))).toEqual({ limit: 20, offset: 0 });
  });
  it('converts page to offset', () => {
    expect(parsePagination(fakeReq({ page: '3', limit: '10' })).offset).toBe(20);
  });
  it('uses defaults', () => {
    expect(parsePagination(fakeReq({}))).toEqual({ limit: 20, offset: 0 });
  });
});
