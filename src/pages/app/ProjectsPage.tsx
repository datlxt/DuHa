import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProjects } from "../../services/projectService";
import type { Project } from "../../types";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";

export function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getProjects(user.id).then(setProjects).catch(() => setError("Không thể tải dữ liệu")).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Dự án đã lưu</h1><p className="mt-2 text-muted">Tìm theo tên dự án, khách hàng hoặc mã gạch.</p></div>
      {projects.length === 0 ? <EmptyState title="Chưa có dự án nào. Hãy tạo phối cảnh đầu tiên." action={<Link className="rounded-lg bg-burgundy px-4 py-2 text-white" to="/app/create">Tạo phối cảnh</Link>} /> : (
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              {project.result_image_url ? <img className="h-40 w-full rounded-lg object-cover" src={project.result_image_url} alt={project.project_name} /> : null}
              <h3 className="mt-3 font-bold">{project.project_name}</h3>
              <p className="text-sm text-muted">{project.room_type} · {project.style}</p>
              <p className="mt-2 text-sm">{project.status}</p>
              <Link className="mt-4 inline-block rounded-lg bg-burgundy px-4 py-2 text-sm text-white" to={`/app/projects/${project.id}`}>Xem chi tiết</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
