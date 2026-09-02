# Hướng dẫn deploy DuHa

DuHa tách làm hai phần, mỗi phần deploy độc lập và đều thuộc gói miễn phí/khởi
điểm:

| Phần | Nền tảng | Vai trò |
| --- | --- | --- |
| `frontend/` | **Vercel** | Giao diện React (static SPA) |
| `supabase/` | **Supabase** | Postgres + Auth + Storage + Edge Function AI |

Không có server tự vận hành, không Docker ở production. Docker (`compose.yaml`)
chỉ để chạy dev local.

---

## 1. Chuẩn bị Supabase (backend)

### 1.1. Tạo project
Tạo project ở [supabase.com](https://supabase.com). Lưu lại:
- **Project URL** — `https://<ref>.supabase.co`
- **anon public key** — dùng cho frontend (an toàn để lộ, RLS bảo vệ dữ liệu)
- **Reference ID** (`<ref>`) — dùng cho Supabase CLI

### 1.2. Áp database schema + storage
**Cách A — SQL Editor (nhanh, không cài gì):** mở SQL Editor trên dashboard,
copy và chạy lần lượt nội dung của:
1. `supabase/migrations/20250101000000_init.sql`
2. `supabase/migrations/20250101000100_storage.sql`

**Cách B — Supabase CLI (khuyến nghị lâu dài):**
```bash
supabase link --project-ref <ref>
supabase db push
```

Sau bước này DB có các bảng `profiles`, `customers`, `tiles`, `projects`,
`quotations` (kèm RLS) và bucket storage `duha-images`.

### 1.3. Deploy Edge Function tạo ảnh AI
Function `generate-visualization` gọi OpenAI để render phối cảnh. Key OpenAI nằm
ở **secret của Supabase**, không bao giờ đưa vào frontend.
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy generate-visualization
```
> Vì sao chạy AI ở Supabase Edge Function chứ không ở Vercel? Render ảnh mất
> 30–60s, vượt giới hạn 10s của Vercel Hobby. Edge Function (Deno Deploy) chịu
> được thời gian dài hơn nên ổn định hơn.

---

## 2. Deploy frontend lên Vercel

### 2.1. Import repo
1. Vào [vercel.com/new](https://vercel.com/new), chọn repo này.
2. Vercel tự đọc `vercel.json` ở root:
   - install: `npm --prefix frontend ci`
   - build: `npm --prefix frontend run build`
   - output: `frontend/dist`
   - SPA rewrite: mọi route → `index.html`

   → **Không cần chỉnh Root Directory hay build settings thủ công.**

### 2.2. Thêm biến môi trường
Trong Vercel: **Project → Settings → Environment Variables**, thêm:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | anon public key |

> Chỉ thêm biến `VITE_*`. Tuyệt đối không đưa `OPENAI_API_KEY` hay
> `service_role` key vào Vercel — chúng sẽ bị inline vào bundle và lộ ra browser.

### 2.3. Deploy
Bấm **Deploy**. Từ đó về sau mỗi `git push` lên nhánh production sẽ tự build và
deploy. Deploy thủ công từ máy:
```bash
make deploy   # = vercel --prod
```

---

## 3. Sau khi deploy

- Cập nhật **CORS / Redirect URLs** trong Supabase Auth (Authentication → URL
  Configuration) để thêm domain Vercel (`https://<app>.vercel.app`).
- Test luồng: đăng nhập → tạo dự án → upload ảnh → tạo phối cảnh AI.
- Kiểm tra nhanh cấu hình từ máy dev: `npm --prefix frontend run check:supabase`.

### Khóa đăng ký cho mô hình nội bộ (quan trọng)
DuHa chỉ dành cho cửa hàng, nên nên chặn người lạ tự tạo tài khoản:
1. Supabase → **Authentication → Providers → Email** → tắt
   **"Allow new users to sign up"**.
2. Tự tạo tài khoản nhân viên: Supabase → **Authentication → Users → Add user**.

Dữ liệu giữa các tài khoản đã được cô lập bằng Row Level Security (RLS), nên đây
là lớp phòng thủ thêm chứ không phải điều kiện bắt buộc để an toàn dữ liệu.

---

## Tóm tắt lệnh

```bash
# Backend (Supabase)
supabase link --project-ref <ref>
supabase db push
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy generate-visualization

# Frontend (Vercel)
# import repo trên vercel.com, thêm VITE_* env, Deploy
make deploy
```
