import Fastify, { type FastifyInstance } from 'fastify';

/** Minimaler API-Stub (Phase 1). Fachliche Endpunkte folgen in Phase 3/4. */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  app.get('/api/health', async () => ({ status: 'ok' }));
  return app;
}
