interface Env {
  ASSETS: Fetcher;
  BUILD_VERSION: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/__version') {
      const raw = await env.BUILD_VERSION.get('current');
      if (!raw) {
        return new Response('{}', {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }
      // Try to parse as JSON (new format), fall back to legacy build ID string
      try {
        JSON.parse(raw);
        return new Response(raw, {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      } catch {
        // Legacy format: raw build ID string
        return new Response(JSON.stringify({ buildId: raw, version: '', changelog: '' }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
