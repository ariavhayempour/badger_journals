import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// SSR on Vercel serverless — server output enables per-request rendering.
export default defineConfig({
  // `site` gives SEO components an absolute base for canonical + Open Graph URLs.
  site: 'https://badger-journals.vercel.app',
  output: 'server',
  adapter: vercel(),
});
