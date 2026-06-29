# DuHa - AI phối cảnh gạch

**Slogan:** Thử gạch hôm nay, thấy nhà ngày mai

DuHa là web SaaS hỗ trợ cửa hàng gạch ốp lát tạo phối cảnh minh họa từ ảnh phòng mộc và ảnh mẫu gạch. Frontend chính thức hiện nằm trong `src/`, chạy bằng React + TypeScript + Vite và lưu data thật bằng Supabase.

## Trạng thái hiện tại

- Landing page, login, register, forgot password.
- Dashboard có route protection.
- Supabase Auth cho đăng nhập, đăng ký, đăng xuất.
- Supabase Database lưu `profiles`, `customers`, `tiles`, `projects`, `quotations`.
- Supabase Storage lưu ảnh trong bucket `duha-images`.
- AI image generation vẫn mock, chưa gọi API render thật.
- Chưa có backend riêng ở giai đoạn này.

## Chạy frontend

```bash
npm install
npm run dev
```

Mở:

```text
http://localhost:5173
```

Build kiểm tra TypeScript:

```bash
npm run build
```

## Cấu hình Supabase

### 1. Tạo Supabase project

Trong Supabase dashboard, lấy:

- Project URL
- Anon public key

### 2. Tạo file `.env`

Tạo file `.env` ở root project:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Server-only, để chuẩn bị cho AI render thật sau này.
# Không đặt tên VITE_OPENAI_API_KEY vì key VITE_* sẽ lộ ra browser.
OPENAI_API_KEY=your_openai_api_key
```

Không commit `.env` thật. Sau khi sửa `.env`, restart `npm run dev`.

Lưu ý quan trọng: frontend React/Vite chỉ đọc biến bắt đầu bằng `VITE_`. Vì vậy `OPENAI_API_KEY` có thể nằm trong `.env` để chuẩn bị, nhưng app frontend hiện tại không và không nên gọi OpenAI trực tiếp từ browser. Khi làm AI render thật, cần gọi OpenAI từ backend/server hoặc Supabase Edge Function để giữ key an toàn.

### 3. Chạy database schema

Mở Supabase SQL Editor và chạy:

```text
supabase/schema.sql
```

File này tạo bảng, RLS policies và trigger tạo `profiles` khi user đăng ký.

### 4. Chạy storage setup

Tiếp tục chạy:

```text
supabase/storage.sql
```

File này tạo bucket:

```text
duha-images
```

Và policy cho upload/read ảnh theo cấu trúc:

```text
rooms/{user_id}/{timestamp}-{file_name}
tiles/{user_id}/{timestamp}-{file_name}
results/{user_id}/{timestamp}-{file_name}
```

## Routes

- `/` Landing page
- `/login` Đăng nhập
- `/register` Đăng ký
- `/forgot-password` Quên mật khẩu
- `/app` Dashboard
- `/app/create` Tạo phối cảnh
- `/app/projects` Dự án đã lưu
- `/app/projects/:id` Chi tiết dự án
- `/app/catalog` Catalog gạch
- `/app/customers` Khách hàng
- `/app/quotations` Báo giá
- `/app/settings` Cài đặt

Các route `/app/*` yêu cầu đăng nhập Supabase.

## Nếu register đang lỗi

Kiểm tra theo thứ tự:

1. Có file `.env` thật chưa.
2. `VITE_SUPABASE_URL` có dạng `https://xxxxx.supabase.co` chưa.
3. `VITE_SUPABASE_ANON_KEY` có phải anon key thật chưa.
4. Đã chạy `supabase/schema.sql` chưa.
5. Đã chạy `supabase/storage.sql` chưa.
6. Nếu Supabase bật Confirm email, hãy xác nhận email trước khi login hoặc tạm tắt Confirm email khi dev local.

App hiện đã hiển thị lỗi Supabase thật thay vì chỉ báo lỗi chung chung.

## Phần vẫn mock

- AI render ảnh thật.
- Result image tạm dùng ảnh phòng upload làm preview.
- Google login button.
- Plan/quota.
- PDF báo giá và gửi khách.

## Plan phát triển

Xem chi tiết tại:

```text
docs/DEVELOPMENT_PLAN.md
```

## Streamlit MVP cũ

Repo vẫn còn bản Python/Streamlit cũ:

- `app.py`
- `services/`
- `Dockerfile`
- `docker-compose.yml`

Bản này chỉ là mock preview bằng Pillow. Frontend đang phát triển chính là app React trong `src/`.
