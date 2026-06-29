import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select } from "../../components/common/Form";
import { LoadingState } from "../../components/common/States";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Profile } from "../../types";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ full_name: "", role: "Chủ cửa hàng", store_name: "DuHa Tile Studio", phone: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      const profile = data as Profile | null;
      setForm({
        full_name: profile?.full_name ?? user.user_metadata.full_name ?? "",
        role: profile?.role ?? "Chủ cửa hàng",
        store_name: profile?.store_name ?? "DuHa Tile Studio",
        phone: profile?.phone ?? "",
      });
      setLoading(false);
    });
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...form });
    setMessage(error ? "Có lỗi xảy ra, vui lòng thử lại" : "Cập nhật thành công");
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Cài đặt</h1><p className="mt-2 text-muted">Quản lý tài khoản, cửa hàng và tích hợp.</p></div>
      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-2">
        <div><label className="label">Họ tên</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
        <div><label className="label">Email</label><Input value={user?.email ?? ""} disabled /></div>
        <div><label className="label">Vai trò</label><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>Chủ cửa hàng</option><option>Nhân viên bán hàng</option><option>Người đang xây nhà</option></Select></div>
        <div><label className="label">Tên cửa hàng</label><Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} /></div>
        <div><label className="label">Số điện thoại</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="md:col-span-2 flex flex-wrap gap-3"><Button>Lưu cài đặt</Button><button type="button" onClick={handleSignOut} className="rounded-lg border border-beige px-4 py-2 font-semibold text-burgundy">Đăng xuất</button></div>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
      </form>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><h3 className="font-bold">Gói đang sử dụng</h3><p className="text-muted">Gói Cửa hàng · 300 lượt/tháng · còn 172 lượt</p></div>
        <div className="card"><h3 className="font-bold">Thành viên nhân sự</h3><p className="text-muted">Đạt Lê - Owner · Nhân viên demo - Sales</p></div>
        <div className="card"><h3 className="font-bold">Tích hợp sau này</h3><p className="text-muted">OpenAI API, Zalo, Payment đang disabled.</p></div>
      </div>
    </div>
  );
}
