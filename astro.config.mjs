import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import clerk from '@clerk/astro';

// SSR on Vercel serverless — server output enables per-request rendering.
export default defineConfig({
  // `site` gives SEO components an absolute base for canonical + Open Graph URLs.
  site: 'https://www.badgerjournals.org',
  output: 'server',
  // Clerk provides hosted admin auth; sign-out returns to the admin gate.
  integrations: [clerk({ afterSignOutUrl: '/admin/login' })],
  adapter: vercel(),
});
