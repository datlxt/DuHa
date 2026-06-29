import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { deleteProject, getProjects } from "../../services/projectService";
import type { Project } from "../../types";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { readableError } from "../../lib/env";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";

export function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  async function loadProjects() {
    if (!user) return;
    setLoading(true);
    setError("");
    getProjects(user.id).then(setProjects).catch((caughtError) => setError(readableError(caughtError))).finally(() => setLoading(false));
  }

  useEffect(() => {
    void loadProjects();
  }, [user]);

  async function confirmDelete() {
    const project = pendingDelete;
    if (!project) return;
    setDeletingId(project.id);
    setMessage("");
    setError("");
    try {
      await deleteProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      setMessage("Đã xoá dự án.");
      setPendingDelete(null);
    } catch (caughtError) {
      setError(readableError(caughtError));
    } finally {
      setDeletingId("");
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-3xl font-bold">Dự án đã lưu</h1><p className="mt-2 text-muted">Quản lý, xem chi tiết hoặc xoá các phối cảnh đã tạo.</p></div>
        <Link className="rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white" to="/app/create">Tạo phối cảnh mới</Link>
      </div>
      {message ? <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div> : null}
      {projects.length === 0 ? <EmptyState title="Chưa có dự án nào. Hãy tạo phối cảnh đầu tiên." action={<Link className="rounded-lg bg-burgundy px-4 py-2 text-white" to="/app/create">Tạo phối cảnh</Link>} /> : (
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              <ImageWithFallback className="h-40 w-full rounded-lg object-cover" src={project.result_image_url} alt={project.project_name} />
              <h3 className="mt-3 font-bold">{project.project_name}</h3>
              <p className="text-sm text-muted">{project.room_type} · {project.style}</p>
              <p className="mt-2 text-sm">{project.status}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="rounded-lg bg-burgundy px-4 py-2 text-sm text-white" to={`/app/projects/${project.id}`}>Xem chi tiết</Link>
                <button
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  disabled={deletingId === project.id}
                  onClick={() => setPendingDelete(project)}
                >
                  {deletingId === project.id ? "Đang xoá..." : "Xoá"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xoá dự án?"
        description={`Dự án "${pendingDelete?.project_name ?? ""}" sẽ bị xoá khỏi danh sách đã lưu. Thao tác này không thể hoàn tác.`}
        confirmLabel="Xoá dự án"
        loading={Boolean(deletingId)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
