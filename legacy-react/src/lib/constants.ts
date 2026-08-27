export const CATEGORIES = [
  { id: "dresses", name: "Dresses", icon: "👗" },
  { id: "tops", name: "Tops & Blouses", icon: "👚" },
  { id: "bottoms", name: "Bottoms", icon: "👖" },
  { id: "outerwear", name: "Outerwear", icon: "🧥" },
  { id: "accessories", name: "Accessories", icon: "👜" },
  { id: "shoes", name: "Shoes", icon: "👠" },
  { id: "jewelry", name: "Jewelry", icon: "💎" },
  { id: "activewear", name: "Activewear", icon: "🏃‍♀️" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating", label: "Highest Rated" },
] as const;

export const PRODUCTS_PER_PAGE = 12;

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Collections" },
  { href: "/about", label: "About" },
] as const;

export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut" },
};
