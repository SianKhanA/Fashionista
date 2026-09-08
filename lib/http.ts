export class RequestError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function errorResponse(error: unknown) {
  if (error instanceof RequestError) return json({ error: error.message }, error.status);
  console.error("Store request failed", error instanceof Error ? error.name : "UnknownError");
  return json({ error: "The store is temporarily unavailable. Your bag is saved. Please try again." }, 503);
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RequestError("Invalid request.");
  return value as Record<string, unknown>;
}
export function clean(value: unknown, max = 200) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
export function normalizePhone(value: unknown) {
  return clean(value, 30).replace(/[\s-]/g, "").replace(/^(?:\+88|88)/, "");
}
export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new RequestError("Expected a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Missing request body.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 32_768) { await reader.cancel(); throw new RequestError("Request is too large.", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return record(JSON.parse(new TextDecoder().decode(bytes))); }
  catch { throw new RequestError("Invalid JSON request."); }
}
