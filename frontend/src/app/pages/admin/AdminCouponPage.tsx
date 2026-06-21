import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const AdminCouponPage: React.FC = () => {
  const coupons = [
    { id: 1, code: 'WELCOME50', discount: '50,000 VNĐ', minOrder: '500,000', usage: 45, limit: 100, expiry: '30/06/2026', active: true },
    { id: 2, code: 'SUMMER20', discount: '20%', minOrder: '1,000,000', usage: 120, limit: 500, expiry: '31/07/2026', active: true },
    { id: 3, code: 'VIP10', discount: '10%', minOrder: '2,000,000', usage: 78, limit: 200, expiry: '31/08/2026', active: true },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Coupon & Referral</h1>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Tạo coupon mới
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Danh sách Coupon</h2>
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-[#FF6A00] text-lg">{coupon.code}</span>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {coupon.active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-[#FF6A00]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Giảm giá:</p>
                    <p className="font-semibold">{coupon.discount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Đơn tối thiểu:</p>
                    <p className="font-semibold">{coupon.minOrder} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Đã sử dụng:</p>
                    <p className="font-semibold">{coupon.usage}/{coupon.limit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hết hạn:</p>
                    <p className="font-semibold">{coupon.expiry}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Chương trình Referral</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Thưởng cho người giới thiệu</p>
              <p className="text-2xl font-bold text-[#10B981]">50,000 VNĐ</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Thưởng cho người được giới thiệu</p>
              <p className="text-2xl font-bold text-[#10B981]">30,000 VNĐ</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng số lượt giới thiệu</p>
              <p className="text-2xl font-bold text-[#FF6A00]">1,234</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng chi phí thưởng</p>
              <p className="text-2xl font-bold text-gray-900">98,720,000 VNĐ</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
