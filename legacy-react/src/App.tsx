import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "./convex/_generated/api";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));

export default function App() {
  const { isAuthenticated } = useConvexAuth();
  const initializeUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (isAuthenticated) void initializeUser();
  }, [isAuthenticated, initializeUser]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12"><div className="h-10 w-56 rounded skeleton" /><div className="mt-8 h-96 rounded-2xl skeleton" /></div>}>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:category" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="help/:topic" element={<InfoPage />} />
          <Route path="policies/:topic" element={<InfoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        </Routes>
      </Suspense>
    </>
  );
}
