# DuHa development plan

## Mục tiêu gần nhất

Đưa DuHa từ frontend mock sang môi trường phát triển có thể lưu data thật:

- Auth thật bằng Supabase Auth.
- Database thật bằng Supabase Postgres.
- Storage thật cho ảnh phòng, ảnh gạch, ảnh kết quả.
- Frontend React/Vite dùng service layer, không gọi mock data cho các trang chính.
- AI render vẫn mock để giữ phạm vi ổn định.

## Kiến trúc hiện tại

```text
React + TypeScript + Vite
  -> Supabase Auth
  -> Supabase Postgres
  -> Supabase Storage bucket duha-images
```

Chưa có backend riêng. Điều này phù hợp giai đoạn MVP vì giảm vận hành và cho phép kiểm tra thật các flow lưu dữ liệu.

## Data thật đang lưu ở đâu

Database:

- `profiles`
- `customers`
- `tiles`
- `projects`
- `quotations`

Storage:

- `rooms/{user_id}/{timestamp}-{file_name}`
- `tiles/{user_id}/{timestamp}-{file_name}`
- `results/{user_id}/{timestamp}-{file_name}`

Frontend chỉ lưu URL ảnh trong database, không lưu binary ảnh vào bảng.

## Checklist dựng môi trường dev

1. Tạo Supabase project.
2. Copy Project URL và anon public key.
3. Tạo file `.env` ở root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Server-only. Không dùng trực tiếp trong React frontend.
OPENAI_API_KEY=your_openai_api_key
```

4. Chạy SQL:

```text
supabase/migrations/20250101000000_init.sql
supabase/migrations/20250101000100_storage.sql
```

5. Cài dependency và chạy (frontend nằm trong `frontend/`):

```bash
npm --prefix frontend ci
npm --prefix frontend run dev
```

6. Test flow:

- Register user.
- Login.
- Add customer.
- Add tile + upload ảnh.
- Create project + upload ảnh phòng.
- Xem project detail.
- Tạo quotation.
- Update settings profile.

## Những lỗi thường gặp

### Chưa có `.env`

App sẽ báo `Chưa cấu hình Supabase`. Tạo `.env` thật rồi restart `npm run dev`.

### Dùng placeholder env

Các giá trị `your_supabase_url`, `example.supabase.co`, `dummy` sẽ bị coi là chưa cấu hình.

### Chưa chạy SQL schema

Register hoặc load data có thể báo `relation profiles does not exist` hoặc `relation customers does not exist`.

### Chưa chạy Storage SQL

Upload ảnh có thể báo lỗi policy hoặc bucket. Chạy migration storage trong `supabase/migrations/`.

### Supabase bật Confirm email

Register thành công nhưng chưa vào app ngay. Kiểm tra email xác nhận hoặc tắt Confirm email trong Supabase Auth khi dev local.

## Phase tiếp theo

### Phase 1: MVP Supabase ổn định

- Hoàn thiện CRUD edit/delete.
- Toast system tốt hơn.
- Seed sample data cho tài khoản mới.
- Better table filters.

### Phase 2: AI render thật

- Thêm service gọi AI image API.
- Lưu job status trong `ai_generations`.
- Lưu result thật vào Storage `results/`.
- Đưa `OPENAI_API_KEY` vào backend/server hoặc Supabase Edge Function, không đưa vào biến `VITE_*`.

### Phase 3: Backend riêng nếu cần

Khi cần bảo mật API key AI, quota phức tạp, webhook payment hoặc Zalo, thêm FastAPI/Node backend:

```text
React -> Backend API -> Supabase + AI provider
```

Ở giai đoạn hiện tại chưa cần backend riêng.
