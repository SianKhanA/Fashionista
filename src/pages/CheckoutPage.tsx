import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";
import {
  CreditCard,
  Lock,
  CheckCircle,
  ChevronLeft,
  Truck,
  Tag,
  X,
} from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const cartItems = useQuery(api.cart.getCart);
  const user = useQuery(api.users.getCurrentUser);
  const createOrder = useMutation(api.orders.createOrder);
  const { toast } = useToast();

  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping");
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  const hasAutoFilledRef = useRef(false);

  // Pre-fill shipping from user profile on first load
  useEffect(() => {
    if (user?.address && !hasAutoFilledRef.current && !shipping.street) {
      hasAutoFilledRef.current = true;
      setShipping(user.address);
    }
  }, [user, shipping.street]);

  if (!isAuthenticated) {
    navigate("/account");
    return null;
  }

  if (cartItems === undefined || cartItems.length === 0) {
    if (orderComplete) {
      return (
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="font-serif text-3xl font-bold mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            You'll receive a confirmation email with order details and tracking information.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/orders">
              <Button variant="rose">View My Orders</Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-6">Your cart is empty.</p>
        <Link to="/shop">
          <Button variant="rose">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shippingCost = subtotal >= 15000 ? 0 : 995;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discount = Math.round(subtotal * (appliedCoupon.discount / 100));
    } else {
      discount = Math.min(appliedCoupon.discount, subtotal);
    }
  }
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Demo coupon codes
    if (code === "FREESHIP") {
      setAppliedCoupon({ code, discount: 995, type: "fixed" });
      toast("Free shipping applied!", "success");
    } else if (code === "SUMMER15") {
      setAppliedCoupon({ code, discount: 15, type: "percentage" });
      toast("15% discount applied!", "success");
    } else if (code === "WELCOME10") {
      setAppliedCoupon({ code, discount: 10, type: "percentage" });
      toast("10% welcome discount applied!", "success");
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      await createOrder({
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.product?.name || "Unknown",
          price: item.product?.price || 0,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          imageUrl: item.product?.images[0],
        })),
        total,
        shippingAddress: shipping,
        paymentMethod,
      });
      setOrderComplete(true);
      toast("Order placed successfully!", "success");
    } catch (error) {
      toast("Failed to place order. Please try again.", "error");
      console.error("Failed to place order:", error);
    } finally {
      setIsPlacing(false);
    }
  };

  const isShippingValid =
    shipping.street && shipping.city && shipping.state && shipping.zip;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link
        to="/cart"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>

      <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { key: "shipping", label: "Shipping" },
          { key: "payment", label: "Payment" },
          { key: "confirm", label: "Review" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                step === s.key
                  ? "bg-primary text-primary-foreground"
                  : ["shipping", "payment", "confirm"].indexOf(step) > i
                  ? "bg-green-500 text-white"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {["shipping", "payment", "confirm"].indexOf(step) > i ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium hidden sm:block",
                step === s.key ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {i < 2 && <div className="w-8 sm:w-16 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Shipping Step */}
          {step === "shipping" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="Street address"
                  value={shipping.street}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, street: e.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, city: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="State"
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, state: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="ZIP Code"
                    value={shipping.zip}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, zip: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Country"
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, country: e.target.value }))
                    }
                  />
                </div>
              </div>
              <Button
                variant="rose"
                className="mt-6"
                onClick={() => setStep("payment")}
                disabled={!isShippingValid}
              >
                Continue to Payment
              </Button>
            </motion.div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
                  { id: "apple_pay", label: "Apple Pay", desc: "Fast and secure" },
                  { id: "paypal", label: "PayPal", desc: "Pay with your PayPal account" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4 p-4 bg-secondary/30 rounded-lg">
                  <Input placeholder="Card number" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM / YY" />
                    <Input placeholder="CVC" />
                  </div>
                  <Input placeholder="Name on card" />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("shipping")}>
                  Back
                </Button>
                <Button variant="rose" onClick={() => setStep("confirm")}>
                  Review Order
                </Button>
              </div>
            </motion.div>
          )}

          {/* Confirm Step */}
          {step === "confirm" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <h2 className="font-serif text-xl font-semibold mb-6">
                Review Your Order
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="text-sm font-semibold mb-1">Shipping Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {shipping.street}, {shipping.city}, {shipping.state} {shipping.zip},{" "}
                    {shipping.country}
                  </p>
                </div>

                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="text-sm font-semibold mb-1">Payment Method</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {paymentMethod.replace("_", " ")}
                  </p>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-14 h-18 rounded-md overflow-hidden bg-cream-100 shrink-0">
                        <img
                          src={item.product?.images[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedSize} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("payment")}>
                  Back
                </Button>
                <Button
                  variant="rose"
                  size="lg"
                  className="flex-1"
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isPlacing ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-serif text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm max-h-60 overflow-auto">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="mt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim()}
                >
                  Apply
                </Button>
              </div>
              {couponError && (
                <p className="text-xs text-destructive mt-1.5">{couponError}</p>
              )}
              {appliedCoupon && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    {appliedCoupon.code}
                    {appliedCoupon.type === "percentage"
                      ? ` (${appliedCoupon.discount}% off)`
                      : ` (${formatPrice(appliedCoupon.discount)} off)`}
                    <button onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}
            </div>

            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secure 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
