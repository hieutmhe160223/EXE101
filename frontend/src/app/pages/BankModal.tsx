import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import api from "../utils/api"; 

interface BankModalProps {
  bank: {
    id?: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    branch: string;
    isDefault: boolean;
  } | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export function BankModal({ bank, onClose, onSaveSuccess }: BankModalProps) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [branch, setBranch] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bank) {
      setBankName(bank.bankName);
      setAccountNumber(bank.accountNumber);
      setAccountHolderName(bank.accountHolderName);
      setBranch(bank.branch);
      setIsDefault(!!(bank.isDefault || (bank as any).default));
      } else {
      setBankName("");
      setAccountNumber("");
      setAccountHolderName("");
      setBranch("");
      setIsDefault(false);
    }
  }, [bank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = localStorage.getItem("userEmail") || "";
    const payload = {
      email,
      bankName,
      accountNumber,
      accountHolderName,
      branch,
      isDefault: isDefault,   
      "default": isDefault,
    };

    try {
      if (bank && bank.id) {
        await api.put(`/user/banks/${bank.id}`, payload);
        alert("Cập nhật tài khoản ngân hàng thành công!");
      } else {
        await api.post("/user/banks", payload);
        alert("Thêm tài khoản ngân hàng thành công!");
      }
      onSaveSuccess();
    } catch (error: any) {
      console.error("Lỗi khi lưu tài khoản ngân hàng:", error);
      alert(error.response?.data || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-border">
        <h3 className="text-xl font-bold mb-4">
          {bank ? "Sửa tài khoản ngân hàng" : "Thêm tài khoản ngân hàng mới"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên ngân hàng</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Vietcombank, Techcombank..."
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Số tài khoản</label>
            <input
              type="text"
              required
              placeholder="Nhập số tài khoản"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tên chủ tài khoản</label>
            <input
              type="text"
              required
              placeholder="Ho Va Ten"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())} // Tự viết hoa cho đẹp
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-input-background uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chi nhánh (Không bắt buộc)</label>
            <input
              type="text"
              placeholder="Ví dụ: Hà Nội, TP.HCM..."
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="isDefaultBank"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
            />
            <label htmlFor="isDefaultBank" className="text-sm select-none cursor-pointer">
              Đặt làm tài khoản ngân hàng mặc định
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}