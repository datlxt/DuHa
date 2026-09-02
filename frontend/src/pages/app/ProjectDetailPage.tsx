import { useEffect, useState } from "react";
import { Download, FileText, Send, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProjectById } from "../../services/projectService";
import type { Project } from "../../types";
import { ErrorState, LoadingState } from "../../components/common/States";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { readableError } from "../../lib/env";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";

type Advice = {
  wall: string;
  furniture: string;
  lighting: string;
  construction: string;
};

function parseAdvice(text?: string | null): Advice {
  const fallback = {
    wall: "Ưu tiên tường sáng, trung tính để làm nổi bật mẫu gạch.",
    furniture: "Chọn nội thất đúng công năng phòng, tiết chế để không che mất nền gạch.",
    lighting: "Dùng ánh sáng trung tính hoặc vàng ấm để bề mặt gạch lên màu tự nhiên.",
    construction: "Lát đúng khổ gạch, đúng hướng vân và kiểm tra ron trước khi thi công.",
  };
  if (!text) return fallback;
  try {
    return { ...fallback, ...JSON.parse(text) };
  } catch {
    const next = { ...fallback };
    for (const line of text.split(/\n+/)) {
      const [key, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      if (!value) continue;
      if (key.trim().toUpperCase() === "MAU_TUONG") next.wall = value;
      if (key.trim().toUpperCase() === "NOI_THAT") next.furniture = value;
      if (key.trim().toUpperCase() === "ANH_SANG") next.lighting = value;
      if (key.trim().toUpperCase() === "THI_CONG") next.construction = value;
    }
    return next;
  }
}

function exportCustomerPackage(project: Project, advice: Advice) {
  const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${project.project_name} - Showroom Dũng Hậu</title>
  <style>
    body { font-family: Arial, sans-serif; color: #241a1a; margin: 32px; background: #faf6ef; }
    h1 { color: #8b0015; margin-bottom: 4px; }
    .muted { color: #6d5d5d; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: #fff; border: 1px solid #ead8c4; border-radius: 10px; padding: 14px; }
    img { width: 100%; height: 260px; object-fit: cover; border-radius: 8px; }
    .label { color: #8b0015; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: .04em; }
    .advice { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    @media (max-width: 800px) { .grid, .advice { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>${project.project_name}</h1>
  <p class="muted">Showroom Dũng Hậu · DuHa AI · ${project.room_type ?? ""} · ${project.style ?? ""}</p>
  <div class="grid">
    <div class="card"><p class="label">Phòng mộc</p><img src="${project.room_image_url ?? ""}" /></div>
    <div class="card"><p class="label">Mẫu gạch</p><img src="${project.tile_image_url ?? ""}" /></div>
    <div class="card"><p class="label">Phối cảnh hoàn thiện</p><img src="${project.result_image_url ?? ""}" /></div>
  </div>
  <div class="advice">
    <div class="card"><p class="label">Màu tường gợi ý</p><p>${advice.wall}</p></div>
    <div class="card"><p class="label">Nội thất gợi ý</p><p>${advice.furniture}</p></div>
    <div class="card"><p class="label">Ánh sáng gợi ý</p><p>${advice.lighting}</p></div>
    <div class="card"><p class="label">Lưu ý thi công</p><p>${advice.construction}</p></div>
  </div>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.project_name || "duha-phoi-canh"}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProjectById(id).then(setProject).catch((caughtError) => setError(readableError(caughtError))).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!project) return;
    setDeleting(true);
    setError("");
    try {
      await deleteProject(project.id);
      navigate("/app/projects");
    } catch (caughtError) {
      setError(readableError(caughtError));
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!project) return <ErrorState message="Không tìm thấy dự án trong app." />;

  const advice = parseAdvice(project.advice_text);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chi tiết dự án</h1>
        <p className="mt-2 text-muted">{project.project_name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ImageWithFallback className="h-64 w-full rounded-xl object-cover" src={project.room_image_url} alt="Phòng mộc" fallbackLabel="Chưa có ảnh phòng" />
        <ImageWithFallback className="h-64 w-full rounded-xl object-cover" src={project.tile_image_url} alt="Mẫu gạch" fallbackLabel="Chưa có ảnh gạch" />
        <ImageWithFallback className="h-64 w-full rounded-xl object-cover" src={project.result_image_url} alt="Phối cảnh hoàn thiện" fallbackLabel="Chưa có kết quả" />
      </div>

      <div className="card">
        <p><b>Loại phòng:</b> {project.room_type}</p>
        <p><b>Phong cách:</b> {project.style}</p>
        <p><b>Chế độ AI:</b> {project.render_mode === "full_design" ? "Hoàn thiện nội thất" : "Chỉ thay gạch nền"}</p>
        <p><b>Trạng thái:</b> {project.status}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-beige bg-cream p-4"><p className="text-xs font-bold uppercase text-burgundy">Màu tường gợi ý</p><p className="mt-2 text-sm">{advice.wall}</p></div>
          <div className="rounded-lg border border-beige bg-cream p-4"><p className="text-xs font-bold uppercase text-burgundy">Nội thất gợi ý</p><p className="mt-2 text-sm">{advice.furniture}</p></div>
          <div className="rounded-lg border border-beige bg-cream p-4"><p className="text-xs font-bold uppercase text-burgundy">Ánh sáng gợi ý</p><p className="mt-2 text-sm">{advice.lighting}</p></div>
          <div className="rounded-lg border border-beige bg-cream p-4"><p className="text-xs font-bold uppercase text-burgundy">Lưu ý thi công</p><p className="mt-2 text-sm">{advice.construction}</p></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.result_image_url ? (
            <a className="flex items-center gap-2 rounded-lg bg-burgundy px-4 py-2 text-white" href={project.result_image_url} download>
              <Download size={16} /> Tải ảnh phối cảnh
            </a>
          ) : null}
          <button className="flex items-center gap-2 rounded-lg border border-beige px-4 py-2 text-burgundy" onClick={() => exportCustomerPackage(project, advice)}>
            <Send size={16} /> Xuất bộ gửi khách
          </button>
          <Link className="flex items-center gap-2 rounded-lg border border-beige px-4 py-2 text-burgundy" to="/app/quotations">
            <FileText size={16} /> Tạo báo giá
          </Link>
          <button
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            disabled={deleting}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 size={16} /> {deleting ? "Đang xoá..." : "Xoá dự án"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xoá dự án?"
        description={`Dự án "${project.project_name}" sẽ bị xoá khỏi danh sách đã lưu. Thao tác này không thể hoàn tác.`}
        confirmLabel="Xoá dự án"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
