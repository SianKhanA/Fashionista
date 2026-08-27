import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { CATEGORIES } from "@/lib/constants";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CATEGORY_IMAGES: Record<string, string> = {
  dresses: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
  tops: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800",
  bottoms: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
  outerwear: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800",
  accessories: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
  shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
  jewelry: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
  activewear: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800",
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="text-primary font-script text-sm tracking-wider">
          Explore Our World
        </span>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold mt-2 mb-4">
          Collections
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Discover curated collections designed for the modern woman. Each piece
          is crafted with care and attention to detail.
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-2 gap-6"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.id} variants={fadeUp}>
            <Link
              to={`/shop/${cat.id}`}
              className="group relative block aspect-[16/10] rounded-xl overflow-hidden"
            >
              <img
                src={CATEGORY_IMAGES[cat.id] || ""}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-white/60 text-3xl block mb-1">
                      {cat.icon}
                    </span>
                    <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-1">
                      {cat.name}
                    </h2>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
