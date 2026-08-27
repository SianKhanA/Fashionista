const STORAGE_KEY = "fashionista_recently_viewed";
const MAX_ITEMS = 8;

export interface RecentProduct {
  slug: string;
  name: string;
  price: number;
  image: string;
  timestamp: number;
}

export function getRecentlyViewed(): RecentProduct[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(product: Omit<RecentProduct, "timestamp">): void {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((p) => p.slug !== product.slug);
    const updated = [
      { ...product, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage not available
  }
}
