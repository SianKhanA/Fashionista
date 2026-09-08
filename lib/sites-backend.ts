import { errorResponse } from "./http";
export function usesVercelBridge() {
  return process.env.VERCEL === "1" || process.env.STORE_RUNTIME === "proxy";
}
export async function proxyToSites(request: Request, path: string) {
  try {
    const configured = process.env.SITES_BACKEND_URL;
    if (!configured) throw new Error("Missing backend URL");
    const backend = new URL(configured);
    if (backend.protocol !== "https:" || backend.username || backend.password || backend.pathname !== "/" || backend.search || backend.hash) throw new Error("Invalid backend origin");
    if (backend.origin === new URL(request.url).origin) throw new Error("Backend proxy loop");
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
    if (body && body.byteLength > 32_768) return Response.json({ error: "Request is too large." }, { status: 413 });
    const response = await fetch(new URL(path, backend), {
      method: request.method, headers, body, redirect: "manual", signal: AbortSignal.timeout(25_000),
    });
    const outgoing = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "location", "retry-after"]) {
      const value = response.headers.get(name);
      if (value) outgoing.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers: outgoing });
  } catch (error) { return errorResponse(error); }
}
