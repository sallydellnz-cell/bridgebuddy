// Handle offline launches without storing any player or session data.
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.mode !== "navigate" || request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(request).catch(() => new Response(
    '<!doctype html><html lang="en-NZ"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BridgeBuddy · Offline</title><style>body{max-width:30rem;margin:15vh auto;padding:1rem;font:1rem/1.5 system-ui;color:#1e293b;background:#f8fafc}a{color:#3730a3}</style><main><h1>BridgeBuddy is offline</h1><p>Reconnect to open your sessions and messages.</p><a href="">Try again</a></main></html>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  )));
});
