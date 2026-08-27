import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, LogIn, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const wishlist = useQuery(api.wishlist.getWishlist);
  const toggleWishlist = useMutation(api.wishlist.toggleWishlist);
  const addToCart = useMutation(api.cart.addItem);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] skeleton rounded-lg" />
              <div className="h-4 skeleton rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold mb-3">My Wishlist</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to save your favorite items for later.
        </p>
        <Link to="/account">
          <Button variant="rose">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (wishlist === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] skeleton rounded-lg" />
              <div className="h-4 skeleton rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold mb-4">Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Browse our collection and save items you love.
        </p>
        <Link to="/shop">
          <Button variant="rose">Explore Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
          My Wishlist
        </h1>
        <p className="text-muted-foreground mb-8">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        <AnimatePresence>
          {wishlist.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="relative group">
                <Link to={`/product/${item.product?.slug}`}>
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-3">
                    <img
                      src={item.product?.images[0]}
                      alt={item.product?.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>

                <button
                  onClick={() => {
                    toggleWishlist({ productId: item.productId });
                    toast("Removed from wishlist", "success");
                  }}
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <X className="h-4 w-4" />
                </button>

                <Link to={`/product/${item.product?.slug}`}>
                  <h3 className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                    {item.product?.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-semibold">
                    {formatPrice(item.product?.price || 0)}
                  </span>
                  <button
                    onClick={async () => {
                      if (item.product) {
                        await addToCart({
                          productId: item.productId,
                          quantity: 1,
                          selectedSize: item.product.sizes[0] || "M",
                          selectedColor: item.product.colors[0]?.name || "",
                        });
                        toast("Added to cart!", "success");
                      }
                    }}
                    className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    title="Add to cart"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
