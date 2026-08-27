import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "./Toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Heart, Star, Eye } from "lucide-react";
import type { Doc } from "../convex/_generated/dataModel";

interface ProductQuickViewProps {
  product: Doc<"products">;
  open: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  const { isAuthenticated } = useConvexAuth();
  const addToCart = useMutation(api.cart.addItem);
  const toggleWishlist = useMutation(api.wishlist.toggleWishlist);
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
  const [isAdding, setIsAdding] = useState(false);

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast("Please select a size", "error");
      return;
    }
    setIsAdding(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        selectedSize,
        selectedColor: selectedColor || product.colors[0]?.name || "",
      });
      toast("Added to cart!", "success");
      onClose();
    } catch {
      toast("Failed to add to cart", "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[85vh] bg-card rounded-xl border border-border shadow-xl z-[81] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-lg font-semibold">Quick View</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-cream-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    {isOnSale && (
                      <Badge variant="destructive" className="mb-2">Sale</Badge>
                    )}
                    <h3 className="font-serif text-2xl font-bold mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < Math.round(product.averageRating)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {formatPrice(product.price)}
                      </span>
                      {isOnSale && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice!)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.shortDescription || product.description}
                  </p>

                  {/* Colors */}
                  {product.colors.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider">
                        Color: {selectedColor || product.colors[0]?.name}
                      </p>
                      <div className="flex gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-all",
                              (selectedColor || product.colors[0]?.name) === color.name
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            )}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wider">
                        Size {selectedSize && `- ${selectedSize}`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium transition-all",
                              selectedSize === size
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="rose"
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={!selectedSize || product.inventory === 0 || isAdding}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </Button>
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        onClick={() => toggleWishlist({ productId: product._id })}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="block text-center text-sm text-primary hover:underline"
                  >
                    View full details →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
