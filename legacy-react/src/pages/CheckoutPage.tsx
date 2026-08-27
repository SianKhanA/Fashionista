import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { CheckCircle, ChevronLeft, CreditCard, Lock, Tag, Truck, WalletCards, X } from "lucide-react";

type CheckoutStep = "shipping" | "payment" | "confirm";
type PaymentMethod = "stripe" | "cash_on_delivery";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const cartItems = useQuery(api.cart.getCart);
  const user = useQuery(api.users.getCurrentUser);
  const createCodOrder = useMutation(api.orders.createCashOnDeliveryOrder);
  const createStripeCheckout = useAction(api.payments.createCheckoutSession);
  const { toast } = useToast();

  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [shipping, setShipping] = useState({ street: "", city: "", state: "", zip: "", country: "US" });
  const hasAutoFilled = useRef(false);

  const quote = useQuery(api.orders.getCheckoutQuote, isAuthenticated ? { couponCode } : "skip");
  const validQuote = quote?.valid ? quote : null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/account", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.address && !hasAutoFilled.current) {
      hasAutoFilled.current = true;
      setShipping(user.address);
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      toast("Payment was cancelled. Your reserved items will be released shortly.", "error");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  const shippingIsValid = useMemo(
    () => Object.values(shipping).every((value) => value.trim().length >= 2 && value.trim().length <= 120),
    [shipping]
  );

  const applyCoupon = () => {
    const normalized = couponInput.trim().toUpperCase();
    if (normalized) setCouponCode(normalized);
  };

  const handlePlaceOrder = async () => {
    if (!shippingIsValid || !validQuote) return;
    setIsPlacing(true);
    try {
      if (paymentMethod === "stripe") {
        const result = await createStripeCheckout({ shippingAddress: shipping, couponCode });
        window.location.assign(result.url);
        return;
      }
      await createCodOrder({ shippingAddress: shipping, couponCode });
      setOrderComplete(true);
      toast("Order placed successfully", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to place this order", "error");
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading || !isAuthenticated) return <CheckoutSkeleton />;

  if (cartItems === undefined || quote === undefined) return <CheckoutSkeleton />;

  if (orderComplete || cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        {orderComplete ? (
          <>
            <CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-600" />
            <h1 className="font-serif text-3xl font-bold">Order confirmed</h1>
            <p className="mt-3 text-muted-foreground">We’ll email your receipt and send tracking details as soon as your order leaves our studio.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/orders"><Button variant="rose">View orders</Button></Link>
              <Link to="/shop"><Button variant="outline">Continue shopping</Button></Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold">Your cart is empty</h1>
            <p className="mt-3 text-muted-foreground">Add something beautiful before continuing to checkout.</p>
            <Link to="/shop"><Button variant="rose" className="mt-6">Explore the collection</Button></Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link to="/cart" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to cart
      </Link>
      <h1 className="font-serif text-3xl font-bold lg:text-4xl">Secure checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your totals, inventory, and discounts are verified securely before the order is created.</p>

      <div className="my-9 flex items-center gap-2 sm:gap-4">
        {(["shipping", "payment", "confirm"] as CheckoutStep[]).map((key, index) => {
          const labels = { shipping: "Shipping", payment: "Payment", confirm: "Review" };
          const currentIndex = ["shipping", "payment", "confirm"].indexOf(step);
          const complete = currentIndex > index;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold", step === key ? "bg-primary text-primary-foreground" : complete ? "bg-green-600 text-white" : "bg-secondary text-secondary-foreground")}>
                {complete ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              <span className="hidden text-sm font-medium sm:block">{labels[key]}</span>
              {index < 2 && <div className="h-px w-7 bg-border sm:w-16" />}
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border bg-card p-5 sm:p-7">
          {step === "shipping" && (
            <>
              <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Truck className="h-5 w-5" /> Delivery address</h2>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium">Street address<Input autoComplete="street-address" className="mt-1.5" value={shipping.street} onChange={(e) => setShipping((value) => ({ ...value, street: e.target.value }))} /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">City<Input autoComplete="address-level2" className="mt-1.5" value={shipping.city} onChange={(e) => setShipping((value) => ({ ...value, city: e.target.value }))} /></label>
                  <label className="block text-sm font-medium">State / region<Input autoComplete="address-level1" className="mt-1.5" value={shipping.state} onChange={(e) => setShipping((value) => ({ ...value, state: e.target.value }))} /></label>
                  <label className="block text-sm font-medium">Postal code<Input autoComplete="postal-code" className="mt-1.5" value={shipping.zip} onChange={(e) => setShipping((value) => ({ ...value, zip: e.target.value }))} /></label>
                  <label className="block text-sm font-medium">Country<Input autoComplete="country-name" className="mt-1.5" value={shipping.country} onChange={(e) => setShipping((value) => ({ ...value, country: e.target.value }))} /></label>
                </div>
              </div>
              <Button variant="rose" className="mt-7" disabled={!shippingIsValid} onClick={() => setStep("payment")}>Continue to payment</Button>
            </>
          )}

          {step === "payment" && (
            <>
              <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><WalletCards className="h-5 w-5" /> Payment</h2>
              <p className="mt-2 text-sm text-muted-foreground">Card details are entered only on Stripe’s encrypted checkout. FashionistA never stores them.</p>
              <div className="mt-6 space-y-3">
                <PaymentChoice active={paymentMethod === "stripe"} onSelect={() => setPaymentMethod("stripe")} icon={<CreditCard className="h-5 w-5" />} title="Card or digital wallet" description="Secure checkout powered by Stripe; Apple Pay or Google Pay appears when available." />
                <PaymentChoice active={paymentMethod === "cash_on_delivery"} onSelect={() => setPaymentMethod("cash_on_delivery")} icon={<Truck className="h-5 w-5" />} title="Cash on delivery" description="Pay when your order arrives. Availability may depend on your delivery area." />
              </div>
              <div className="mt-7 flex gap-3"><Button variant="outline" onClick={() => setStep("shipping")}>Back</Button><Button variant="rose" onClick={() => setStep("confirm")}>Review order</Button></div>
            </>
          )}

          {step === "confirm" && (
            <>
              <h2 className="font-serif text-2xl font-semibold">Review your order</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-secondary/40 p-4"><p className="text-sm font-semibold">Shipping to</p><p className="mt-1 text-sm text-muted-foreground">{shipping.street}, {shipping.city}, {shipping.state} {shipping.zip}, {shipping.country}</p></div>
                <div className="rounded-lg bg-secondary/40 p-4"><p className="text-sm font-semibold">Payment</p><p className="mt-1 text-sm text-muted-foreground">{paymentMethod === "stripe" ? "Card or digital wallet via Stripe" : "Cash on delivery"}</p></div>
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.product?.images[0]} alt="" className="h-20 w-16 rounded-md bg-cream-100 object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.product?.name}</p><p className="text-xs text-muted-foreground">{item.selectedColor} · {item.selectedSize} · Qty {item.quantity}</p></div>
                    <span className="text-sm font-semibold">{formatPrice((item.product?.price ?? 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex gap-3"><Button variant="outline" onClick={() => setStep("payment")}>Back</Button><Button variant="rose" size="lg" className="flex-1" disabled={isPlacing || !validQuote} onClick={handlePlaceOrder}><Lock className="mr-2 h-4 w-4" />{isPlacing ? "Securing your order…" : paymentMethod === "stripe" ? `Pay ${validQuote ? formatPrice(validQuote.total) : ""}` : `Place order · ${validQuote ? formatPrice(validQuote.total) : ""}`}</Button></div>
            </>
          )}
        </section>

        <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-xl font-semibold">Order summary</h2>
          <div className="mt-4 max-h-56 space-y-3 overflow-auto text-sm">
            {cartItems.map((item) => <div key={item._id} className="flex justify-between gap-3"><span className="truncate text-muted-foreground">{item.product?.name} × {item.quantity}</span><span>{formatPrice((item.product?.price ?? 0) * item.quantity)}</span></div>)}
          </div>
          <div className="mt-5 flex gap-2"><div className="relative flex-1"><Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Coupon code" className="pl-9" placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} /></div><Button variant="outline" onClick={applyCoupon} disabled={!couponInput.trim()}>Apply</Button></div>
          {couponCode && quote?.valid && <Badge variant="secondary" className="mt-3 gap-1">{couponCode}<button aria-label="Remove coupon" onClick={() => { setCouponCode(undefined); setCouponInput(""); }}><X className="h-3 w-3" /></button></Badge>}
          {couponCode && quote && !quote.valid && <p role="alert" className="mt-2 text-xs text-destructive">{quote.error}</p>}
          <Separator className="my-5" />
          {validQuote ? <div className="space-y-2 text-sm"><SummaryLine label="Subtotal" value={formatPrice(validQuote.subtotal)} /><SummaryLine label="Shipping" value={validQuote.shippingCost ? formatPrice(validQuote.shippingCost) : "Free"} />{validQuote.discount > 0 && <SummaryLine label="Discount" value={`−${formatPrice(validQuote.discount)}`} accent />}<Separator className="my-3" /><div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatPrice(validQuote.total)}</span></div></div> : <p className="text-sm text-destructive">{quote && !quote.valid ? quote.error : "Calculating your total…"}</p>}
          <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Payments are encrypted and totals are recalculated on the server.</span></div>
        </aside>
      </div>
    </div>
  );
}

function PaymentChoice({ active, onSelect, icon, title, description }: { active: boolean; onSelect: () => void; icon: React.ReactNode; title: string; description: string }) {
  return <button type="button" onClick={onSelect} className={cn("flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors", active ? "border-primary bg-primary/5" : "hover:border-primary/40")}><span className="mt-0.5 text-primary">{icon}</span><span className="flex-1"><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span><span className={cn("mt-1 h-4 w-4 rounded-full border-4", active ? "border-primary" : "border-muted-foreground/40")} /></button>;
}

function SummaryLine({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={cn("flex justify-between", accent && "text-green-700")}><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}

function CheckoutSkeleton() {
  return <div className="mx-auto max-w-5xl px-4 py-12"><div className="h-10 w-56 rounded skeleton" /><div className="mt-10 grid gap-8 lg:grid-cols-3"><div className="h-96 rounded-2xl skeleton lg:col-span-2" /><div className="h-80 rounded-2xl skeleton" /></div></div>;
}
