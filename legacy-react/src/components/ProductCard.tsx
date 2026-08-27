import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import ProductQuickView from "./ProductQuickView";
import { useToast } from "@/components/Toast";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Doc<"products"> & { category?: Doc<"categories"> };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const toggleWishlist = useMutation(api.wishlist.toggleWishlist);
  const { toast } = useToast();
  const [showQuickView, setShowQuickView] = useState(false);
  const isOnSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discount = isOnSale ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0;

  const updateWishlist = async () => {
    if (!isAuthenticated) {
      toast("Sign in to save pieces to your wishlist", "error");
      navigate("/account");
      return;
    }
    try {
      const added = await toggleWishlist({ productId: product._id });
      toast(added ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to update your wishlist", "error");
    }
  };

  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.035 }} className="group">
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-cream-100">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block h-full">
          {product.images[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>}
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isOnSale && <Badge variant="destructive" className="text-xs">−{discount}%</Badge>}
          {product.featured && <Badge variant="rose" className="text-xs">Featured</Badge>}
        </div>
        <button type="button" onClick={updateWishlist} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-background" aria-label="Add to wishlist"><Heart className="h-4 w-4" /></button>
        <button type="button" onClick={() => setShowQuickView(true)} className="absolute bottom-3 left-3 right-3 rounded-md bg-background/95 px-3 py-2 text-center text-xs font-medium uppercase tracking-wide opacity-100 backdrop-blur-sm transition-all hover:bg-background md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus:translate-y-0 md:focus:opacity-100">Quick view</button>
      </div>
      <Link to={`/product/${product.slug}`} className="block space-y-1">
        <h3 className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">{product.name}</h3>
        <div className="flex items-center gap-2"><span className="text-sm font-semibold">{formatPrice(product.price)}</span>{isOnSale && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice!)}</span>}</div>
        <div className="flex gap-1 pt-1" aria-label={`${product.colors.length} colors available`}>{product.colors.slice(0, 4).map((color) => <span key={color.name} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: color.hex }} title={color.name} />)}</div>
      </Link>
      <ProductQuickView product={product} open={showQuickView} onClose={() => setShowQuickView(false)} />
    </motion.article>
  );
}
