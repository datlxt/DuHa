import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Select, Textarea } from "../../components/common/Form";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";
import { createTile, getTiles } from "../../services/tileService";
import { uploadTileImage } from "../../services/storageService";
import type { Tile } from "../../types";
import { formatCurrency } from "../../lib/utils";

export function CatalogPage() {
  const { user } = useAuth();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ tile_code: "", tile_name: "", size: "80x80", surface: "Bóng", main_color: "Trắng", price_per_m2: "", stock_m2: "", notes: "" });

  async function load() {
    if (!user) return;
    setLoading(true);
    getTiles(user.id).then(setTiles).catch(() => setError("Không thể tải dữ liệu")).finally(() => setLoading(false));
  }
  useEffect(() => { void load(); }, [user]);

  const filtered = useMemo(() => tiles.filter((tile) => `${tile.tile_code} ${tile.tile_name} ${tile.main_color}`.toLowerCase().includes(query.toLowerCase())), [tiles, query]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    const imageUrl = file ? await uploadTileImage(file, user.id) : null;
    await createTile(user.id, {
      ...form,
      image_url: imageUrl,
      price_per_m2: Number(form.price_per_m2 || 0),
      stock_m2: Number(form.stock_m2 || 0),
    });
    setMessage("Thêm thành công");
    setForm({ tile_code: "", tile_name: "", size: "80x80", surface: "Bóng", main_color: "Trắng", price_per_m2: "", stock_m2: "", notes: "" });
    setFile(null);
    await load();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Catalog gạch</h1><p className="mt-2 text-muted">Quản lý mẫu gạch của cửa hàng để tư vấn và tạo phối cảnh nhanh hơn.</p></div>
      <form onSubmit={submit} className="card grid gap-3 md:grid-cols-4">
        <Input placeholder="Mã gạch" value={form.tile_code} onChange={(e) => setForm({ ...form, tile_code: e.target.value })} required />
        <Input placeholder="Tên gạch" value={form.tile_name} onChange={(e) => setForm({ ...form, tile_name: e.target.value })} required />
        <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}><option>60x60</option><option>80x80</option><option>60x120</option><option>90x90</option></Select>
        <Select value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })}><option>Bóng</option><option>Mờ</option></Select>
        <Input placeholder="Màu chủ đạo" value={form.main_color} onChange={(e) => setForm({ ...form, main_color: e.target.value })} />
        <Input placeholder="Giá/m²" type="number" value={form.price_per_m2} onChange={(e) => setForm({ ...form, price_per_m2: e.target.value })} />
        <Input placeholder="Tồn kho m²" type="number" value={form.stock_m2} onChange={(e) => setForm({ ...form, stock_m2: e.target.value })} />
        <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Textarea placeholder="Ghi chú" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button>Thêm mẫu gạch</Button>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
      </form>
      <Input placeholder="Tìm mã gạch, tên gạch..." value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.length === 0 ? <EmptyState title="Chưa có mẫu gạch nào. Hãy thêm mẫu gạch đầu tiên." /> : (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((tile) => (
            <div className="card" key={tile.id}>
              {tile.image_url ? <img className="h-40 w-full rounded-lg object-cover" src={tile.image_url} alt={tile.tile_name} /> : <div className="h-40 rounded-lg bg-beige" />}
              <p className="mt-3 font-bold text-burgundy">{tile.tile_code}</p>
              <h3 className="font-semibold">{tile.tile_name}</h3>
              <p className="text-sm text-muted">{tile.size} · {tile.surface} · {tile.main_color}</p>
              <p className="mt-2 text-sm">{formatCurrency(tile.price_per_m2)}/m² · Tồn kho {tile.stock_m2 ?? 0}m²</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
