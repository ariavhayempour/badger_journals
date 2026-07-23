import { clerkMiddleware } from '@clerk/astro/server';
import { adminRedirect } from './lib/admin-guard';

// Clerk sets up the request auth context; the pure guard decides the /admin gate. See docs/claude/0011-admin-auth.md
export const onRequest = clerkMiddleware((auth, context) => {
  const target = adminRedirect(context.url.pathname, auth().userId !== null);
  if (target) return context.redirect(target);
});
