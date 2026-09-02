import { Bell, HelpCircle, LogOut, Menu, Search } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { DuHaLogo } from "../brand/DuHaLogo";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

const items = [
  ["Tổng quan", "/app"],
  ["DuHa AI", "/app/create"],
  ["Dự án đã lưu", "/app/projects"],
  ["Catalog gạch", "/app/catalog"],
  ["Khách hàng", "/app/customers"],
  ["Báo giá", "/app/quotations"],
  ["Cài đặt", "/app/settings"],
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-72 border-r border-beige bg-white p-5 transition md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <DuHaLogo />
        <nav className="mt-8 space-y-2">
          {items.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                "block rounded-lg px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "border border-burgundy/20 bg-burgundy/10 text-burgundy"
                  : "text-muted hover:bg-ivory hover:text-burgundy",
              )}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-beige bg-ivory p-4">
          <p className="font-semibold text-burgundy">Gói Cửa hàng</p>
          <p className="mt-1 text-sm text-muted">Còn 172 lượt phối cảnh tháng này</p>
          <button className="mt-3 rounded-lg bg-burgundy px-3 py-2 text-sm text-white">Nâng cấp</button>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-beige bg-white/90 px-4 backdrop-blur">
          <button className="rounded-lg border border-beige p-2 md:hidden" onClick={() => setOpen(!open)}>
            <Menu size={18} />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-beige bg-ivory px-3 py-2">
            <Search size={18} className="text-muted" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Tìm dự án, khách hàng, mã gạch..." />
          </div>
          <Bell size={19} className="text-muted" />
          <HelpCircle size={19} className="text-muted" />
          <div className="hidden text-right text-sm sm:block">
            <p className="font-semibold">{user?.user_metadata.full_name ?? user?.email}</p>
            <p className="text-muted">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="rounded-lg border border-beige p-2 text-muted hover:text-burgundy" title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
