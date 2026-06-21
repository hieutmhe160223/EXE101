import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";

// Customer Screens
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { ProductLinkInputPage } from "./pages/ProductLinkInputPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { WishlistPage } from "./pages/WishlistPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { PaymentMethodPage } from "./pages/PaymentMethodPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage";
import { OrderListPage } from "./pages/OrderListPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { FinalPaymentPage } from "./pages/FinalPaymentPage";
import { RefundRequestPage } from "./pages/RefundRequestPage";
import { LiveChatPage } from "./pages/LiveChatPage";
import { ProductHuntingPage } from "./pages/ProductHuntingPage";
import { WalletPage } from "./pages/WalletPage";
import { ReferralPage } from "./pages/ReferralPage";
import { NotificationPage } from "./pages/NotificationPage";
import { ExchangeRatePage } from "./pages/ExchangeRatePage";
import { FAQPage } from "./pages/FAQPage";

// Admin Screens
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminOrderManagementPage } from "./pages/admin/AdminOrderManagementPage";
import { AdminUpdateOrderPage } from "./pages/admin/AdminUpdateOrderPage";
import { AdminCustomerManagementPage } from "./pages/admin/AdminCustomerManagementPage";
import { AdminComplaintManagementPage } from "./pages/admin/AdminComplaintManagementPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminCouponManagementPage } from "./pages/admin/AdminCouponManagementPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "register", Component: RegisterPage },
      { path: "login", Component: LoginPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "profile", Component: UserProfilePage },
      { path: "order/new", Component: ProductLinkInputPage },
      { path: "product/:id", Component: ProductDetailPage },
      { path: "wishlist", Component: WishlistPage },
      { path: "order/confirm", Component: OrderConfirmationPage },
      { path: "order/payment", Component: PaymentMethodPage },
      { path: "order/success", Component: OrderSuccessPage },
      { path: "orders", Component: OrderListPage },
      { path: "orders/:id", Component: OrderDetailPage },
      { path: "orders/:id/final-payment", Component: FinalPaymentPage },
      { path: "orders/:id/refund", Component: RefundRequestPage },
      { path: "chat", Component: LiveChatPage },
      { path: "product-hunting", Component: ProductHuntingPage },
      { path: "wallet", Component: WalletPage },
      { path: "referral", Component: ReferralPage },
      { path: "notifications", Component: NotificationPage },
      { path: "exchange-rate", Component: ExchangeRatePage },
      { path: "faq", Component: FAQPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: "orders", Component: AdminOrderManagementPage },
      { path: "orders/:id", Component: AdminUpdateOrderPage },
      { path: "customers", Component: AdminCustomerManagementPage },
      { path: "complaints", Component: AdminComplaintManagementPage },
      { path: "settings", Component: AdminSettingsPage },
      { path: "coupons", Component: AdminCouponManagementPage },
      { path: "reports", Component: AdminReportsPage },
    ],
  },
]);
