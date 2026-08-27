import { useState } from "react";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "./Toast";
import { Instagram, Twitter, Facebook, Mail, CheckCircle } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      toast("Welcome to the FashionistA Circle!", "success");
      setEmail("");
    } else {
      toast("Please enter a valid email address", "error");
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
              <li><a href="#" className="hover:text-background transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Track Order</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><Link to="/about" className="hover:text-background transition-colors">Our Story</Link></li>
              <li><a href="#" className="hover:text-background transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-3 mb-4">
              <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm text-background/60">
              Follow us for daily style inspiration and exclusive drops.
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
              <a href="#" className="hover:text-background/60 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background/60 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background/60 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
