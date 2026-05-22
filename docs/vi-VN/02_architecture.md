# Kiến trúc mAI 🏗️

Ứng dụng **mAI** được xây dựng trên một kiến trúc hiện đại được thiết kế cho hiệu suất, khả năng mở rộng và khả năng bảo trì. Nó được cấu trúc dưới dạng một monorepo.

## Công nghệ chính

- **Khung cốt lõi (Core Framework)**: Next.js (với App Router) cho kết xuất và định tuyến.
- **Quản lý trạng thái (State Management)**: Zustand để kiểm soát trạng thái phía máy khách nhẹ và phản ứng nhanh.
- **Thiết kế & Giao diện người dùng**: Các thành phần Ant Design được tạo kiểu bằng `antd-style` và `@lobehub/ui`.
- **Cơ sở dữ liệu**: SQLite cục bộ (hoặc PostgreSQL trong sản xuất) được quản lý bởi Drizzle ORM.

## Cấu trúc Monorepo

Mã nguồn được chia thành các gói có thể tái sử dụng trong thư mục `packages/`:
- `packages/const`: Các hằng số và cấu hình toàn cầu.
- `packages/builtin-agents`: Các tác tử hệ thống mặc định (bao gồm cả May).
- `packages/database`: Các mô hình dữ liệu, sơ đồ Drizzle và di chuyển (migrations).
- `packages/types`: Các định nghĩa kiểu TypeScript dùng chung.

Sự tách biệt này cô lập logic nghiệp vụ cốt lõi (chẳng hạn như chạy các yêu cầu API mô hình hoặc quản lý plugin) khỏi giao diện người dùng web chính nằm trong `src/`.
