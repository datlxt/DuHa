import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Select, Textarea } from "../../components/common/Form";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";
import { createCustomer, getCustomers } from "../../services/customerService";
import type { Customer } from "../../types";
import { formatCurrency } from "../../lib/utils";

export function CustomersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", need: "", budget: "", status: "Mới", notes: "" });

  async function load() {
    if (!user) return;
    setLoading(true);
    getCustomers(user.id).then(setItems).catch(() => setError("Không thể tải dữ liệu")).finally(() => setLoading(false));
  }

  useEffect(() => { void load(); }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setMessage("");
    await createCustomer(user.id, { ...form, budget: Number(form.budget || 0) });
    setForm({ full_name: "", phone: "", need: "", budget: "", status: "Mới", notes: "" });
    setMessage("Thêm thành công");
    await load();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Khách hàng</h1><p className="mt-2 text-muted">Quản lý khách hàng đang tư vấn phối cảnh và báo giá.</p></div>
      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-3">
        <Input placeholder="Họ tên" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <Input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="Ngân sách dự kiến" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        <Input placeholder="Nhu cầu" value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })} />
        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Mới</option><option>Đang tư vấn</option><option>Đã gửi phối cảnh</option><option>Đã chốt</option></Select>
        <Textarea placeholder="Ghi chú" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button>Thêm khách hàng</Button>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
      </form>
      {items.length === 0 ? <EmptyState title="Chưa có khách hàng nào. Hãy thêm khách hàng đầu tiên." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted"><tr><th className="p-3">Họ tên</th><th>Điện thoại</th><th>Nhu cầu</th><th>Ngân sách</th><th>Trạng thái</th></tr></thead>
            <tbody>{items.map((c) => <tr className="border-t border-beige" key={c.id}><td className="p-3 font-semibold">{c.full_name}</td><td>{c.phone}</td><td>{c.need}</td><td>{formatCurrency(c.budget)}</td><td>{c.status}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
