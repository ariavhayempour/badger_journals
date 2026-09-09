import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { src } from '../mock-path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { InterestFormRow } from '../../src/db/schema';

const formRow: InterestFormRow = {
  id: 1,
  first_name: 'Bucky',
  last_name: 'Badger',
  year_in_school: 'Junior',
  email: 'bucky@wisc.edu',
  created_at: '2026-09-09T12:00:00Z',
};

function mockChrome() {
  vi.doMock(src('db/rsvp'), () => ({ listRsvps: vi.fn(async () => []) }));
  vi.doMock(src('db/submission'), () => ({ listSubmissions: vi.fn(async () => []) }));
  vi.doMock(src('db/event'), () => ({ listEvents: vi.fn(async () => []) }));
  vi.doMock(src('db/client'), () => ({ sql: vi.fn() }));
}

describe('GET /admin/interest-forms', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://fake:fake@localhost:5432/fake';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('renders an empty state when there are no interest form submissions', async () => {
    vi.resetModules();
    mockChrome();
    vi.doMock(src('db/interest'), () => ({
      listInterestForms: vi.fn(async () => []),
      deleteInterestForm: vi.fn(async () => {}),
    }));

    const { default: InterestFormsPage } = await import('../../src/pages/admin/interest-forms.astro');
    const container = await AstroContainer.create();
    const html = await container.renderToString(InterestFormsPage);

    expect(html).toContain('Interest Forms');
    expect(html).toContain('No interest form submissions yet.');
  });

  it('renders table rows for existing interest form submissions', async () => {
    vi.resetModules();
    mockChrome();
    vi.doMock(src('db/interest'), () => ({
      listInterestForms: vi.fn(async () => [formRow]),
      deleteInterestForm: vi.fn(async () => {}),
    }));

    const { default: InterestFormsPage } = await import('../../src/pages/admin/interest-forms.astro');
    const container = await AstroContainer.create();
    const html = await container.renderToString(InterestFormsPage);

    expect(html).toContain('Bucky');
    expect(html).toContain('Badger');
    expect(html).toContain('Junior');
    expect(html).toContain('bucky@wisc.edu');
  });
});

describe('DELETE /admin/api/interest-forms/[id]', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://fake:fake@localhost:5432/fake';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('deletes an interest form submission by id', async () => {
    vi.resetModules();
    const deleteInterestForm = vi.fn(async () => {});
    vi.doMock(src('db/interest'), () => ({ deleteInterestForm }));
    vi.doMock(src('db/client'), () => ({ sql: vi.fn() }));

    const { DELETE } = await import('../../src/pages/admin/api/interest-forms/[id].ts');
    const res = await DELETE({ params: { id: '1' } } as never);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(deleteInterestForm).toHaveBeenCalledWith(1);
  });
});
