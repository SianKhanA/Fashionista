import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-8xl font-bold text-primary/20 mb-4">404</h1>
        <h2 className="font-serif text-2xl font-bold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="rose">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Browse Shop
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
