import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Button, Input, Select } from "../../components/common/Form";
import { useAuth } from "../../contexts/AuthContext";
import { readableError } from "../../lib/env";
import { SupabaseSetupNotice } from "../../components/common/SupabaseSetupNotice";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Chủ cửa hàng gạch");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await signUp(email, password, { full_name: fullName, role });
      if (result.needsEmailConfirmation) {
        setMessage("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
        return;
      }
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
      <h1 className="text-2xl font-bold">Tạo tài khoản DuHa</h1>
      <p className="mt-2 text-sm text-muted">Bắt đầu thử gạch và tạo phối cảnh trong vài bước.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="label">Họ tên</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <label className="label">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label">Mật khẩu</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <label className="label">Loại tài khoản</label>
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Chủ cửa hàng gạch</option>
          <option>Nhân viên bán hàng</option>
          <option>Người đang xây nhà</option>
        </Select>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button disabled={loading} className="w-full">{loading ? "Đang tạo..." : "Tạo tài khoản"}</Button>
        <button type="button" className="w-full rounded-lg border border-beige px-4 py-2 text-sm font-semibold text-burgundy">Đăng ký với Google</button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">Đã có tài khoản? <Link className="text-burgundy" to="/login">Đăng nhập</Link></p>
    </AuthLayout>
  );
}
