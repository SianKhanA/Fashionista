import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Save, LogIn } from "lucide-react";

// Convex Auth sign-in method using the Convex auth provider
import { useAuthActions } from "@convex-dev/auth/react";

export default function AccountPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  // Initialize form when user loads
  const initializeForm = () => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zip: user.address?.zip || "",
        country: user.address?.country || "US",
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="space-y-4">
          <div className="h-8 skeleton rounded w-1/3" />
          <div className="h-40 skeleton rounded-lg" />
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-serif text-3xl font-bold mb-3">Welcome Back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your account, track orders, and manage your
            wishlist.
          </p>
          <div className="space-y-3 max-w-sm mx-auto">
            <Button
              variant="rose"
              size="lg"
              className="w-full"
              onClick={() => signIn("github")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in with GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => signIn("google")}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated - show profile
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-2">
          My Account
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your profile and preferences.
        </p>
      </motion.div>

      <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h2 className="font-serif text-xl font-semibold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user?.email}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Personal Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!isEditing) initializeForm();
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            ) : (
              <p className="text-sm">{user?.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <p className="text-sm flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user?.email}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Phone
            </label>
            {isEditing ? (
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Phone number"
              />
            ) : (
              <p className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user?.phone || "Not set"}
              </p>
            )}
          </div>

          <Separator className="my-4" />
          <h3 className="font-semibold">Shipping Address</h3>

          {isEditing ? (
            <div className="space-y-3">
              <Input
                placeholder="Street address"
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
                <Input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="ZIP Code"
                  value={form.zip}
                  onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                />
                <Input
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
              <Button variant="rose" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
              {user?.address ? (
                <span>
                  {user.address.street}, {user.address.city}, {user.address.state}{" "}
                  {user.address.zip}, {user.address.country}
                </span>
              ) : (
                <span>No address on file</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
