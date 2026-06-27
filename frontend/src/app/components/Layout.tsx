import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Package, Wallet, Gift, Bell, User, Menu, X, Search, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFullName, setUserFullName] = useState("Tài khoản");

  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);

      const fullName = localStorage.getItem("userFullName") || "Tài khoản";
      setUserFullName(fullName);
    };

    checkAuth(); 

    window.addEventListener("authChange", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    alert("Đã đăng xuất tài khoản!");
    navigate("/");
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-muted">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Yufiz
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/order/new"
                className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Đặt hàng
              </Link>
              
              {/* CHỈ HIỆN ĐƠN HÀNG VÀ VÍ TIỀN KHI ĐÃ ĐĂNG NHẬP */}
              {isLoggedIn && (
                <>
                  <Link
                    to="/orders"
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Đơn hàng
                  </Link>
                  <Link
                    to="/wallet"
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    Ví tiền
                  </Link>
                </>
              )}

              <Link
                to="/referral"
                className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Giới thiệu
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/notifications"
                    className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/profile"
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>{userFullName}</span>
                    </Link>
                    
                    {/* Nút Đăng xuất trên Desktop */}
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-destructive rounded-lg transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => navigate('/login')} 
                    className="text-foreground hover:text-primary font-medium transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="bg-gradient-to-r from-primary to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Đăng ký
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-2">
                <Link
                  to="/order/new"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  Đặt hàng
                </Link>

                {isLoggedIn && (
                  <>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="w-5 h-5" />
                      Đơn hàng
                    </Link>
                    <Link
                      to="/wallet"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Wallet className="w-5 h-5" />
                      Ví tiền
                    </Link>
                  </>
                )}

                <Link
                  to="/referral"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Gift className="w-5 h-5" />
                  Giới thiệu
                </Link>
                
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2 pt-4 border-t border-border px-4">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 py-2.5 text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Tài khoản ({userFullName})
                    </Link>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }} 
                      className="w-full py-2.5 text-center text-destructive font-medium rounded-lg border border-destructive/20 hover:bg-destructive/5"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border flex flex-col gap-2 px-4">
                    <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full py-2.5 text-center text-foreground font-medium rounded-lg hover:bg-muted">
                      Đăng nhập
                    </button>
                    <button onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} className="w-full py-2.5 text-center bg-gradient-to-r from-primary to-orange-600 text-white font-medium rounded-xl">
                      Đăng ký
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Yufiz</span>
              </div>
              <p className="text-gray-300 text-sm">
                Nền tảng đặt hàng xuyên biên giới uy tín, giúp bạn mua sắm dễ dàng từ Taobao và Xianyu.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Dịch vụ</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/order/new" className="hover:text-primary transition-colors">Đặt hàng</Link></li>
                <li><Link to="/exchange-rate" className="hover:text-primary transition-colors">Tỷ giá</Link></li>
                <li><Link to="/product-hunting" className="hover:text-primary transition-colors">Tìm hàng</Link></li>
                <li><Link to="/chat" className="hover:text-primary transition-colors">Hỗ trợ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Chính sách</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/faq" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link to="/faq#refund" className="hover:text-primary transition-colors">Chính sách hoàn tiền</Link></li>
                <li><Link to="/faq#terms" className="hover:text-primary transition-colors">Điều khoản sử dụng</Link></li>
                <li><Link to="/faq#privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Email: support@yufiz.vn</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Yufiz. Đã đăng ký bản quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}