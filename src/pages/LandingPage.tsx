import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/ProductGrid";
import RecentlyViewed from "@/components/RecentlyViewed";
import SeedButton from "@/components/SeedButton";
import { CATEGORIES } from "@/lib/constants";
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const featuredProducts = useQuery(api.products.list, {
    featured: true,
    limit: 8,
  });

  const categories = useQuery(api.categories.list);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Fashion boutique"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block text-primary font-script text-lg mb-4 tracking-wider"
            >
              New Collection 2026
            </motion.span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Where Elegance{" "}
              <span className="italic text-primary">Meets</span>{" "}
              Modern Style
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Discover curated fashion that celebrates femininity. From timeless classics
              to contemporary statements — pieces designed to make you feel extraordinary.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button variant="rose" size="xl" className="group">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="cream" size="xl">
                  View Collections
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <SeedButton />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $150" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day returns" },
              { icon: Shield, title: "Secure Checkout", desc: "100% protected" },
              { icon: Sparkles, title: "Quality Promise", desc: "Premium fabrics" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-6 px-4 text-center"
              >
                <item.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore our curated collections, each designed with love and attention to detail.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {CATEGORIES.slice(0, 8).map((cat) => (
            <motion.div key={cat.id} variants={fadeUp}>
              <Link
                to={`/shop/${cat.id}`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-cream-100 flex items-center justify-center hover:shadow-lg transition-all duration-300"
              >
                <div className="text-center p-4">
                  <span className="text-4xl block mb-2">{cat.icon}</span>
                  <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-primary font-script text-sm tracking-wider">Curated for You</span>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mt-1">
                Featured Pieces
              </h2>
            </div>
            <Link to="/shop">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {featuredProducts ? (
            <ProductGrid products={featuredProducts.products} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] rounded-lg skeleton" />
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-1/3" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="relative bg-primary rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80"
                alt="Fashion"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative px-8 py-12 lg:px-16 lg:py-20 text-center text-primary-foreground">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="font-serif text-3xl lg:text-5xl font-bold mb-4">
                  The Summer Edit
                </h2>
                <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 text-lg">
                  Light fabrics, bold colors, effortless style. Discover pieces that
                  define the season.
                </p>
                <Link to="/shop">
                  <Button
                    variant="secondary"
                    size="xl"
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    Shop Summer Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-3">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              name: "Sophia M.",
              text: "The quality of every piece I've ordered is exceptional. FashionistA has become my go-to for special occasions.",
              rating: 5,
            },
            {
              name: "Isabella R.",
              text: "Love the attention to detail in each garment. The Midnight Velvet Blazer is absolutely stunning!",
              rating: 5,
            },
            {
              name: "Emma L.",
              text: "Beautiful packaging, fast shipping, and the clothes fit perfectly. Customer service is also top-notch.",
              rating: 5,
            },
          ].map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-xl p-6 lg:p-8 shadow-sm border border-border"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} className="text-primary text-lg">★</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed italic">
                "{review.text}"
              </p>
              <p className="text-sm font-semibold">{review.name}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Recently Viewed */}
      <RecentlyViewed />
    </div>
  );
}
