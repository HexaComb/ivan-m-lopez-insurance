/** Only the approved static podcast: provide real byte ranges for native seeking. */
export function parseRange(value, size) {
  if (!value || !value.startsWith('bytes=') || value.includes(',')) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return false;
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return false;
    start = Math.max(0, size - suffix); end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) return false;
    end = Math.min(end, size - 1);
  }
  return { start, end };
}
export async function onRequest(context) {
  const { request } = context;
  if (!['GET', 'HEAD'].includes(request.method)) return context.next();
  // ASSETS serves only static files and does not re-enter Pages Functions.
  const headers = new Headers(request.headers);
  headers.delete('Range');
  headers.delete('If-Range');
  const asset = await context.env.ASSETS.fetch(new Request(request.url, { method: 'GET', headers }));
  if (asset.status !== 200) return asset;
  const output = new Headers(asset.headers);
  output.set('Accept-Ranges', 'bytes');
  output.set('Content-Type', 'audio/mpeg');
  output.set('X-Content-Type-Options', 'nosniff');
  output.set('X-Robots-Tag', 'noindex, nofollow');
  // Buffer the one small, fixed asset (9.7 MB), never arbitrary visitor uploads.
  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  output.set('Content-Length', String(size));
  output.delete('Content-Encoding');
  output.delete('Content-Range');
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers: output });
  const ifRange = request.headers.get('If-Range');
  const validatorMatches = !ifRange || ifRange === output.get('ETag') || ifRange === output.get('Last-Modified');
  const range = validatorMatches ? parseRange(request.headers.get('Range'), size) : null;
  if (range === false) {
    output.set('Content-Range', `bytes */${size}`);
    output.set('Content-Length', '0');
    return new Response(null, { status: 416, headers: output });
  }
  if (range) {
    output.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
    output.set('Content-Length', String(range.end - range.start + 1));
    return new Response(body.slice(range.start, range.end + 1), { status: 206, headers: output });
  }
  return new Response(body, { status: 200, headers: output });
}
