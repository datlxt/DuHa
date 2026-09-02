import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getCustomers } from "../../services/customerService";
import { getProjects } from "../../services/projectService";
import { getTiles } from "../../services/tileService";
import type { Customer, Project, Tile } from "../../types";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";

export function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([getProjects(user.id), getTiles(user.id), getCustomers(user.id)])
      .then(([projectData, tileData, customerData]) => {
        setProjects(projectData);
        setTiles(tileData);
        setCustomers(customerData);
      })
      .catch(() => setError("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [user]);

  const monthlyCount = useMemo(() => {
    const now = new Date();
    return projects.filter((project) => {
      const created = new Date(project.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
  }, [projects]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan DuHa</h1>
        <p className="mt-2 text-muted">Theo dõi hoạt động tư vấn phối cảnh và khách hàng của cửa hàng.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Lượt phối cảnh tháng này", monthlyCount],
          ["Dự án đã lưu", projects.length],
          ["Mẫu gạch trong catalog", tiles.length],
          ["Khách hàng tiềm năng", customers.length],
        ].map(([label, value]) => <div className="card" key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-burgundy">{value}</p></div>)}
      </div>
      {projects.length === 0 ? (
        <EmptyState title="Chưa có dữ liệu. Hãy tạo phối cảnh hoặc thêm khách hàng đầu tiên." action={<Link className="rounded-lg bg-burgundy px-4 py-2 text-white" to="/app/create">Tạo phối cảnh mới</Link>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="card">
            <h2 className="text-xl font-bold">Dự án gần đây</h2>
            <div className="mt-4 space-y-3">
              {projects.slice(0, 3).map((project) => (
                <Link to={`/app/projects/${project.id}`} className="block rounded-lg border border-beige p-4 hover:border-burgundy" key={project.id}>
                  <p className="font-semibold">{project.project_name}</p>
                  <p className="text-sm text-muted">{project.room_type} · {project.style}</p>
                </Link>
              ))}
            </div>
          </section>
          <section className="card">
            <h2 className="text-xl font-bold">Mẫu gạch mới</h2>
            <div className="mt-4 space-y-3">
              {tiles.slice(0, 3).map((tile) => <p className="rounded-lg bg-ivory p-3 text-sm" key={tile.id}>{tile.tile_code} · {tile.tile_name}</p>)}
              <Link className="inline-block rounded-lg bg-burgundy px-4 py-2 text-sm font-semibold text-white" to="/app/create">Tạo phối cảnh mới</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
