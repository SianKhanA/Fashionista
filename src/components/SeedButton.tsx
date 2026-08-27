import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { Database, Check, Loader2 } from "lucide-react";

export default function SeedButton() {
  const seedDatabase = useMutation(api.seed.seedAll);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "already">("idle");

  const handleSeed = async () => {
    setStatus("loading");
    try {
      const result = await seedDatabase();
      if (result === "Already seeded") {
        setStatus("already");
      } else {
        setStatus("done");
      }
    } catch (error) {
      console.error("Seed failed:", error);
      setStatus("idle");
    }
  };

  if (status === "done" || status === "already") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        {status === "done" ? "Database seeded!" : "Database already has data"}
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSeed}
      disabled={status === "loading"}
      className="gap-2"
    >
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {status === "loading" ? "Seeding..." : "Seed Database"}
    </Button>
  );
}
