import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./Toast";
import { Mail, CheckCircle } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [website, setWebsite] = useState("");
  const subscribe = useMutation(api.newsletter.subscribe);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subscribe({ email, website });
      setSubscribed(true);
      toast("Welcome to the FashionistA Circle!", "success");
      setEmail("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to subscribe", "error");
    }
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-serif text-2xl lg:text-3xl font-bold mb-3">
              Join the FashionistA Circle
            </h3>
            <p className="text-background/60 mb-6">
              Subscribe for exclusive access to new collections, styling tips, and
              members-only offers.
            </p>
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Thanks for subscribing!</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex gap-2 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/40 flex-1"
                  required
                />
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className="absolute -left-[9999px]"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <Button variant="rose" className="shrink-0">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/shop" className="hover:text-background transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop/dresses" className="hover:text-background transition-colors">Dresses</Link></li>
              <li><Link to="/shop/tops" className="hover:text-background transition-colors">Tops & Blouses</Link></li>
              <li><Link to="/shop/bottoms" className="hover:text-background transition-colors">Bottoms</Link></li>
              <li><Link to="/shop/accessories" className="hover:text-background transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/help/shipping" className="hover:text-background transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/help/sizing" className="hover:text-background transition-colors">Size Guide</Link></li>
              <li><Link to="/help/faq" className="hover:text-background transition-colors">FAQ</Link></li>
              <li><Link to="/help/contact" className="hover:text-background transition-colors">Contact Us</Link></li>
              <li><Link to="/orders" className="hover:text-background transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/about" className="hover:text-background transition-colors">Our Story</Link></li>
              <li><Link to="/help/sustainability" className="hover:text-background transition-colors">Sustainability</Link></li>
              <li><Link to="/help/contact" className="hover:text-background transition-colors">Careers & Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Connect</h4>
            <Link to="/help/contact" className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20" aria-label="Contact customer care"><Mail className="h-4 w-4" /></Link>
            <p className="text-sm text-background/60">
              Our customer care team is here for styling, delivery, and order support.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-background/40">
              &copy; {new Date().getFullYear()} FashionistA. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs text-background/40">
              <Link to="/policies/privacy" className="hover:text-background/60 transition-colors">Privacy Policy</Link>
              <Link to="/policies/terms" className="hover:text-background/60 transition-colors">Terms of Service</Link>
              <Link to="/policies/cookies" className="hover:text-background/60 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
