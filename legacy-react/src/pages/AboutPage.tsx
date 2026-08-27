import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, Sparkles, Users, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion for Quality",
    description:
      "Every piece in our collection is carefully curated and crafted from premium fabrics, ensuring luxury you can feel.",
  },
  {
    icon: Leaf,
    title: "Sustainable Fashion",
    description:
      "We're committed to responsible sourcing and eco-friendly practices, because style should never come at the planet's expense.",
  },
  {
    icon: Sparkles,
    title: "Timeless Design",
    description:
      "Our designs transcend trends, creating wardrobe staples that remain beautiful and relevant season after season.",
  },
  {
    icon: Users,
    title: "For Every Woman",
    description:
      "We celebrate all body types with inclusive sizing and designs that make every woman feel confident and beautiful.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Our boutique"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <span className="text-primary font-script text-lg tracking-wider">
              Our Story
            </span>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mt-2 mb-4">
              Born from a Love of{" "}
              <span className="italic text-primary">Elegance</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              FashionistA was founded with a singular vision: to create a
              boutique where every woman discovers pieces that make her feel
              extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-6">
              Crafting Moments of Beauty
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                What started as a small atelier has grown into a beloved fashion
                destination. Our founder believed that fashion is more than
                clothing — it's a form of self-expression, a celebration of
                individuality.
              </p>
              <p>
                Today, FashionistA curates collections from emerging designers
                and established houses alike, bringing you pieces that are
                thoughtfully designed, impeccably made, and timeless in appeal.
              </p>
              <p>
                From the softest cashmere to the finest silk, from statement
                accessories to everyday essentials, every item in our boutique
                has been chosen with care and intention.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800"
                alt="Our boutique interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl border border-border p-6 shadow-lg max-w-xs">
              <p className="font-serif text-2xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">
                Curated pieces from 50+ designers worldwide
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-3">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The principles that guide everything we do.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border text-center"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Ready to Discover Your Style?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Explore our latest collections and find pieces that speak to you.
          </p>
          <Link to="/shop">
            <Button variant="rose" size="xl">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
