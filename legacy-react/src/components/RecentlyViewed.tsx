import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRecentlyViewed, type RecentProduct } from "@/lib/recentlyViewed";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function RecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    setProducts(getRecentlyViewed());
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-serif text-xl font-bold">Recently Viewed</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {products.map((product) => (
            <Link
              key={product.slug}
              to={`/product/${product.slug}`}
              className="shrink-0 w-40 group"
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs font-semibold mt-0.5">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
