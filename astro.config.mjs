import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import clerk from '@clerk/astro';

// SSR on Vercel serverless — server output enables per-request rendering.
export default defineConfig({
  // `site` gives SEO components an absolute base for canonical + Open Graph URLs.
  site: 'https://badger-journals.vercel.app',
  output: 'server',
  // Clerk provides hosted admin auth (SSR-only, adapter unchanged); sign-out returns to the admin gate.
  integrations: [clerk({ afterSignOutUrl: '/admin/login' })],
  adapter: vercel(),
});
