import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const root = ReactDOM.createRoot(document.getElementById("root")!);

if (!convexUrl) {
  root.render(
    <React.StrictMode>
      <main className="min-h-screen bg-cream-50 px-6 py-24 text-center">
        <p className="font-serif text-4xl font-bold text-primary">FashionistA</p>
        <h1 className="mt-8 text-2xl font-semibold">Storefront setup is incomplete</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          The catalog service is not connected. Add the deployment URL to the site environment before publishing.
        </p>
      </main>
    </React.StrictMode>
  );
} else {
  const convex = new ConvexReactClient(convexUrl);
  root.render(
    <React.StrictMode>
      <ConvexAuthProvider
        client={convex}
        replaceURL={(relativeUrl) => window.history.replaceState({}, "", relativeUrl)}
      >
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
      </ConvexAuthProvider>
    </React.StrictMode>
  );
}
