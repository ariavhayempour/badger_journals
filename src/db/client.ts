import { neon } from '@neondatabase/serverless';

// Single construction point so a missing secret fails loudly at first use, not mid-query.
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export const sql = neon(url);
