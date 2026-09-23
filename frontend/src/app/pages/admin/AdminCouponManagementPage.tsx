import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Search, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../../utils/api";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

type Coupon = { id: number; code: string; name: string; discountValue: number; percentage: boolean; maxDiscountVnd: number | null; minimumOrderVnd: number; startsAt: string | null; endsAt: string | null; active: boolean; usageLimit: number; usedCount: number };
type CouponForm = { code: string; name: string; discountValue: string; percentage: boolean; maxDiscountVnd: string; minimumOrderVnd: string; startsAt: string; endsAt: string; usageLimit: string; active: boolean };
type SpringPage<T> = { content: T[]; totalPages: number; totalElements: number };

const emptyForm: CouponForm = { code: "", name: "", discountValue: "", percentage: true, maxDiscountVnd: "", minimumOrderVnd: "0", startsAt: "", endsAt: "", usageLimit: "0", active: true };
const formatMoney = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "Không giới hạn";
const toInputDate = (value: string | null) => value ? value.slice(0, 16) : "";

export function AdminCouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await api.get<SpringPage<Coupon>>("/v1/admin/coupons", { params: { keyword: keyword.trim() || undefined, page, size: 10 } });
      setCoupons(response.data.content); setTotalPages(response.data.totalPages); setTotalElements(response.data.totalElements);
    } catch (err: any) { setError(err?.response?.data?.message || "Không thể tải danh sách mã giảm giá."); }
    finally { setLoading(false); }
  }, [keyword, page]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (coupon: Coupon) => { setEditing(coupon); setForm({ code: coupon.code, name: coupon.name, discountValue: String(coupon.discountValue), percentage: coupon.percentage, maxDiscountVnd: coupon.maxDiscountVnd == null ? "" : String(coupon.maxDiscountVnd), minimumOrderVnd: String(coupon.minimumOrderVnd || 0), startsAt: toInputDate(coupon.startsAt), endsAt: toInputDate(coupon.endsAt), usageLimit: String(coupon.usageLimit || 0), active: coupon.active }); setModalOpen(true); };
  const setField = (key: keyof CouponForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const saveCoupon = async () => {
    if (!form.code.trim() || !form.name.trim() || Number(form.discountValue) <= 0 || Number(form.minimumOrderVnd) < 0 || Number(form.usageLimit) < 0) { setError("Vui lòng nhập đầy đủ thông tin hợp lệ."); return; }
    setSaving(true); setError(null);
    const payload = { code: form.code.trim(), name: form.name.trim(), discountValue: Number(form.discountValue), percentage: form.percentage, maxDiscountVnd: form.maxDiscountVnd ? Number(form.maxDiscountVnd) : null, minimumOrderVnd: Number(form.minimumOrderVnd), startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null, usageLimit: Number(form.usageLimit), active: form.active };
    try { if (editing) await api.put(`/v1/admin/coupons/${editing.id}`, payload); else await api.post("/v1/admin/coupons", payload); setModalOpen(false); await fetchCoupons(); } catch (err: any) { setError(err?.response?.data?.message || "Không thể lưu mã giảm giá."); } finally { setSaving(false); }
  };

  const toggleCoupon = async (coupon: Coupon) => { try { await api.patch(`/v1/admin/coupons/${coupon.id}/active`, null, { params: { active: !coupon.active } }); await fetchCoupons(); } catch (err: any) { setError(err?.response?.data?.message || "Không thể cập nhật trạng thái mã giảm giá."); } };
  const discountText = (coupon: Coupon) => coupon.percentage ? `${coupon.discountValue}%${coupon.maxDiscountVnd ? ` tối đa ${formatMoney(coupon.maxDiscountVnd)}` : ""}` : formatMoney(coupon.discountValue);

  return <div className="p-6 max-w-7xl mx-auto"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"><div><h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1><p className="text-sm text-muted-foreground mt-1">Tổng cộng {totalElements} mã giảm giá</p></div><Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Tạo mã mới</Button></div><Card className="mb-6 p-4"><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0); }} placeholder="Tìm theo mã hoặc tên coupon..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" /></div></Card><Card>{loading ? <div className="py-12 text-center text-muted-foreground">Đang tải mã giảm giá...</div> : error && !modalOpen ? <div className="py-12 text-center text-rose-500">{error}</div> : <><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-slate-500 bg-slate-50/50"><th className="p-4">Mã</th><th className="p-4">Tên</th><th className="p-4">Giảm giá</th><th className="p-4">Đơn tối thiểu</th><th className="p-4">Đã dùng</th><th className="p-4">Hiệu lực</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody>{coupons.length === 0 ? <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Chưa có mã giảm giá phù hợp.</td></tr> : coupons.map((coupon) => <tr key={coupon.id} className="border-b last:border-0 hover:bg-slate-50/50"><td className="p-4 font-mono font-semibold text-primary">{coupon.code}</td><td className="p-4">{coupon.name}</td><td className="p-4 font-semibold">{discountText(coupon)}</td><td className="p-4">{formatMoney(coupon.minimumOrderVnd)}</td><td className="p-4">{coupon.usedCount}/{coupon.usageLimit === 0 ? "∞" : coupon.usageLimit}</td><td className="p-4 text-muted-foreground">{formatDate(coupon.endsAt)}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{coupon.active ? "Đang hoạt động" : "Đang tắt"}</span></td><td className="p-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => openEdit(coupon)} title="Chỉnh sửa" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-primary"><Edit className="w-4 h-4" /></button><button onClick={() => toggleCoupon(coupon)} title={coupon.active ? "Tắt mã" : "Bật mã"} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">{coupon.active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}</button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t p-4 text-sm"><span className="text-muted-foreground">Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Trước</button><button disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Sau</button></div></div></>}</Card>{modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">{editing ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}</h2><button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-900">Đóng</button></div>{error && <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}<div className="grid md:grid-cols-2 gap-4"><Input label="Mã giảm giá *" value={form.code} onChange={(value) => setField("code", value.toUpperCase())} /><Input label="Tên chương trình *" value={form.name} onChange={(value) => setField("name", value)} /><Input label="Giá trị giảm *" type="number" value={form.discountValue} onChange={(value) => setField("discountValue", value)} /><label className="flex items-center gap-2 mt-8 text-sm"><input type="checkbox" checked={form.percentage} onChange={(event) => setField("percentage", event.target.checked)} />Giảm theo phần trăm (%)</label><Input label="Giảm tối đa (VNĐ)" type="number" value={form.maxDiscountVnd} onChange={(value) => setField("maxDiscountVnd", value)} /><Input label="Đơn hàng tối thiểu (VNĐ)" type="number" value={form.minimumOrderVnd} onChange={(value) => setField("minimumOrderVnd", value)} /><Input label="Bắt đầu" type="datetime-local" value={form.startsAt} onChange={(value) => setField("startsAt", value)} /><Input label="Kết thúc" type="datetime-local" value={form.endsAt} onChange={(value) => setField("endsAt", value)} /><Input label="Giới hạn lượt dùng (0 = không giới hạn)" type="number" value={form.usageLimit} onChange={(value) => setField("usageLimit", value)} /><label className="flex items-center gap-2 mt-8 text-sm"><input type="checkbox" checked={form.active} onChange={(event) => setField("active", event.target.checked)} />Kích hoạt ngay</label></div><div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button onClick={saveCoupon} disabled={saving}>{saving ? "Đang lưu..." : "Lưu mã giảm giá"}</Button></div></div></div>}</div>;
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm font-medium">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary font-normal" /></label>; }
