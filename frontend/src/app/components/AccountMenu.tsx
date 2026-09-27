import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDown,
  CircleUserRound,
  Heart,
  LogOut,
  Package,
  RefreshCw,
  Sparkles,
  Wallet,
} from "lucide-react";
import api from "../utils/api";
import { getCurrentUser } from "../utils/auth";
import { money } from "../utils/commerce";

interface AccountProfile {
  fullName: string;
  email: string;
  walletBalance: number;
  loyaltyPoints: number;
}

interface AccountMenuProps {
  onLogout: () => void;
}

const profileLinks = [
  { to: "/profile", label: "Hồ sơ cá nhân", icon: CircleUserRound },
  { to: "/orders", label: "Đơn hàng của tôi", icon: Package },
  { to: "/wishlist", label: "Sản phẩm yêu thích", icon: Heart },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Y";
  return parts.slice(-2).map((part) => part[0]).join("").toUpperCase();
}

export function AccountMenu({ onLogout }: AccountMenuProps) {
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const lastLoadedAt = useRef(0);
  const localUser = getCurrentUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [profile, setProfile] = useState<AccountProfile | null>(null);

  const displayName = profile?.fullName || localUser?.fullName || "Tài khoản";
  const displayEmail = profile?.email || localUser?.email || "";

  const loadProfile = useCallback(async (force = false) => {
    if (!force && Date.now() - lastLoadedAt.current < 5_000) return;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await api.get<AccountProfile>("/user/profile");
      setProfile({
        fullName: response.data.fullName || localUser?.fullName || "Tài khoản",
        email: response.data.email || localUser?.email || "",
        walletBalance: Number(response.data.walletBalance) || 0,
        loyaltyPoints: Number(response.data.loyaltyPoints) || 0,
      });
      lastLoadedAt.current = Date.now();
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [localUser?.email, localUser?.fullName]);

  const showMenu = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setOpen(true);
    void loadProfile();
  };

  const hideMenuSoon = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const refreshBalance = () => {
      lastLoadedAt.current = 0;
      void loadProfile(true);
    };
    window.addEventListener("walletBalanceChange", refreshBalance);
    return () => window.removeEventListener("walletBalanceChange", refreshBalance);
  }, [loadProfile]);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative hidden md:block"
      onMouseEnter={showMenu}
      onMouseLeave={hideMenuSoon}
      onFocusCapture={showMenu}
      onBlurCapture={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) hideMenuSoon();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          (wrapperRef.current?.querySelector("button") as HTMLButtonElement | null)?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tài khoản của ${displayName}`}
        onClick={() => {
          setOpen((current) => !current);
          if (!open) void loadProfile();
        }}
        className={`group flex max-w-56 items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          open
            ? "border-primary/30 bg-orange-50 shadow-sm"
            : "border-transparent bg-muted/70 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-md"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          {initials(displayName)}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] font-medium text-muted-foreground">Xin chào</span>
          <span className="block truncate text-sm font-semibold text-foreground">{displayName}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[70] w-80 pt-2" role="menu" aria-label="Menu tài khoản">
          <div className="origin-top-right overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_20px_55px_-18px_rgba(124,45,18,0.35)] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-200/30" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-base font-bold text-white shadow-md shadow-orange-200">
                  {initials(displayName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{displayName}</p>
                  <p className="truncate text-xs text-gray-500">{displayEmail}</p>
                </div>
              </div>
            </div>

            <div className="px-3 pt-3">
              <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                      <Wallet className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Số dư ví Yufiz</p>
                      {loading && !profile ? (
                        <div className="mt-1 h-5 w-24 animate-pulse rounded bg-orange-200/70" aria-label="Đang tải số dư" />
                      ) : loadError && !profile ? (
                        <button type="button" onClick={() => void loadProfile(true)} className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600 hover:underline">
                          <RefreshCw className="h-3 w-3" /> Thử tải lại
                        </button>
                      ) : (
                        <p className="truncate text-lg font-bold text-gray-900">{money(profile?.walletBalance)}</p>
                      )}
                    </div>
                  </div>
                  <Link to="/wallet" role="menuitem" className="shrink-0 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600">
                    Nạp tiền
                  </Link>
                </div>
                {profile && profile.loyaltyPoints > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 border-t border-orange-100 pt-2 text-xs text-amber-700">
                    <Sparkles className="h-3.5 w-3.5" /> {profile.loyaltyPoints.toLocaleString("vi-VN")} điểm thưởng
                  </p>
                )}
              </div>
            </div>

            <div className="p-2">
              {profileLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-primary"
                >
                  <Icon className="h-4.5 w-4.5 text-gray-400 transition-colors group-hover:text-primary" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4.5 w-4.5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
