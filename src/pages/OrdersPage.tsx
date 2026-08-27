import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Package, ChevronRight, LogIn } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const orders = useQuery(api.orders.getUserOrders);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold mb-3">My Orders</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to view your order history and track shipments.
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

  if (orders === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-muted-foreground mb-6">
          When you place an order, it will appear here.
        </p>
        <Link to="/shop">
          <Button variant="rose">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
          My Orders
        </h1>
        <p className="text-muted-foreground mb-8">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>
      </motion.div>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 lg:p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order._creationTime).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge
                className={cn(
                  "text-xs capitalize",
                  statusColors[order.status] || "bg-gray-100 text-gray-700"
                )}
              >
                {order.status}
              </Badge>
            </div>

            <div className="space-y-2">
              {order.items.map((item, j) => (
                <div key={j} className="flex items-center gap-3">
                  {item.imageUrl && (
                    <div className="w-12 h-14 rounded-md overflow-hidden bg-cream-100 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <span className="text-sm">
                Total: <span className="font-semibold">{formatPrice(order.total)}</span>
              </span>
              {order.trackingNumber && (
                <span className="text-xs text-muted-foreground">
                  Tracking: {order.trackingNumber}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
