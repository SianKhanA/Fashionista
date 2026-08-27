export function siteUrl() {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return (process.env.PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "https://fashionista-bd.vercel.app")).replace(/\/$/, "");
}
