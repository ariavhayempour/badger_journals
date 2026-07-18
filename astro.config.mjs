import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// SSR on Vercel serverless — server output enables per-request rendering.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
});
