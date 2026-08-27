import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import CategoriesPage from "./pages/CategoriesPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
