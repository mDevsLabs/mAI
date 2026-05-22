# Hướng dẫn Phát triển 🛠️

Hướng dẫn này cung cấp các hướng dẫn cơ bản cho các nhà phát triển muốn đóng góp cho dự án **mAI** hoặc chạy mã nguồn ở chế độ phát triển.

## Cấu trúc Dự án

mAI được cấu trúc như một monorepo hiện đại (sử dụng pnpm và Turborepo):
- `apps/web`: Ứng dụng Next.js chính.
- `packages/`: Các mô-đun dùng chung và các cấu hình có thể tái sử dụng (thành phần giao diện người dùng, kiểu dữ liệu, trình trợ giúp).

## Chạy ở Chế độ Phát triển

1. **Điều kiện tiên quyết**: Đảm bảo bạn đã cài đặt Node.js (khuyến nghị phiên bản LTS) và pnpm hoặc bun.
2. **Cài đặt các gói phụ thuộc**:
   ```bash
   pnpm install
   ```
3. **Khởi động Máy chủ Dev**:
   ```bash
   pnpm run dev
   ```
   Ứng dụng sẽ có thể truy cập cục bộ tại `http://localhost:3000`.

## Kiểm thử (Testing)

Chúng tôi sử dụng **Vitest** cho các bộ kiểm thử của mình:
- Chạy kiểm thử một lần: `pnpm run test`
- Chạy kiểm thử ở chế độ xem (watch mode): `pnpm run test:watch`

Vui lòng đảm bảo rằng tất cả các bài kiểm thử đều vượt qua thành công trước khi gửi bất kỳ sửa đổi nào.
