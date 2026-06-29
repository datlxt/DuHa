import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectById } from "../../services/projectService";
import type { Project } from "../../types";
import { ErrorState, LoadingState } from "../../components/common/States";

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getProjectById(id).then(setProject).catch(() => setError("Không thể tải dữ liệu")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!project) return <ErrorState message="Không tìm thấy dự án trong app." />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Chi tiết dự án</h1><p className="mt-2 text-muted">{project.project_name}</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {project.room_image_url ? <img className="h-64 w-full rounded-xl object-cover" src={project.room_image_url} alt="Phòng gốc" /> : <div className="card">Chưa có ảnh phòng</div>}
        {project.tile_image_url ? <img className="h-64 w-full rounded-xl object-cover" src={project.tile_image_url} alt="Mẫu gạch" /> : <div className="card">Chưa có ảnh gạch</div>}
        {project.result_image_url ? <img className="h-64 w-full rounded-xl object-cover" src={project.result_image_url} alt="Kết quả" /> : <div className="card">Chưa có kết quả</div>}
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
        </div>
      </div>
    </div>
  );
}
