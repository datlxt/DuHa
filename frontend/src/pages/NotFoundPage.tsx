import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-ivory px-5 text-center">
      <div className="card max-w-md">
        <h1 className="text-3xl font-bold text-burgundy">Không tìm thấy trang</h1>
        <p className="mt-3 text-muted">Trang này không tồn tại trên Showroom Dũng Hậu.</p>
        <Link className="mt-6 inline-block rounded-lg bg-burgundy px-5 py-3 font-semibold text-white" to="/">Quay về trang chủ</Link>
      </div>
    </div>
  );
}
