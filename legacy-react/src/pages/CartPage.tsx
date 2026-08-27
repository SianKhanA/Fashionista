import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { isAuthenticated } = useConvexAuth();
  const cartItems = useQuery(api.cart.getCart);
  const updateQuantity = useMutation(api.cart.updateQuantity);
  const removeItem = useMutation(api.cart.removeItem);
  const { toast } = useToast();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to view your shopping cart and start adding items.
        </p>
        <Link to="/account">
          <Button variant="rose" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (cartItems === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border border-border rounded-lg">
              <div className="w-24 h-32 skeleton rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="h-5 skeleton rounded w-1/3" />
                <div className="h-4 skeleton rounded w-1/4" />
                <div className="h-4 skeleton rounded w-1/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything yet. Explore our collections to find
          something you love.
        </p>
        <Link to="/shop">
          <Button variant="rose" size="lg">
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce<number>(
    (sum: number, item: (typeof cartItems)[number]) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal >= 15000 ? 0 : 995;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
          Shopping Cart
        </h1>
        <p className="text-muted-foreground mb-8">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item: (typeof cartItems)[number]) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product?.slug}`}
                  className="shrink-0 w-24 h-32 sm:w-32 sm:h-40 rounded-lg overflow-hidden bg-cream-100"
                >                    <img
                      src={item.product?.images[0]}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${item.product?.slug}`}
                      className="font-semibold hover:text-primary transition-colors truncate"
                    >
                      {item.product?.name}
                    </Link>
                    <button
                      onClick={() => {
                        removeItem({ cartItemId: item._id });
                        toast("Item removed from cart", "success");
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    Size: {item.selectedSize}
                    {item.selectedColor && ` | Color: ${item.selectedColor}`}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border rounded-md h-9">
                      <button
                        onClick={() =>
                          updateQuantity({
                            cartItemId: item._id,
                            quantity: item.quantity - 1,
                          })
                        }
                        className="h-full px-2.5 hover:bg-accent transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity({
                            cartItemId: item._id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="h-full px-2.5 hover:bg-accent transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="font-semibold">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            to="/shop"
            className="inline-flex items-center text-sm text-primary hover:underline mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free shipping on orders over $150. Add {formatPrice(15000 - subtotal)} more.
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-base font-semibold mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Link to="/checkout" className="block">
              <Button variant="rose" size="lg" className="w-full">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* Payment icons */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded">Visa</span>
              <span className="px-2 py-1 bg-secondary rounded">Mastercard</span>
              <span className="px-2 py-1 bg-secondary rounded">Amex</span>
              <span className="px-2 py-1 bg-secondary rounded">Apple Pay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
