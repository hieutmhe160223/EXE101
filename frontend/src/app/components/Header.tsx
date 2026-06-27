import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router'; 
import { ShoppingCart, Bell, User, Menu, Heart, Wallet, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userFullName, setUserFullName] = React.useState("Tài khoản"); 

  React.useEffect(() => {
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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6A00] to-[#FF8533] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              Y
            </div>
            <span className="text-2xl font-bold text-[#1F2937]">Yufiz</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/product-input" className="text-gray-700 hover:text-[#FF6A00] transition-colors">
              Đặt hàng
            </Link>
            
            {isLoggedIn && (
              <Link to="/orders" className="text-gray-700 hover:text-[#FF6A00] transition-colors">
                Đơn hàng
              </Link>
            )}
            
            <Link to="/exchange-rate" className="text-gray-700 hover:text-[#FF6A00] transition-colors">
              Tỷ giá
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-[#FF6A00] transition-colors">
              Hỗ trợ
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              
              <>
                <button onClick={() => navigate('/wishlist')} className="p-2 text-gray-600 hover:text-[#FF6A00] transition-colors relative">
                  <Heart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-[#FF6A00] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>
                <button onClick={() => navigate('/wallet')} className="p-2 text-gray-600 hover:text-[#FF6A00] transition-colors">
                  <Wallet className="w-6 h-6" />
                </button>
                <button onClick={() => navigate('/notifications')} className="p-2 text-gray-600 hover:text-[#FF6A00] transition-colors relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{userFullName}</span>
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              
              <div className="hidden md:flex items-center space-x-3">
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-gray-700 hover:text-[#FF6A00] font-medium transition-colors"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="bg-[#FF6A00] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#FF8533] transition-colors shadow-sm"
                >
                  Đăng ký
                </button>
              </div>
            )}

            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-1">
            <Link to="/product-input" className="block py-2 text-gray-700 hover:text-[#FF6A00]">
              Đặt hàng
            </Link>
            
            {isLoggedIn && (
              <Link to="/orders" className="block py-2 text-gray-700 hover:text-[#FF6A00]">
                Đơn hàng
              </Link>
            )}
            
            <Link to="/exchange-rate" className="block py-2 text-gray-700 hover:text-[#FF6A00]">
              Tỷ giá
            </Link>
            <Link to="/faq" className="block py-2 text-gray-700 hover:text-[#FF6A00]">
              Hỗ trợ
            </Link>

            {!isLoggedIn ? (
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
                <button onClick={() => navigate('/login')} className="w-full text-center py-2 text-gray-700 font-medium">
                  Đăng nhập
                </button>
                <button onClick={() => navigate('/register')} className="w-full text-center py-2 bg-[#FF6A00] text-white rounded-xl font-medium">
                  Đăng ký
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full text-center py-2 text-red-500 font-medium">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};