import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { Button, Input } from "../../components/common/Form";
import { supabase } from "../../lib/supabase";
import { requireSupabaseConfigured } from "../../lib/env";
import { SupabaseSetupNotice } from "../../components/common/SupabaseSetupNotice";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      requireSupabaseConfigured();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) throw resetError;
      setMessage("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <SupabaseSetupNotice />
      <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
      <p className="mt-2 text-sm text-muted">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="label">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button disabled={loading} className="w-full">{loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại mật khẩu"}</Button>
      </form>
      <Link className="mt-5 block text-center text-sm text-burgundy" to="/login">Quay lại đăng nhập</Link>
    </AuthLayout>
  );
}
