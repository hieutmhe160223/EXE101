import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Check, LoaderCircle, MapPin, Phone, UserRound, X } from "lucide-react";
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

const fieldClass = "w-full rounded-xl border border-gray-200 bg-gray-50/70 px-11 py-3 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100";

export function AddressModal({ address, onClose, onSaveSuccess }: AddressModalProps) {
  const [formData, setFormData] = useState<Address>({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    addressDetail: address?.addressDetail || "",
    isDefault: address?.isDefault || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const userEmail = localStorage.getItem("userEmail") || "";
    if (!userEmail) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (address?.id) {
        await api.put(`/user/addresses/${address.id}`, formData);
      } else {
        await api.post("/user/addresses", {
          email: userEmail,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          detailAddress: formData.addressDetail,
          isDefault: formData.isDefault,
        });
      }
      onSaveSuccess();
    } catch {
      setError("Không thể lưu địa chỉ. Vui lòng kiểm tra thông tin và thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-gray-950/45 p-0 backdrop-blur-[2px] animate-in fade-in duration-200 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="address-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <div className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:rounded-3xl sm:zoom-in-95">
        <header className="flex items-start justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary"><MapPin className="h-5 w-5" /></span>
            <div><h2 id="address-modal-title" className="text-lg font-bold text-gray-900">{address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h2><p className="mt-0.5 text-sm text-gray-500">Thông tin được dùng khi giao nhận hàng.</p></div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50" aria-label="Đóng"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6 sm:px-6">
          {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</div>}
          <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Họ và tên người nhận</span><span className="relative block"><UserRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" /><input autoFocus required aria-label="Họ và tên người nhận" className={fieldClass} value={formData.fullName} onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))} placeholder="Nhập họ và tên" /></span></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Số điện thoại</span><span className="relative block"><Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" /><input required type="tel" aria-label="Số điện thoại người nhận" className={fieldClass} value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} placeholder="Nhập số điện thoại" /></span></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Địa chỉ chi tiết</span><span className="relative block"><MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" /><textarea required rows={3} aria-label="Địa chỉ chi tiết" className={`${fieldClass} resize-none`} value={formData.addressDetail} onChange={(event) => setFormData((current) => ({ ...current, addressDetail: event.target.value }))} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" /></span></label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50/40">
            <input type="checkbox" className="peer sr-only" checked={formData.isDefault} onChange={(event) => setFormData((current) => ({ ...current, isDefault: event.target.checked }))} />
            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white text-transparent transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white"><Check className="h-3.5 w-3.5" /></span>
            <span><span className="block text-sm font-semibold text-gray-800">Đặt làm địa chỉ mặc định</span><span className="text-xs text-gray-500">Tự động ưu tiên khi tạo đơn mới.</span></span>
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" disabled={saving} onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50">Hủy</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{saving ? "Đang lưu..." : "Lưu địa chỉ"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
