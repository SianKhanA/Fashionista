import ProductCard from "./ProductCard";
import type { Doc } from "../convex/_generated/dataModel";

interface ProductGridProps {
  products: (Doc<"products"> & { category?: Doc<"categories"> })[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No products found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[3/4] rounded-lg skeleton" />
          <div className="space-y-2">
            <div className="h-4 skeleton rounded w-3/4" />
            <div className="h-4 skeleton rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
