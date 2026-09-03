-- Lưu nhiều phương án phối cảnh (2-3 mẫu) để khách chọn.
-- result_image_url vẫn là ảnh đang được chọn; result_image_urls là toàn bộ mẫu AI tạo ra.
alter table projects add column if not exists result_image_urls jsonb default '[]'::jsonb;
