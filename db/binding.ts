// Next.js forwards persistence requests to the Worker. Sites aliases this module.
export function getBinding(): D1Database {
  throw new Error("Configure SITES_BACKEND_URL or run the Sites development target.");
}
