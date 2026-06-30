import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Download, FileText, RefreshCw, Save, Sparkles, Upload } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Select, Textarea } from "../../components/common/Form";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { getCustomers } from "../../services/customerService";
import { createProject } from "../../services/projectService";
import { generateVisualization } from "../../services/aiGenerationService";
import { uploadRoomImage, uploadTileImage } from "../../services/storageService";
import { getTiles } from "../../services/tileService";
import { readableError } from "../../lib/env";
import type { Customer, Project, Tile } from "../../types";

type RenderMode = "tile_only" | "full_design";
type AdviceKey = "wall" | "furniture" | "lighting" | "construction";

const tileSizeOptions = [
  "15x80",
  "15x90",
  "20x100",
  "20x120",
  "30x60",
  "40x80",
  "60x60",
  "60x120",
  "75x150",
  "80x80",
  "90x90",
  "100x100",
  "120x120",
];

const tileSurfaceOptions = ["Mờ", "Mát", "Bóng", "Nhám", "Men matt", "Men bóng", "Sugar", "Lappato", "Vân đá", "Vân gỗ"];

const adviceLabels: Record<AdviceKey, string> = {
  wall: "Màu tường gợi ý",
  furniture: "Nội thất gợi ý",
  lighting: "Ánh sáng gợi ý",
  construction: "Lưu ý thi công",
};

const adviceDefaults: Record<AdviceKey, string> = {
  wall: "Trắng kem, ghi nhạt hoặc be sáng để làm nổi màu và vân gạch.",
  furniture: "Sofa be/xám sáng, bàn trà gỗ hoặc kính, decor tiết chế để không gian thoáng.",
  lighting: "Đèn vàng 3000K-3500K, kết hợp ánh sáng trần và đèn điểm nhẹ.",
  construction: "Canh hướng vân gạch, ron 2mm-3mm, chọn màu ron gần tone nền.",
};

function createPreview(file: File | null) {
  if (!file) return "";
  return URL.createObjectURL(file);
}

function parseAdvice(text?: string | null): Record<AdviceKey, string> {
  const sections = { ...adviceDefaults };
  if (!text) return sections;

  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = rawKey.trim().toUpperCase();
    if (!value) continue;
    if (key === "MAU_TUONG") sections.wall = value;
    if (key === "NOI_THAT") sections.furniture = value;
    if (key === "ANH_SANG") sections.lighting = value;
    if (key === "THI_CONG") sections.construction = value;
  }

  if (lines.length === 1 && !lines[0].includes(":")) sections.wall = lines[0];
  return sections;
}

function buildDraftAdvice(style: string, roomType: string, renderMode: RenderMode) {
  if (renderMode === "full_design") {
    return [
      `MAU_TUONG: ${style === "Sang trọng" ? "Trắng ngà, ghi sáng hoặc greige" : "Trắng kem, ghi nhạt hoặc be sáng"} để phòng thô sáng và dễ phối gạch.`,
      `NOI_THAT: Bố trí ${roomType.toLowerCase()} với nội thất trung tính, gỗ ấm, rèm mềm và decor vừa đủ để giữ cảm giác hoàn thiện.`,
      "ANH_SANG: Dùng ánh sáng vàng 3000K-3500K, thêm đèn điểm để mặt gạch có chiều sâu.",
      "THI_CONG: Lát đúng hướng vân gạch, giữ ron đều 2mm-3mm và chọn ron gần tone gạch.",
    ].join("\n");
  }

  return [
    "MAU_TUONG: Giữ tường sáng như trắng kem hoặc ghi nhạt để không làm sai màu gạch.",
    "NOI_THAT: Giữ nội thất hiện có, chỉ thêm decor nhẹ nếu cần để tránh che mất nền gạch.",
    "ANH_SANG: Cân bằng ánh sáng trung tính/vàng ấm để bề mặt gạch không bị ám xanh.",
    "THI_CONG: Kiểm tra nền phẳng, canh ron và hướng vân trước khi lát đại trà.",
  ].join("\n");
}

function tileScore(tile: Tile, selectedTile: Tile | undefined, form: { style: string; room_type: string }) {
  let score = 0;
  const color = tile.main_color?.toLowerCase() ?? "";
  const selectedColor = selectedTile?.main_color?.toLowerCase() ?? "";
  if (tile.image_url) score += 2;
  if (selectedColor && color.includes(selectedColor)) score += 3;
  if (["trắng", "kem", "ghi", "be"].some((keyword) => color.includes(keyword))) score += 1;
  if (form.style === "Sang trọng" && ["bóng", "polished"].some((keyword) => tile.surface?.toLowerCase().includes(keyword))) score += 1;
  if (form.room_type === "Phòng khách" && tile.size?.includes("80")) score += 1;
  return score;
}

function FilePreview({
  label,
  src,
  emptyText,
}: {
  label: string;
  src?: string | null;
  emptyText: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-burgundy">{label}</p>
      {src ? (
        <ImageWithFallback className="h-44 w-full rounded-lg object-cover" src={src} alt={label} fallbackLabel={emptyText} />
      ) : (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-beige bg-cream text-sm text-muted">
          {emptyText}
        </div>
      )}
    </div>
  );
}

export function CreateVisualizationPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [tileFile, setTileFile] = useState<File | null>(null);
  const [roomPreview, setRoomPreview] = useState("");
  const [tilePreview, setTilePreview] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    project_name: "",
    customer_id: "",
    room_type: "Phòng khách",
    style: "Hiện đại",
    render_mode: "tile_only" as RenderMode,
    tile_id: "",
    tile_code_text: "",
    tile_size_text: "",
    tile_color_text: "",
    tile_surface_text: "",
  });

  const selectedTile = useMemo(() => tiles.find((tile) => tile.id === form.tile_id), [form.tile_id, tiles]);
  const resultAdvice = parseAdvice(project?.advice_text ?? buildDraftAdvice(form.style, form.room_type, form.render_mode));
  const tileSource = tilePreview || selectedTile?.image_url || "";
  const suggestedTiles = useMemo(() => {
    return [...tiles]
      .filter((tile) => tile.id !== form.tile_id)
      .sort((a, b) => tileScore(b, selectedTile, form) - tileScore(a, selectedTile, form))
      .slice(0, 3);
  }, [form, selectedTile, tiles]);

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

  useEffect(() => {
    const url = createPreview(roomFile);
    setRoomPreview(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [roomFile]);

  useEffect(() => {
    const url = createPreview(tileFile);
    setTilePreview(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [tileFile]);

  useEffect(() => {
    if (!selectedTile) return;
    setForm((current) => ({
      ...current,
      tile_code_text: selectedTile.tile_code ?? "",
      tile_size_text: selectedTile.size ?? "",
      tile_color_text: selectedTile.main_color ?? "",
      tile_surface_text: selectedTile.surface ?? "",
    }));
  }, [selectedTile]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || !roomFile) {
      setError("Vui lòng upload ảnh phòng mộc trước khi tạo phối cảnh.");
      return;
    }

    setError("");
    setStatusMessage("");
    setLoading(true);

    try {
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

      setStatusMessage("Đang tải ảnh phòng và mẫu gạch lên Supabase Storage...");
      const roomUrl = await uploadRoomImage(roomFile, user.id);
      const tileUrl = tileFile ? await uploadTileImage(tileFile, user.id) : selectedTile?.image_url ?? null;

      setStatusMessage("Đang tạo dự án và chuẩn bị gọi AI...");
      const saved = await createProject(user.id, {
        ...form,
        customer_id: form.customer_id || null,
        tile_id: form.tile_id || null,
        tile_code_text: form.tile_code_text || selectedTile?.tile_code || null,
        tile_size_text: form.tile_size_text || selectedTile?.size || null,
        tile_color_text: form.tile_color_text || selectedTile?.main_color || null,
        tile_surface_text: form.tile_surface_text || selectedTile?.surface || null,
        room_image_url: roomUrl,
        tile_image_url: tileUrl,
        result_image_url: null,
        advice_text: buildDraftAdvice(form.style, form.room_type, form.render_mode),
        generation_status: "processing",
        generation_error: null,
        ai_model: "gpt-image-2",
        generated_at: null,
        status: "Đang render AI",
      });

      setProject(saved);
      setStatusMessage(
        form.render_mode === "full_design"
          ? "AI đang hoàn thiện nội thất, lát gạch và render phối cảnh. Vui lòng chờ..."
          : "AI đang thay gạch nền và giữ nguyên không gian hiện có. Vui lòng chờ...",
      );
      const generated = await generateVisualization(saved.id);
      setProject(generated);
      setStatusMessage("Đã render AI thành công.");
    } catch (caughtError) {
      setError(readableError(caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    if (!project) return;
    setLoading(true);
    setError("");
    setStatusMessage("Đang tạo phương án khác từ cùng ảnh phòng và mẫu gạch...");
    try {
      const generated = await generateVisualization(project.id);
      setProject(generated);
      setStatusMessage("Đã tạo phương án mới.");
    } catch (caughtError) {
      setError(readableError(caughtError));
    } finally {
      setLoading(false);
    }
  }

  const roomStepDone = Boolean(roomPreview || project?.room_image_url);
  const tileStepDone = Boolean(tileSource || project?.tile_image_url);
  const styleStepDone = roomStepDone && tileStepDone && Boolean(form.style && form.render_mode);
  const resultStepDone = Boolean(project?.result_image_url);
  const steps = [
    { label: "Tải ảnh phòng", done: roomStepDone },
    { label: "Tải ảnh mẫu gạch", done: tileStepDone },
    { label: "Chọn phong cách", done: styleStepDone },
    { label: "Xem kết quả", done: resultStepDone },
  ];
  const activeStepIndex = Math.max(steps.findIndex((step) => !step.done), 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="card h-fit">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Quy trình</p>
        <div className="mt-5 space-y-4">
          {steps.map((step, index) => (
            <div className="flex items-center gap-3" key={step.label}>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  step.done
                    ? "bg-burgundy text-white"
                    : index === activeStepIndex
                      ? "border border-burgundy bg-white text-burgundy"
                      : "bg-cream text-muted"
                }`}
              >
                {step.done ? <Check size={16} /> : index + 1}
              </span>
              <span className={step.done || index === activeStepIndex ? "font-semibold text-ink" : "text-muted"}>{step.label}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="space-y-6">
        <div>
          <h1 className="font-serif text-4xl font-bold">Tạo phối cảnh mới</h1>
          <p className="mt-2 text-muted">
            Upload phòng mộc, mẫu gạch và chọn mục tiêu AI. DuHa sẽ render ảnh và gợi ý phối nội thất phù hợp.
          </p>
        </div>

        <form onSubmit={submit} className="card grid gap-5 lg:grid-cols-[1fr_230px]">
          {loadError ? (
            <div className="lg:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Không thể tải khách hàng/catalog: {loadError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Tên dự án</label>
              <Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Loại phòng</label>
              <Select value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}>
                <option>Phòng khách</option>
                <option>Phòng ngủ</option>
                <option>Phòng làm việc</option>
                <option>Bếp</option>
              </Select>
            </div>
            <div>
              <label className="label">Khách hàng</label>
              <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">{loadingOptions ? "Đang tải..." : customers.length ? "Chưa chọn" : "Chưa có khách hàng"}</option>
                {customers.map((customer) => (
                  <option value={customer.id} key={customer.id}>{customer.full_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="label">Mục tiêu AI</label>
              <Select value={form.render_mode} onChange={(e) => setForm({ ...form, render_mode: e.target.value as RenderMode })}>
                <option value="tile_only">Chỉ thay gạch nền</option>
                <option value="full_design">Hoàn thiện nội thất phòng mộc</option>
              </Select>
            </div>

            <label className="group relative h-44 cursor-pointer overflow-hidden rounded-lg border border-dashed border-beige bg-cream">
              {roomPreview ? <img className="h-full w-full object-cover" src={roomPreview} alt="Ảnh phòng mộc" /> : <span className="flex h-full items-center justify-center gap-2 text-sm text-muted"><Upload size={18} /> Tải ảnh phòng mộc</span>}
              {roomPreview ? <span className="absolute right-3 top-3 rounded-full bg-burgundy px-3 py-1 text-xs font-semibold text-white">Đã tải</span> : null}
              <input className="sr-only" type="file" accept="image/*" onChange={(e) => setRoomFile(e.target.files?.[0] ?? null)} required />
            </label>

            <label className="group relative h-44 cursor-pointer overflow-hidden rounded-lg border border-dashed border-beige bg-cream">
              {tileSource ? <img className="h-full w-full object-cover" src={tileSource} alt="Ảnh mẫu gạch" /> : <span className="flex h-full items-center justify-center gap-2 text-sm text-muted"><Upload size={18} /> Tải ảnh mẫu gạch</span>}
              {tileSource ? <span className="absolute right-3 top-3 rounded-full bg-burgundy px-3 py-1 text-xs font-semibold text-white">Đã tải</span> : null}
              <input className="sr-only" type="file" accept="image/*" onChange={(e) => setTileFile(e.target.files?.[0] ?? null)} />
            </label>

            <div>
              <label className="label">Chọn gạch từ catalog</label>
              <Select
                value={form.tile_id}
                onChange={(e) => {
                  const tile = tiles.find((item) => item.id === e.target.value);
                  setForm({
                    ...form,
                    tile_id: e.target.value,
                    tile_code_text: tile?.tile_code ?? "",
                    tile_size_text: tile?.size ?? "",
                    tile_color_text: tile?.main_color ?? "",
                    tile_surface_text: tile?.surface ?? "",
                  });
                }}
              >
                <option value="">{loadingOptions ? "Đang tải..." : tiles.length ? "Upload mẫu mới hoặc chọn catalog" : "Chưa có mẫu gạch"}</option>
                {tiles.map((tile) => (
                  <option value={tile.id} key={tile.id}>{tile.tile_code} · {tile.tile_name}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div><label className="label">Mã gạch</label><Input value={form.tile_code_text} placeholder="DUHA-8012" onChange={(e) => setForm({ ...form, tile_code_text: e.target.value })} /></div>
              <div>
                <label className="label">Kích thước thực tế</label>
                <Select value={form.tile_size_text} onChange={(e) => setForm({ ...form, tile_size_text: e.target.value })}>
                  <option value="">Chọn khổ gạch</option>
                  {tileSizeOptions.map((size) => <option value={size} key={size}>{size}</option>)}
                </Select>
              </div>
              <div>
                <label className="label">Bề mặt</label>
                <Select value={form.tile_surface_text} onChange={(e) => setForm({ ...form, tile_surface_text: e.target.value })}>
                  <option value="">Chọn bề mặt</option>
                  {tileSurfaceOptions.map((surface) => <option value={surface} key={surface}>{surface}</option>)}
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-beige bg-cream p-4">
            <label className="label flex items-center gap-2 text-burgundy"><Sparkles size={16} /> Phong cách</label>
            <Select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
              <option>Hiện đại</option>
              <option>Tối giản</option>
              <option>Ấm áp</option>
              <option>Sang trọng</option>
              <option>Nhà phố Việt Nam</option>
            </Select>
            <p className="mt-4 text-sm text-muted">
              Với phòng mộc, AI sẽ thêm nội thất phù hợp. Với phòng đã có đồ, AI chỉ thay nền để giữ đúng hiện trạng.
            </p>
            <Button className="mt-6 flex w-full items-center justify-center gap-2" disabled={loading}>
              <Sparkles size={16} />
              {loading ? "Đang render..." : "Tạo phối cảnh"}
            </Button>
          </div>

          {statusMessage ? <p className="lg:col-span-2 text-sm text-amber-700">{statusMessage}</p> : null}
          {error ? <p className="lg:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </form>

        <section className="card">
          <div className="grid gap-4 lg:grid-cols-3">
            <FilePreview label="Phòng mộc" src={project?.room_image_url ?? roomPreview} emptyText="Chưa có ảnh phòng" />
            <FilePreview label="Mẫu gạch" src={project?.tile_image_url ?? tileSource} emptyText="Chưa có mẫu gạch" />
            <FilePreview label="Phối cảnh DuHa" src={project?.result_image_url} emptyText="AI đang render hoặc chưa có kết quả" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(adviceLabels) as AdviceKey[]).map((key) => (
                <div className="rounded-lg border border-beige bg-cream p-4" key={key}>
                  <p className="text-xs font-bold uppercase tracking-wide text-burgundy">{adviceLabels[key]}</p>
                  <p className="mt-2 text-sm text-ink">{resultAdvice[key]}</p>
                </div>
              ))}
            </div>
            <Textarea
              className="min-h-48"
              placeholder="Ghi chú cho khách hàng..."
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
            />
          </div>

          {suggestedTiles.length ? (
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-burgundy">Mẫu gạch AI gợi ý từ catalog</p>
              <div className="grid gap-3 md:grid-cols-3">
                {suggestedTiles.map((tile) => (
                  <button
                    className="rounded-lg border border-beige bg-white p-3 text-left transition hover:border-burgundy"
                    key={tile.id}
                    type="button"
                    onClick={() => setForm({
                      ...form,
                      tile_id: tile.id,
                      tile_code_text: tile.tile_code ?? "",
                      tile_size_text: tile.size ?? "",
                      tile_color_text: tile.main_color ?? "",
                      tile_surface_text: tile.surface ?? "",
                    })}
                  >
                    <ImageWithFallback className="h-24 w-full rounded-md object-cover" src={tile.image_url} alt={tile.tile_name} fallbackLabel="Chưa có ảnh" />
                    <p className="mt-2 text-sm font-semibold">{tile.tile_code}</p>
                    <p className="text-xs text-muted">{tile.tile_name} · {tile.size ?? "Chưa rõ size"}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white" type="button">
              <Save size={16} /> Lưu dự án
            </button>
            {project?.result_image_url ? (
              <a className="flex items-center gap-2 rounded-lg border border-beige px-4 py-2 text-sm font-semibold text-burgundy" href={project.result_image_url} download>
                <Download size={16} /> Tải ảnh
              </a>
            ) : null}
            <button
              className="flex items-center gap-2 rounded-lg border border-beige px-4 py-2 text-sm font-semibold text-burgundy disabled:opacity-60"
              disabled={!project || loading}
              onClick={() => void regenerate()}
              type="button"
            >
              <RefreshCw size={16} /> Tạo phương án khác
            </button>
            <Link className="ml-auto flex items-center gap-2 rounded-lg border border-beige px-4 py-2 text-sm font-semibold text-burgundy" to="/app/quotations">
              <FileText size={16} /> Tạo báo giá
            </Link>
            {project ? <Link className="rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white" to={`/app/projects/${project.id}`}>Xem chi tiết</Link> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
