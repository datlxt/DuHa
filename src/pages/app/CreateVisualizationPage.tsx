import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Select } from "../../components/common/Form";
import { getCustomers } from "../../services/customerService";
import { getTiles } from "../../services/tileService";
import { createProject } from "../../services/projectService";
import { uploadResultImage, uploadRoomImage, uploadTileImage } from "../../services/storageService";
import type { Customer, Project, Tile } from "../../types";
import { styleAdvice } from "../../lib/utils";
import { readableError } from "../../lib/env";
import { fileToPersistentPreview, generateMockTileRender } from "../../services/mockRenderService";

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}

export function CreateVisualizationPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [tileFile, setTileFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ project_name: "", customer_id: "", room_type: "Phòng khách", style: "Hiện đại", tile_id: "" });

  useEffect(() => {
    if (!user) return;
    setLoadingOptions(true);
    setLoadError("");
    void Promise.all([getCustomers(user.id), getTiles(user.id)])
      .then(([customerData, tileData]) => {
        setCustomers(customerData);
        setTiles(tileData);
      })
      .catch((caughtError) => {
        setLoadError(readableError(caughtError));
      })
      .finally(() => setLoadingOptions(false));
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || !roomFile) {
      setError("Vui lòng nhập thông tin và upload ảnh phòng mộc.");
      return;
    }
    setError("");
    setWarning("");
    setLoading(true);
    try {
      const selectedTile = tiles.find((tile) => tile.id === form.tile_id);
      if (!selectedTile && !tileFile) {
        setError("Vui lòng chọn mẫu gạch từ catalog hoặc upload ảnh mẫu gạch.");
        setLoading(false);
        return;
      }
      if (selectedTile && !selectedTile.image_url && !tileFile) {
        setError("Mẫu gạch trong catalog chưa có ảnh. Vui lòng upload ảnh mẫu gạch để tạo phối cảnh.");
        setLoading(false);
        return;
      }
      let roomUrl = "";
      let tileUrl = selectedTile?.image_url ?? null;
      let resultUrl = "";
      const uploadErrors: string[] = [];

      try {
        roomUrl = await uploadRoomImage(roomFile, user.id);
      } catch (caughtError) {
        roomUrl = await fileToPersistentPreview(roomFile);
        uploadErrors.push(`Ảnh phòng mộc chưa lưu được lên Supabase Storage: ${readableError(caughtError)}`);
      }

      if (tileFile) {
        try {
          tileUrl = await uploadTileImage(tileFile, user.id);
        } catch (caughtError) {
          tileUrl = await fileToPersistentPreview(tileFile);
          uploadErrors.push(`Ảnh mẫu gạch chưa lưu được lên Supabase Storage: ${readableError(caughtError)}`);
        }
      }

      const resultDataUrl = await generateMockTileRender(roomFile, tileFile ?? tileUrl ?? "");
      try {
        const resultFile = await dataUrlToFile(resultDataUrl, `${form.project_name || "duha"}-preview.jpg`);
        resultUrl = await uploadResultImage(resultFile, user.id);
      } catch (caughtError) {
        resultUrl = resultDataUrl;
        uploadErrors.push(`Ảnh phối cảnh chưa lưu được lên Supabase Storage: ${readableError(caughtError)}`);
      }

      const saved = await createProject(user.id, {
        ...form,
        customer_id: form.customer_id || null,
        tile_id: form.tile_id || null,
        room_image_url: roomUrl,
        tile_image_url: tileUrl,
        result_image_url: resultUrl,
        advice_text: styleAdvice(form.style),
        status: "Đã lưu",
      });
      setProject(saved);
      if (uploadErrors.length) {
        setWarning(
          `Dự án đã được tạo để bạn tiếp tục test core flow, nhưng ảnh đang dùng preview local. ${uploadErrors.join(" ")}`,
        );
      }
    } catch (caughtError) {
      setError(readableError(caughtError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Tạo phối cảnh mới</h1><p className="mt-2 text-muted">Upload ảnh phòng mộc, chọn mẫu gạch và phong cách để DuHa tạo preview minh họa.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        {["Thông tin dự án", "Ảnh phòng & mẫu gạch", "Phong cách", "Kết quả"].map((step, i) => <div className="card text-sm font-semibold" key={step}>{i + 1}. {step}</div>)}
      </div>
      <form onSubmit={submit} className="card grid gap-4 md:grid-cols-2">
        {loadError ? (
          <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Không thể tải khách hàng/catalog: {loadError}
          </div>
        ) : null}
        <div><label className="label">Tên dự án</label><Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required /></div>
        <div><label className="label">Khách hàng</label><Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}><option value="">{loadingOptions ? "Đang tải..." : customers.length ? "Chưa chọn" : "Chưa có khách hàng"}</option>{customers.map((c) => <option value={c.id} key={c.id}>{c.full_name}</option>)}</Select></div>
        <div><label className="label">Loại phòng</label><Select value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}><option>Phòng khách</option><option>Phòng ngủ</option><option>Phòng làm việc</option><option>Bếp</option></Select></div>
        <div><label className="label">Phong cách</label><Select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}><option>Hiện đại</option><option>Tối giản</option><option>Ấm áp</option><option>Sang trọng</option><option>Nhà phố Việt Nam</option></Select></div>
        <div><label className="label">Chọn gạch từ catalog</label><Select value={form.tile_id} onChange={(e) => setForm({ ...form, tile_id: e.target.value })}><option value="">{loadingOptions ? "Đang tải..." : tiles.length ? "Chưa chọn" : "Chưa có mẫu gạch"}</option>{tiles.map((t) => <option value={t.id} key={t.id}>{t.tile_code} · {t.tile_name}</option>)}</Select></div>
        <div><label className="label">Upload ảnh phòng mộc</label><Input type="file" accept="image/*" onChange={(e) => setRoomFile(e.target.files?.[0] ?? null)} required /></div>
        <div><label className="label">Upload ảnh mẫu gạch nếu chưa có catalog</label><Input type="file" accept="image/*" onChange={(e) => setTileFile(e.target.files?.[0] ?? null)} /></div>
        <div className="md:col-span-2"><Button disabled={loading}>{loading ? "DuHa đang phân tích phòng, mẫu gạch và phong cách..." : "✨ Tạo phối cảnh"}</Button></div>
        {warning ? <p className="md:col-span-2 text-sm text-amber-700">{warning}</p> : null}
        {error ? <p className="md:col-span-2 text-sm text-red-700">{error}</p> : null}
      </form>
      {project ? (
        <div className="card">
          <h2 className="text-xl font-bold text-burgundy">Đã lưu dự án</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <img className="h-48 w-full rounded-lg object-cover" src={project.room_image_url ?? ""} alt="Phòng gốc" />
            {project.tile_image_url ? (
              <img className="h-48 w-full rounded-lg object-cover" src={project.tile_image_url} alt="Mẫu gạch" />
            ) : (
              <div className="rounded-lg bg-beige p-6">Mẫu gạch đã chọn từ catalog</div>
            )}
            <img className="h-48 w-full rounded-lg object-cover" src={project.result_image_url ?? ""} alt="Kết quả mock" />
          </div>
          <p className="mt-4 text-muted">{project.advice_text}</p>
          <Link className="mt-4 inline-block rounded-lg bg-burgundy px-4 py-2 text-white" to={`/app/projects/${project.id}`}>Xem chi tiết dự án</Link>
        </div>
      ) : null}
    </div>
  );
}
