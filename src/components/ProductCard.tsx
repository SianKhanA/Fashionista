import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import ProductQuickView from "./ProductQuickView";
import { useToast } from "@/components/Toast";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Doc } from "../convex/_generated/dataModel";

interface ProductCardProps {
  product: Doc<"products"> & { category?: Doc<"categories"> };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isAuthenticated } = useConvexAuth();
  const toggleWishlist = useMutation(api.wishlist.toggleWishlist);
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = isOnSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-100 mb-3">
          {/* Image */}
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOnSale && (
              <Badge variant="destructive" className="text-xs">
                -{discount}%
              </Badge>
            )}
            {product.featured && (
              <Badge variant="rose" className="text-xs">
                Featured
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="flex-1 bg-background/95 backdrop-blur-sm rounded-md py-2 px-3 text-center text-xs font-medium tracking-wide uppercase hover:bg-background transition-colors"
            >
              Quick View
            </button>
          </div>

          {/* Wishlist button */}
          {isAuthenticated && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const result = await toggleWishlist({ productId: product._id });
                toast(result ? "Added to wishlist" : "Removed from wishlist", "success");
              }}
              className="absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick View Modal */}
        <ProductQuickView
          product={product}
          open={showQuickView}
          onClose={() => setShowQuickView(false)}
        />

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
          {/* Colors */}
          <div className="flex gap-1 pt-1">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color.name}
                className="h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
