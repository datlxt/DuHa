import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Button, Input } from "../../components/common/Form";
import { useAuth } from "../../contexts/AuthContext";
import { readableError } from "../../lib/env";
import { SupabaseSetupNotice } from "../../components/common/SupabaseSetupNotice";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/app");
    } catch (caughtError) {
      setError(readableError(caughtError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <SupabaseSetupNotice />
      <h1 className="text-2xl font-bold">Đăng nhập DuHa</h1>
      <p className="mt-2 text-sm text-muted">Tiếp tục tạo phối cảnh gạch cho khách hàng của bạn.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="label">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label">Mật khẩu</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
          <Link className="text-burgundy" to="/forgot-password">Quên mật khẩu?</Link>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button disabled={loading} className="w-full">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
        <button type="button" className="w-full rounded-lg border border-beige px-4 py-2 text-sm font-semibold text-burgundy">Tiếp tục với Google</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">Chưa có tài khoản? <Link className="text-burgundy" to="/register">Đăng ký</Link></p>
    </AuthLayout>
  );
}
