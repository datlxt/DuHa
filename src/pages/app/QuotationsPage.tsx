import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Select } from "../../components/common/Form";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";
import { getCustomers } from "../../services/customerService";
import { getProjects } from "../../services/projectService";
import { createQuotation, getQuotations } from "../../services/quotationService";
import { getTiles } from "../../services/tileService";
import type { Customer, Project, Quotation, Tile } from "../../types";
import { formatCurrency } from "../../lib/utils";

export function QuotationsPage() {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ customer_id: "", project_id: "", tile_id: "", area_m2: "", price_per_m2: "", status: "Nháp" });

  async function load() {
    if (!user) return;
    setLoading(true);
    Promise.all([getQuotations(user.id), getCustomers(user.id), getProjects(user.id), getTiles(user.id)])
      .then(([q, c, p, t]) => { setQuotations(q); setCustomers(c); setProjects(p); setTiles(t); })
      .catch(() => setError("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }
  useEffect(() => { void load(); }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const area = Number(form.area_m2 || 0);
    const price = Number(form.price_per_m2 || 0);
    await createQuotation(user.id, {
      customer_id: form.customer_id || null,
      project_id: form.project_id || null,
      tile_id: form.tile_id || null,
      area_m2: area,
      price_per_m2: price,
      total_price: area * price,
      status: form.status,
    });
    setMessage("Thêm thành công");
    await load();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Báo giá</h1><p className="mt-2 text-muted">Tạo và quản lý báo giá sơ bộ từ phối cảnh và mẫu gạch đã chọn.</p></div>
      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-4">
        <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}><option value="">Khách hàng</option>{customers.map((c) => <option value={c.id} key={c.id}>{c.full_name}</option>)}</Select>
        <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}><option value="">Dự án</option>{projects.map((p) => <option value={p.id} key={p.id}>{p.project_name}</option>)}</Select>
        <Select value={form.tile_id} onChange={(e) => {
          const tile = tiles.find((t) => t.id === e.target.value);
          setForm({ ...form, tile_id: e.target.value, price_per_m2: String(tile?.price_per_m2 ?? "") });
        }}><option value="">Mẫu gạch</option>{tiles.map((t) => <option value={t.id} key={t.id}>{t.tile_code}</option>)}</Select>
        <Input placeholder="Diện tích m²" type="number" value={form.area_m2} onChange={(e) => setForm({ ...form, area_m2: e.target.value })} />
        <Input placeholder="Giá/m²" type="number" value={form.price_per_m2} onChange={(e) => setForm({ ...form, price_per_m2: e.target.value })} />
        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Nháp</option><option>Đã gửi</option><option>Đã chốt</option></Select>
        <Button>Tạo báo giá</Button>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
      </form>
      {quotations.length === 0 ? <EmptyState title="Chưa có báo giá nào." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="p-3">Mã</th><th>Diện tích</th><th>Giá/m²</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>{quotations.map((q, index) => <tr className="border-t border-beige" key={q.id}><td className="p-3 font-semibold">BG-{String(index + 1).padStart(3, "0")}</td><td>{q.area_m2}m²</td><td>{formatCurrency(q.price_per_m2)}</td><td>{formatCurrency(q.total_price)}</td><td>{q.status}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
