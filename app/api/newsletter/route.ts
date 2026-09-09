import { database } from "@/db/runtime";
import { clean, errorResponse, json, readJson, RequestError } from "@/lib/http";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
export async function POST(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/newsletter");
  try {
    const body = await readJson(request), email = clean(body.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError("Enter a valid email address.");
    await database().prepare("INSERT OR IGNORE INTO newsletter (email,created_at) VALUES (?,?)").bind(email,new Date().toISOString()).run();
    return json({ message: "Welcome to the FashionistA list." });
  } catch (error) { return errorResponse(error); }
}
