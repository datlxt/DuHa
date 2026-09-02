# DuHa — AI phối cảnh gạch

> **Slogan:** Thử gạch hôm nay, thấy nhà ngày mai

DuHa là phần mềm web giúp **nhân viên cửa hàng gạch ốp lát** làm việc với khách:
chụp ảnh phòng mộc + ảnh mẫu gạch → AI tạo ảnh phối cảnh phòng đã lát gạch, kèm
quản lý **khách hàng, dự án, catalog gạch và báo giá**.

---

## 1. Ai dùng DuHa?

DuHa là **công cụ nội bộ của cửa hàng**:

- **Nhân viên/chủ cửa hàng** là người *đăng nhập* và sử dụng toàn bộ tính năng.
- **Khách mua gạch** *không cần tài khoản*. Nhân viên mở phối cảnh trên máy/điện
  thoại cho khách xem trực tiếp ngay tại cửa hàng.
- Mỗi tài khoản cửa hàng chỉ thấy dữ liệu của chính mình (được Supabase bảo vệ
  bằng Row Level Security — RLS).

---

## 2. Công nghệ dùng trong dự án

DuHa **không dùng Python** (bản Python/Streamlit cũ đã bỏ). Stack hiện tại là bộ
công cụ web phổ biến và dễ bảo trì nhất hiện nay:

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Giao diện | **TypeScript + React** (Vite) | Toàn bộ màn hình người dùng |
| Giao diện — style | **Tailwind CSS** | Bố cục, màu sắc |
| Backend | **Supabase** | Database + Đăng nhập + Lưu ảnh (managed, không cần tự dựng server) |
| Database | **PostgreSQL** (do Supabase quản lý) | Lưu khách hàng, dự án, gạch, báo giá |
| Tạo ảnh AI | **TypeScript** (Supabase Edge Function) | Gọi OpenAI để render phối cảnh |

**Vì sao chọn stack này?** React + TypeScript là công nghệ web phổ biến nhất
thế giới → nhiều tài liệu, dễ thuê người bảo trì về sau. Supabase lo sẵn phần
khó và nhạy cảm nhất (đăng nhập, bảo mật dữ liệu, lưu file) nên bạn không phải
tự viết server. Đây là lựa chọn an toàn và tiết kiệm nhất để giao cho khách dùng
thật.

---

## 3. Cấu trúc thư mục

```text
DuHa/
├─ frontend/              # Ứng dụng React (giao diện) → deploy lên Vercel
│  ├─ src/                #   Mã nguồn chính
│  │  ├─ pages/           #     Các trang: landing, login, dashboard, projects...
│  │  ├─ components/      #     Thành phần giao diện dùng lại
│  │  ├─ services/        #     Gọi Supabase (customers, projects, quotations, AI...)
│  │  ├─ contexts/        #     AuthContext — quản lý đăng nhập
│  │  └─ lib/             #     Kết nối Supabase, tiện ích
│  └─ .env.example        #   Mẫu biến môi trường (chỉ chứa key công khai)
│
├─ supabase/              # "Backend" — do Supabase quản lý, không cần dựng server
│  ├─ migrations/         #   File SQL tạo bảng, phân quyền, bucket ảnh
│  └─ functions/          #   Hàm AI tạo phối cảnh (generate-visualization)
│
├─ docs/                  # Tài liệu
│  ├─ DEPLOYMENT.md       #   Hướng dẫn deploy đầy đủ
│  └─ DEVELOPMENT_PLAN.md #   Kế hoạch phát triển
│
├─ vercel.json            # Cấu hình deploy Vercel (chỉ cần import repo là chạy)
├─ compose.yaml           # Chạy dev bằng Docker (tùy chọn)
└─ Makefile               # Lệnh tắt: make dev / build / deploy...
```

---

## 4. Chạy thử trên máy của bạn

Cần cài sẵn: **[Node.js 20+](https://nodejs.org)** và một tài khoản
**[Supabase](https://supabase.com)** (miễn phí).

### Bước 1 — Tạo project Supabase và lấy khóa
Vào supabase.com → New project. Sau đó vào **Settings → API**, copy 2 giá trị:
- **Project URL** (dạng `https://xxxx.supabase.co`)
- **anon public key**

### Bước 2 — Tạo file cấu hình
```bash
cp frontend/.env.example frontend/.env
```
Mở `frontend/.env` và dán 2 giá trị vừa lấy vào:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=dán_anon_key_vào_đây
```

### Bước 3 — Tạo bảng dữ liệu trong Supabase
Vào Supabase → **SQL Editor** → New query, rồi copy–paste và chạy lần lượt nội
dung 2 file:
1. `supabase/migrations/20250101000000_init.sql`
2. `supabase/migrations/20250101000100_storage.sql`

### Bước 4 — Cài đặt và chạy
```bash
npm --prefix frontend ci     # cài thư viện (chạy 1 lần)
npm --prefix frontend run dev
```
Mở trình duyệt: **http://localhost:5173** → bấm Đăng ký để tạo tài khoản cửa
hàng đầu tiên và bắt đầu dùng.

> Muốn kiểm tra Supabase đã cấu hình đúng chưa:
> `npm --prefix frontend run check:supabase`

---

## 5. Bật tính năng tạo ảnh AI (tùy chọn)

Tính năng render phối cảnh dùng OpenAI, chạy trong một **Supabase Edge Function**
(để key OpenAI luôn nằm ở server, không lộ ra trình duyệt). Cần
[Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <mã_project_của_bạn>
supabase secrets set OPENAI_API_KEY=sk-...        # key OpenAI của bạn
supabase functions deploy generate-visualization
```

---

## 6. Đưa lên mạng cho cửa hàng dùng (deploy)

Deploy **cực đơn giản**: frontend lên Vercel, backend đã nằm sẵn trên Supabase.

1. Đẩy code lên GitHub.
2. Vào [vercel.com/new](https://vercel.com/new) → import repo này. Vercel tự đọc
   `vercel.json`, **không cần chỉnh gì thêm**.
3. Trong Vercel → Settings → Environment Variables, thêm:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Xong — cửa hàng truy cập bằng link `https://<tên>.vercel.app`.

Từ đó về sau, mỗi lần `git push` Vercel sẽ tự cập nhật. Hướng dẫn chi tiết từng
bước (kèm ảnh chụp thao tác): [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 7. Bảo mật cho mô hình nội bộ

Vì DuHa chỉ dành cho cửa hàng, nên **khóa đăng ký công khai** để người lạ không
tự tạo tài khoản trên hệ thống của bạn:

- Cách khuyến nghị: Supabase → **Authentication → Providers → Email** → tắt
  **"Allow new users to sign up"**. Sau đó bạn tự tạo tài khoản nhân viên trong
  Supabase → Authentication → Users → *Add user*.
- Dữ liệu giữa các tài khoản đã được cô lập bằng RLS, nên kể cả khi bật đăng ký,
  người khác cũng không xem được dữ liệu của cửa hàng bạn.
- **Không bao giờ** đặt key bí mật (OpenAI key, `service_role` key) vào file
  `frontend/.env` hay biến `VITE_*` — chúng sẽ lộ ra trình duyệt. Key bí mật chỉ
  đặt trong **Supabase secrets**.

---

## 8. Các trang trong app

`/` giới thiệu · `/login` đăng nhập · `/register` đăng ký · `/forgot-password`
quên mật khẩu · `/app` bảng điều khiển · `/app/create` tạo phối cảnh ·
`/app/projects` danh sách dự án · `/app/projects/:id` chi tiết ·
`/app/catalog` catalog gạch · `/app/customers` khách hàng ·
`/app/quotations` báo giá · `/app/settings` cài đặt.
Các trang `/app/*` bắt buộc đăng nhập.

---

## 9. Lệnh hay dùng

```bash
make dev              # chạy dev trên máy (hot reload)
make dev-docker       # chạy dev bằng Docker (không cần cài Node)
make build            # build bản production
make deploy           # deploy lên Vercel
make db-push          # áp migration lên Supabase (cần Supabase CLI)
make functions-deploy # deploy hàm AI lên Supabase
```

Tài liệu thêm: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) ·
[docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)
