import type { Middleware } from 'koa';

export function allowedOrigins(): Set<string> {
  return new Set((process.env.ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean));
}

export function isAllowedOrigin(origin: string, ownOrigin: string): boolean {
  return origin === ownOrigin || allowedOrigins().has(origin);
}

// Check actual requests too: HTML forms can bypass a CORS preflight.
export const browserAccess: Middleware = async (ctx, next) => {
  const origin = ctx.get('Origin');
  ctx.vary('Origin');
  if (origin) {
    if (!isAllowedOrigin(origin, ctx.origin)) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden origin' };
      return;
    }
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Access-Control-Allow-Credentials', 'true');
    if (ctx.method === 'OPTIONS') {
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type');
      ctx.status = 204;
      return;
    }
  }
  await next();
};
