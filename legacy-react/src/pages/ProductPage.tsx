import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { formatPrice, cn } from "@/lib/utils";
import { addToRecentlyViewed } from "@/lib/recentlyViewed";
import { motion } from "framer-motion";
import ProductGrid from "@/components/ProductGrid";
import SizeGuideModal from "@/components/SizeGuideModal";
import ImageZoom from "@/components/ImageZoom";
import { useToast } from "@/components/Toast";
import { usePageMeta } from "@/lib/seo";
import {
  Heart,
  ShoppingBag,
  Star,
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  Check,
  Share2,
  Copy,
} from "lucide-react";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const product = useQuery(api.products.getBySlug, slug ? { slug } : "skip");
  const addToCart = useMutation(api.cart.addItem);
  const toggleWishlist = useMutation(api.wishlist.toggleWishlist);
  const isWishlisted = useQuery(
    api.wishlist.isInWishlist,
    product ? { productId: product._id } : "skip"
  );
  const reviews = useQuery(
    api.reviews.getProductReviews,
    product ? { productId: product._id } : "skip"
  );
  const addReview = useMutation(api.reviews.addReview);
  const relatedProducts = useQuery(
    api.products.getRelated,
    product
      ? { productId: product._id, categoryId: product.categoryId, limit: 4 }
      : "skip"
  );
  const { toast } = useToast();
  usePageMeta(
    product
      ? {
          title: `${product.name} | FashionistA`,
          description: product.shortDescription || product.description.slice(0, 155),
          image: product.images[0],
        }
      : undefined
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
      });
    }
  }, [product]);

  if (product === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          <div className="h-96 skeleton rounded-lg" />
          <div className="h-8 skeleton rounded w-1/3" />
          <div className="h-6 skeleton rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-4xl font-bold">This piece is no longer available</h1>
        <p className="mt-3 text-muted-foreground">Explore the latest collection to find something new.</p>
        <Link to="/shop"><Button variant="rose" className="mt-7">Shop the collection</Button></Link>
      </div>
    );
  }

  const isOnSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast("Sign in to add items to your cart", "error");
      navigate("/account");
      return;
    }
    if (!selectedSize) {
      toast("Please select a size", "error");
      return;
    }
    try {
      await addToCart({
        productId: product._id,
        quantity,
        selectedSize,
        selectedColor: selectedColor || product.colors[0]?.name || "",
      });
      setAddedToCart(true);
      toast("Added to cart!", "success");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to add to cart", "error");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReview({
        productId: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      toast("Thank you for sharing your review", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to submit review", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-cream-100 mb-4">
            <ImageZoom
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="aspect-[3/4]"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            {isOnSale && (
              <Badge variant="destructive" className="mb-2">
                Sale
              </Badge>
            )}
            <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(product.averageRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {isOnSale && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider">
                Color: {selectedColor || product.colors[0]?.name}
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all",
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Size {selectedSize && `- ${selectedSize}`}
                </h3>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowSizeGuide(true)}
                  type="button"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "h-11 min-w-[44px] px-4 rounded-md border text-sm font-medium transition-all",
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

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border border-border rounded-md h-11">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-full px-3 hover:bg-accent transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.inventory, quantity + 1))
                }
                className="h-full px-3 hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant="rose"
              size="xl"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!selectedSize || product.inventory === 0}
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added to Cart!
                </>
              ) : product.inventory === 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            {isAuthenticated && (
              <Button
                variant="outline"
                size="xl"
                onClick={() => toggleWishlist({ productId: product._id })}
              >
                <Heart
                  className={cn("h-5 w-5", isWishlisted && "fill-primary text-primary")}
                />
              </Button>
            )}

            <Button
              variant="outline"
              size="xl"
              onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: product.name, url });
                  } catch {
                    // User cancelled share
                  }
                } else {
                  await navigator.clipboard.writeText(url);
                  toast("Link copied to clipboard!", "success");
                }
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Stock info */}
          {product.inventory > 0 && product.inventory <= 10 && (
            <p className="text-sm text-rose-600 font-medium">
              Only {product.inventory} left in stock — order soon!
            </p>
          )}

          {/* Details */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-medium">{product.sku}</span>
            </div>
            {product.materials && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materials</span>
                <span className="font-medium">{product.materials}</span>
              </div>
            )}
            {product.careInstructions && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Care</span>
                <span className="font-medium">{product.careInstructions}</span>
              </div>
            )}
          </div>

          {/* Size Guide Modal */}
          <SizeGuideModal
            open={showSizeGuide}
            onClose={() => setShowSizeGuide(false)}
            category={product.tags.includes("shoes") || product.tags.includes("heels") ? "shoes" : undefined}
          />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { icon: Truck, text: "Free Shipping" },
              { icon: RotateCcw, text: "Easy Returns" },
              { icon: Shield, text: "Secure Checkout" },
            ].map((item) => (
              <div key={item.text} className="text-center">
                <item.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <span className="text-xs text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16 lg:mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl lg:text-3xl font-bold">
            Customer Reviews
          </h2>
          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Write a Review
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmitReview}
            className="bg-card rounded-xl p-6 border border-border mb-8 space-y-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        star <= reviewForm.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Input
              placeholder="Review title"
              value={reviewForm.title}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, comment: e.target.value }))
              }
              className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" variant="rose">
                Submit Review
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}

        {/* Reviews List */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <h4 className="font-semibold">{review.title}</h4>
                  </div>
                  {review.verified && (
                    <Badge variant="cream" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  {review.comment}
                </p>
                <p className="text-xs text-muted-foreground">
                  By {review.userName}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <h2 className="font-serif text-2xl lg:text-3xl font-bold mb-8">
            You May Also Like
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
