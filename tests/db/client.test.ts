import { describe, it, expect, afterEach, vi } from 'vitest';

const ORIGINAL = process.env.DATABASE_URL;

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = ORIGINAL;
  vi.resetModules();
});

describe('db client env guard', () => {
  it('throws a descriptive error when DATABASE_URL is unset', async () => {
    delete process.env.DATABASE_URL;
    vi.resetModules();
    await expect(import('../../src/db/client')).rejects.toThrow('DATABASE_URL');
  });

  it('constructs a query client when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db?sslmode=require';
    vi.resetModules();
    const mod = await import('../../src/db/client');
    expect(mod.sql).toBeDefined();
  });
});
