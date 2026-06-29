import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteProject, getProjectById } from "../../services/projectService";
import type { Project } from "../../types";
import { ErrorState, LoadingState } from "../../components/common/States";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { readableError } from "../../lib/env";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";

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

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Chi tiết dự án</h1><p className="mt-2 text-muted">{project.project_name}</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <ImageWithFallback className="h-64 w-full rounded-xl object-cover" src={project.room_image_url} alt="Phòng gốc" fallbackLabel="Chưa có ảnh phòng" />
        <ImageWithFallback className="h-64 w-full rounded-xl object-cover" src={project.tile_image_url} alt="Mẫu gạch" fallbackLabel="Chưa có ảnh gạch" />
        <ImageWithFallback className="h-64 w-full rounded-xl object-cover" src={project.result_image_url} alt="Kết quả" fallbackLabel="Chưa có kết quả" />
      </div>
      <div className="card">
        <p><b>Loại phòng:</b> {project.room_type}</p>
        <p><b>Phong cách:</b> {project.style}</p>
        <p><b>Trạng thái:</b> {project.status}</p>
        <p className="mt-4 text-muted">{project.advice_text}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-lg bg-burgundy px-4 py-2 text-white">Tải ảnh phối cảnh</button>
          <Link className="rounded-lg border border-beige px-4 py-2 text-burgundy" to="/app/quotations">Tạo báo giá</Link>
          <button className="rounded-lg border border-beige px-4 py-2 text-burgundy">Gửi khách</button>
          <button
            className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            disabled={deleting}
            onClick={() => setConfirmOpen(true)}
          >
            {deleting ? "Đang xoá..." : "Xoá dự án"}
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
