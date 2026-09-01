export function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, chunk) => {
      const idx = chunk.indexOf("=");
      if (idx === -1) return acc;
      const key = chunk.slice(0, idx).trim();
      const value = chunk.slice(idx + 1).trim();
      if (key) acc[key] = value;
      return acc;
    }, {});
}

export function withAppRoute(handler) {
  return async function appRoute(request) {
    const url = new URL(request.url);
    const method = request.method || "GET";
    const query = Object.fromEntries(url.searchParams.entries());
    const cookieHeader = request.headers.get("cookie") || "";
    const body = method === "GET" || method === "HEAD"
      ? {}
      : await readRequestBody(request);

    const req = {
      method,
      url,
      query,
      body,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: parseCookies(cookieHeader),
    };

    const res = {
      _status: 200,
      _headers: new Headers(),
      status(code) {
        this._status = code;
        return this;
      },
      setHeader(name, value) {
        this._headers.set(name, String(value));
        return this;
      },
      end(payload) {
        return new Response(payload ?? null, {
          status: this._status,
          headers: this._headers,
        });
      },
      json(payload) {
        return Response.json(payload, {
          status: this._status,
          headers: this._headers,
        });
      },
    };

    const result = await handler(req, res);
    return result instanceof Response ? result : (result ?? new Response(null, { status: res._status, headers: res._headers }));
  };
}

async function readRequestBody(request) {
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await request.clone().json();
    }

    if (contentType.includes("text/")) {
      return await request.clone().text();
    }

    const text = await request.clone().text();
    if (!text) return {};
    return text;
  } catch {
    return {};
  }
}
