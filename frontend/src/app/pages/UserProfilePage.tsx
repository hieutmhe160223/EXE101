import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle, BadgeCheck, CheckCircle2, ChevronRight, CircleDollarSign, Coins,
  CreditCard, Eye, EyeOff, Headphones, KeyRound, LoaderCircle, Lock, Mail,
  MapPin, Pencil, Phone, Plus, Save, ShieldCheck, Trash2, UserRound, Wallet,
} from "lucide-react";
import { Button } from "../components/Button";
import api from "../utils/api";
import { money } from "../utils/commerce";
import { AddressModal } from "./AddressModal";

interface Profile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  walletBalance: number;
  loyaltyPoints: number;
  referralCode: string | null;
}

interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
}

type TabId = "info" | "address" | "bank" | "security";
type Notice = { type: "success" | "error"; text: string } | null;

const tabs = [
  { id: "info" as const, label: "Thông tin cá nhân", shortLabel: "Hồ sơ", description: "Tên và liên hệ", icon: UserRound },
  { id: "address" as const, label: "Địa chỉ giao hàng", shortLabel: "Địa chỉ", description: "Nơi nhận hàng", icon: MapPin },
  { id: "bank" as const, label: "Tài khoản ngân hàng", shortLabel: "Ngân hàng", description: "Thông tin hoàn tiền", icon: CreditCard },
  { id: "security" as const, label: "Bảo mật tài khoản", shortLabel: "Bảo mật", description: "Mật khẩu đăng nhập", icon: ShieldCheck },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Y";
  return parts.slice(-2).map((part) => part[0]).join("").toUpperCase();
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const success = notice.type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div role="status" className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200 ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{notice.text}</span>
    </div>
  );
}

const fieldClass = "w-full rounded-xl border border-gray-200 bg-gray-50/70 px-11 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100";

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressNotice, setAddressNotice] = useState<Notice>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<Notice>(null);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileNotice(null);
    try {
      const response = await api.get<Profile>("/user/profile");
      const data = response.data;
      setProfile(data);
      setFullName(data.fullName || "");
      setEmail(data.email || "");
      setPhone(data.phoneNumber || "");
    } catch {
      setProfileNotice({ type: "error", text: "Không tải được hồ sơ. Vui lòng đăng nhập lại hoặc thử tải lại trang." });
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const fetchAddresses = useCallback(async () => {
    if (!email) return;
    setLoadingAddresses(true);
    setAddressNotice(null);
    try {
      const response = await api.get<Address[]>(`/user/addresses?email=${encodeURIComponent(email)}`);
      setAddresses(response.data);
    } catch {
      setAddressNotice({ type: "error", text: "Không tải được danh sách địa chỉ. Vui lòng thử lại." });
    } finally {
      setLoadingAddresses(false);
    }
  }, [email]);

  useEffect(() => { if (activeTab === "address") void fetchAddresses(); }, [activeTab, fetchAddresses]);

  const completion = useMemo(() => {
    const values = [fullName.trim(), email.trim(), phone.trim()];
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [email, fullName, phone]);

  const handleUpdateProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) {
      setProfileNotice({ type: "error", text: "Vui lòng nhập họ và tên." });
      return;
    }
    setSavingProfile(true);
    setProfileNotice(null);
    try {
      await api.put("/user/profile", { fullName: fullName.trim(), email, phoneNumber: phone.trim() });
      setProfile((current) => current ? { ...current, fullName: fullName.trim(), phoneNumber: phone.trim() } : current);
      localStorage.setItem("userFullName", fullName.trim());
      localStorage.setItem("userPhone", phone.trim());
      window.dispatchEvent(new Event("authChange"));
      setProfileNotice({ type: "success", text: "Thông tin cá nhân đã được cập nhật." });
    } catch {
      setProfileNotice({ type: "error", text: "Không thể lưu thay đổi. Vui lòng kiểm tra thông tin và thử lại." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    setDeletingAddressId(addressId);
    setAddressNotice(null);
    try {
      await api.delete(`/user/addresses/${addressId}`);
      setAddresses((current) => current.filter((address) => address.id !== addressId));
      setAddressNotice({ type: "success", text: "Đã xóa địa chỉ giao hàng." });
    } catch {
      setAddressNotice({ type: "error", text: "Không thể xóa địa chỉ. Vui lòng thử lại." });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSecurityNotice(null);
    if (passwordData.newPassword.length < 8) {
      setSecurityNotice({ type: "error", text: "Mật khẩu mới cần có ít nhất 8 ký tự." });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSecurityNotice({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }
    setSavingPassword(true);
    try {
      const response = await api.put("/user/change-password", { email, ...passwordData });
      setSecurityNotice({ type: "success", text: typeof response.data === "string" ? response.data : "Đổi mật khẩu thành công." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      const data = error.response?.data;
      setSecurityNotice({ type: "error", text: typeof data === "string" ? data : data?.message || "Không thể đổi mật khẩu. Vui lòng thử lại." });
    } finally {
      setSavingPassword(false);
    }
  };

  const activeTabInfo = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveTabIcon = activeTabInfo.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(255,106,0,0.07),transparent_28%),linear-gradient(to_bottom,#fafafa,#ffffff)]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_16px_45px_-30px_rgba(124,45,18,0.45)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-amber-300" />
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-orange-100/60 blur-2xl" />
          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-xl font-bold text-white shadow-lg shadow-orange-200 sm:h-20 sm:w-20 sm:text-2xl">
                {getInitials(fullName)}
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white"><BadgeCheck className="h-3.5 w-3.5" /></span>
              </div>
              <div className="min-w-0">
                {loadingProfile ? (
                  <div className="space-y-2" aria-label="Đang tải hồ sơ"><div className="h-6 w-48 animate-pulse rounded bg-gray-200" /><div className="h-4 w-60 max-w-full animate-pulse rounded bg-gray-100" /></div>
                ) : (
                  <><h2 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">{fullName || "Tài khoản Yufiz"}</h2><p className="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500"><Mail className="h-4 w-4 shrink-0" /> {email || "Chưa có email"}</p></>
                )}
                <div className="mt-3 flex max-w-xs items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-700" style={{ width: `${completion}%` }} /></div>
                  <span className="text-xs font-semibold text-gray-600">{completion}% hoàn thiện</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
              <Link to="/wallet" className="group rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-sm">
                <div className="mb-2 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><Wallet className="h-4.5 w-4.5" /></span><ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /></div>
                <p className="text-xs text-gray-500">Số dư ví</p><p className="mt-0.5 truncate text-base font-bold text-gray-900">{loadingProfile ? "—" : money(profile?.walletBalance)}</p>
              </Link>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm"><Coins className="h-4.5 w-4.5" /></span>
                <p className="text-xs text-gray-500">Điểm thưởng</p><p className="mt-0.5 text-base font-bold text-gray-900">{loadingProfile ? "—" : Number(profile?.loyaltyPoints || 0).toLocaleString("vi-VN")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-sm lg:sticky lg:top-24">
              <nav className="grid grid-cols-4 gap-1 lg:block lg:space-y-1" aria-label="Cài đặt tài khoản">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  return (
                    <button key={tab.id} type="button" aria-current={selected ? "page" : undefined} onClick={() => { setActiveTab(tab.id); setProfileNotice(null); setAddressNotice(null); setSecurityNotice(null); }} className={`group relative flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-all duration-200 lg:flex-row lg:gap-3 lg:px-3 lg:text-left ${selected ? "bg-orange-50 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                      {selected && <span className="absolute left-0 hidden h-6 w-1 rounded-r-full bg-primary lg:block" />}
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${selected ? "bg-white text-primary shadow-sm" : "bg-gray-50 text-gray-400 group-hover:bg-white"}`}><Icon className="h-4.5 w-4.5" /></span>
                      <span className="min-w-0"><span className="block text-[11px] font-semibold sm:text-xs lg:text-sm"><span className="lg:hidden">{tab.shortLabel}</span><span className="hidden lg:inline">{tab.label}</span></span><span className="mt-0.5 hidden text-xs text-gray-400 lg:block">{tab.description}</span></span>
                    </button>
                  );
                })}
              </nav>
              <div className="mx-2 my-3 hidden border-t border-gray-100 lg:block" />
              <Link to="/chat" className="mx-1 mb-1 hidden items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-primary lg:flex"><Headphones className="h-4.5 w-4.5" /><span><span className="block font-medium">Cần hỗ trợ?</span><span className="text-xs text-gray-400">Trò chuyện với Yufiz</span></span></Link>
            </div>
          </aside>

          <main className="min-w-0">
            <section key={activeTab} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <header className="flex items-start gap-3 border-b border-gray-100 px-5 py-5 sm:px-7"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary"><ActiveTabIcon className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-gray-900 sm:text-xl">{activeTabInfo.label}</h2><p className="mt-0.5 text-sm text-gray-500">{activeTabInfo.description}</p></div></header>

              {activeTab === "info" && (
                <div className="p-5 sm:p-7">
                  <NoticeBox notice={profileNotice} />
                  {loadingProfile ? (
                    <div className="grid gap-5 sm:grid-cols-2" aria-label="Đang tải thông tin cá nhân">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}</div>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Họ và tên</span><span className="relative block"><UserRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" /><input aria-label="Họ và tên" required value={fullName} onChange={(event) => setFullName(event.target.value)} className={fieldClass} placeholder="Nhập họ và tên" /></span></label>
                        <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Số điện thoại</span><span className="relative block"><Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" /><input aria-label="Số điện thoại" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} placeholder="Nhập số điện thoại" /></span></label>
                        <label className="block sm:col-span-2"><span className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">Email đăng nhập<span className="flex items-center gap-1 text-xs font-normal text-gray-400"><Lock className="h-3 w-3" /> Không thể thay đổi</span></span><span className="relative block"><Mail className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" /><input aria-label="Email đăng nhập" type="email" value={email} readOnly className={`${fieldClass} cursor-not-allowed bg-gray-100 text-gray-500 hover:border-gray-200`} /></span></label>
                      </div>
                      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-gray-400">Thông tin này được dùng để liên hệ và giao nhận đơn hàng.</p><Button type="submit" disabled={savingProfile} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm">{savingProfile ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{savingProfile ? "Đang lưu..." : "Lưu thay đổi"}</Button></div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "address" && (
                <div className="p-5 sm:p-7">
                  <NoticeBox notice={addressNotice} />
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-gray-500">Chọn địa chỉ để nhận hàng từ kho Yufiz.</p><Button size="sm" onClick={() => { setEditingAddress(null); setIsModalOpen(true); }} className="inline-flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Thêm địa chỉ</Button></div>
                  {loadingAddresses ? (
                    <div className="space-y-3" aria-label="Đang tải địa chỉ">{[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-gray-100" />)}</div>
                  ) : addresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm"><MapPin className="h-5 w-5" /></span><h3 className="mt-4 font-semibold text-gray-800">Chưa có địa chỉ giao hàng</h3><p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">Thêm địa chỉ để điền nhanh khi xác nhận đơn.</p><button type="button" onClick={() => { setEditingAddress(null); setIsModalOpen(true); }} className="mt-4 text-sm font-semibold text-primary hover:underline">Thêm địa chỉ đầu tiên</button></div>
                  ) : (
                    <div className="grid gap-3">
                      {addresses.map((address) => (
                        <article key={address.id} className={`group rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:p-5 ${address.isDefault ? "border-orange-200 bg-orange-50/40" : "border-gray-200 bg-white"}`}>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${address.isDefault ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}><MapPin className="h-4.5 w-4.5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-900">{address.fullName}</h3>{address.isDefault && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-primary">Mặc định</span>}</div><p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500"><Phone className="h-3.5 w-3.5" /> {address.phone}</p><p className="mt-1 text-sm leading-6 text-gray-600">{address.addressDetail}</p></div></div><div className="flex shrink-0 items-center gap-1 self-end sm:self-start"><button type="button" onClick={() => { setEditingAddress(address); setIsModalOpen(true); }} className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-primary hover:shadow-sm" aria-label={`Sửa địa chỉ của ${address.fullName}`}><Pencil className="h-4 w-4" /></button><button type="button" disabled={deletingAddressId === address.id} onClick={() => void handleDeleteAddress(address.id)} className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label={`Xóa địa chỉ của ${address.fullName}`}>{deletingAddressId === address.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div></div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "bank" && (
                <div className="p-5 sm:p-7"><div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-12 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm"><CreditCard className="h-6 w-6" /></span><h3 className="mt-4 text-base font-semibold text-gray-900">Chưa hỗ trợ lưu tài khoản ngân hàng</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Thông tin nhận tiền hoặc hoàn tiền sẽ được xác nhận riêng trong từng đơn hàng để đảm bảo an toàn.</p><Link to="/chat" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-200 hover:text-primary"><Headphones className="h-4 w-4" /> Liên hệ hỗ trợ</Link></div></div>
              )}

              {activeTab === "security" && (
                <div className="p-5 sm:p-7">
                  <NoticeBox notice={securityNotice} />
                  <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_260px]">
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                      {[
                        { name: "currentPassword", label: "Mật khẩu hiện tại", value: passwordData.currentPassword },
                        { name: "newPassword", label: "Mật khẩu mới", value: passwordData.newPassword },
                        { name: "confirmPassword", label: "Xác nhận mật khẩu mới", value: passwordData.confirmPassword },
                      ].map((field) => (
                        <label key={field.name} className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">{field.label}</span><span className="relative block"><KeyRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" /><input aria-label={field.label} required minLength={field.name === "currentPassword" ? undefined : 8} type={showPasswords ? "text" : "password"} name={field.name} value={field.value} onChange={(event) => setPasswordData((current) => ({ ...current, [event.target.name]: event.target.value }))} className={`${fieldClass} pr-11`} placeholder="••••••••" /><button type="button" onClick={() => setShowPasswords((current) => !current)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700" aria-label={showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPasswords ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}</button></span></label>
                      ))}
                      <Button type="submit" disabled={savingPassword} className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 text-sm sm:w-auto">{savingPassword ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}{savingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}</Button>
                    </form>
                    <aside className="h-fit rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm"><ShieldCheck className="h-5 w-5" /></span><h3 className="mt-4 font-semibold text-gray-900">Mật khẩu an toàn</h3><ul className="mt-3 space-y-2.5 text-xs leading-5 text-gray-600"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Tối thiểu 8 ký tự.</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Nên kết hợp chữ, số và ký tự đặc biệt.</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> Không sử dụng lại mật khẩu ở dịch vụ khác.</li></ul></aside>
                  </div>
                </div>
              )}
            </section>

            {profile?.referralCode && activeTab === "info" && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm animate-in fade-in duration-300"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><CircleDollarSign className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-xs text-gray-500">Mã giới thiệu của bạn</p><p className="truncate font-semibold tracking-wide text-gray-900">{profile.referralCode}</p></div><Link to="/referral" className="text-sm font-semibold text-primary hover:underline">Xem chi tiết</Link></div>
            )}
          </main>
        </div>
      </div>

      {isModalOpen && <AddressModal address={editingAddress} onClose={() => setIsModalOpen(false)} onSaveSuccess={() => { setIsModalOpen(false); setAddressNotice({ type: "success", text: editingAddress ? "Đã cập nhật địa chỉ giao hàng." : "Đã thêm địa chỉ giao hàng." }); void fetchAddresses(); }} />}
    </div>
  );
}
