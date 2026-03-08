interface Env {
  ASSETS: Fetcher;
  BUILD_VERSION: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/__version') {
      const version = await env.BUILD_VERSION.get('current');
      return new Response(version ?? '', {
        headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
