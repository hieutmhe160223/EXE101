import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import api from "../utils/api"; 

interface Address {
  id?: string | number;
  fullName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}

interface AddressModalProps {
  address: Address | null; 
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function AddressModal({ address, onClose, onSaveSuccess }: AddressModalProps) {
  const [formData, setFormData] = useState<Address>({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    addressDetail: address?.addressDetail || "",
    isDefault: address?.isDefault || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("userEmail") || ""; 
    if (!userEmail) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      return;
    }
    try {
      const payload = {
        email: userEmail,
        fullName: formData.fullName,
        phoneNumber: formData.phone,          
        detailAddress: formData.addressDetail,  
        isDefault: formData.isDefault
      };

      if (address?.id) {
        await api.put(`/user/addresses/${address.id}`, payload);
      } else {
        await api.post("/user/addresses", payload);
      }
      onSaveSuccess();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu địa chỉ!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {address ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Họ và tên</label>
            <input 
              required
              className="w-full p-2 border rounded"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Số điện thoại</label>
            <input 
              required
              className="w-full p-2 border rounded"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Địa chỉ chi tiết</label>
            <textarea 
              required
              className="w-full p-2 border rounded"
              value={formData.addressDetail}
              onChange={(e) => setFormData({...formData, addressDetail: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
            />
            <label>Đặt làm địa chỉ mặc định</label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}