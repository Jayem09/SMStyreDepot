import { createBrowserRouter } from "react-router";
import { lazy } from "react";


const HomePage = lazy(() => import("./components/HomePage").then(m => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import("./components/ProductsPage").then(m => ({ default: m.ProductsPage })));
const CartPage = lazy(() => import("./components/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const ContactPage = lazy(() => import("./components/ContactPage").then(m => ({ default: m.ContactPage })));
const ServicesPage = lazy(() => import("./components/ServicesPage").then(m => ({ default: m.ServicesPage })));
const LoginPage = lazy(() => import("./components/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./components/auth/SignupPage").then(m => ({ default: m.SignupPage })));
const BrandsPage = lazy(() => import("./components/BrandsPage").then(m => ({ default: m.BrandsPage })));
const ForgotPasswordPage = lazy(() => import("./components/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const TermsPage = lazy(() => import("./components/TermsPage").then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("./components/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const ProductDetailPage = lazy(() => import("./components/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const ComparisonPage = lazy(() => import("./components/ComparisonPage").then(m => ({ default: m.ComparisonPage })));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute").then(m => ({ default: m.AdminRoute })));
const UserDashboard = lazy(() => import("./components/dashboard/UserDashboard").then(m => ({ default: m.UserDashboard })));
const OrdersPage = lazy(() => import("./components/OrdersPage").then(m => ({ default: m.OrdersPage })));
const ProfilePage = lazy(() => import("./components/ProfilePage").then(m => ({ default: m.ProfilePage })));
const WishlistPage = lazy(() => import("./components/WishlistPage").then(m => ({ default: m.WishlistPage })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/products",
    Component: ProductsPage,
  },
  {
    path: "/product/:id",
    Component: ProductDetailPage,
  },
  {
    path: "/compare",
    Component: ComparisonPage,
  },
  {
    path: "/cart",
    Component: CartPage,
  },
  {
    path: "/checkout",
    Component: CheckoutPage,
  },
  {
    path: "/contact",
    Component: ContactPage,
  },
  {
    path: "/services",
    Component: ServicesPage,
  },
  {
    path: "/brands",
    Component: BrandsPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/terms",
    Component: TermsPage,
  },
  {
    path: "/privacy",
    Component: PrivacyPage,
  },
  {
    path: "/dashboard",
    Component: UserDashboard,
  },
  {
    path: "/orders",
    Component: OrdersPage,
  },
  {
    path: "/profile",
    Component: ProfilePage,
  },
  {
    path: "/wishlist",
    Component: WishlistPage,
  },
  {
    path: "/admin",
    Component: AdminRoute,
  },
]);
