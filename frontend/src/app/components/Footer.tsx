import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1F2937] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6A00] to-[#FF8533] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                Y
              </div>
              <span className="text-2xl font-bold">Yufiz</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Nền tảng đặt hàng xuyên biên giới tin cậy, giúp bạn mua sắm dễ dàng từ Taobao và Xianyu.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 bg-gray-700 hover:bg-[#FF6A00] rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 hover:bg-[#FF6A00] rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/product-input" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Đặt hàng</Link></li>
              <li><Link to="/orders" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Đơn hàng của tôi</Link></li>
              <li><Link to="/exchange-rate" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Tỷ giá hôm nay</Link></li>
              <li><Link to="/product-hunting" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Tìm hàng</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/chat" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Chat hỗ trợ</Link></li>
              <li><Link to="/faq#policy" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Chính sách hoàn tiền</Link></li>
              <li><Link to="/faq#terms" className="text-gray-400 hover:text-[#FF6A00] text-sm transition-colors">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 text-[#FF6A00]" />
                <span className="text-gray-400 text-sm">+84 123 456 789</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 text-[#FF6A00]" />
                <span className="text-gray-400 text-sm">support@yufiz.vn</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#FF6A00]" />
                <span className="text-gray-400 text-sm">Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 Yufiz. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};
