export function siteUrl() {
  const configured = process.env.PUBLIC_SITE_URL;
  if (!configured) {
    if (process.env.NODE_ENV === "production") throw new Error("PUBLIC_SITE_URL must be configured for production.");
    return "http://localhost:3000";
  }
  const url = new URL(configured);
  if ((url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("PUBLIC_SITE_URL must be an HTTPS origin without a path.");
  }
  return url.origin;
}
