const SITES_BACKEND = "https://fashionista-bangladesh.mahdiarahman45.chatgpt.site";

export function usesVercelBridge() {
  return process.env.VERCEL === "1";
}

export async function proxyToSites(request: Request, path: string) {
  const contentType = request.headers.get("content-type");
  const response = await fetch(`${SITES_BACKEND}${path}`, {
    method: request.method,
    headers: contentType ? { "content-type": contentType } : undefined,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  });
  return new Response(response.body, { status: response.status, headers: response.headers });
}
