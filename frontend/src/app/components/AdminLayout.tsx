import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Users,
  MessageSquare,
  Settings,
  Tag,
  BarChart3,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Tổng quan" },
    { path: "/admin/orders", icon: Package, label: "Quản lý đơn hàng" },
    { path: "/admin/customers", icon: Users, label: "Khách hàng" },
    { path: "/admin/complaints", icon: MessageSquare, label: "Khiếu nại" },
    { path: "/admin/coupons", icon: Tag, label: "Mã giảm giá" },
    { path: "/admin/settings", icon: Settings, label: "Cài đặt" },
    { path: "/admin/reports", icon: BarChart3, label: "Báo cáo" },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Mobile Header */}
      <header className="lg:hidden bg-secondary text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold">Yufiz Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen w-64 bg-secondary text-white
            transition-transform duration-300 z-40
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-6 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Yufiz Admin</span>
            </div>
          </div>

          <nav className="px-4 py-6 lg:py-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg mb-2
                    transition-colors
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Quay lại trang chủ</span>
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
