# Bắt đầu ⚡

Hướng dẫn này giúp bạn thiết lập và chạy **mAI** cục bộ trên máy phát triển của bạn.

## Điều kiện tiên quyết

Đảm bảo bạn đã cài đặt các thành phần sau:
- **Node.js** (khuyến nghị v18 trở lên)
- **pnpm** hoặc **bun** để quản lý gói và không gian làm việc (workspace)

## Cài đặt

1. **Sao chép kho lưu trữ**:
   ```bash
   git clone https://github.com/mDevsLabs/mAI.git
   cd mAI
   ```

2. **Cài đặt các gói phụ thuộc**:
   Với pnpm:
   ```bash
   pnpm install
   ```
   Với bun:
   ```bash
   bun install
   ```

3. **Chạy máy chủ phát triển**:
   ```bash
   pnpm dev
   # hoặc
   bun run dev
   ```

Ứng dụng sẽ có thể truy cập được trong trình duyệt của bạn tại địa chỉ `http://localhost:3010`. Trong lần khởi chạy đầu tiên, bạn sẽ được chào đón bởi **May**, trợ lý cốt lõi của bạn, để cấu hình các tùy chọn ban đầu của bạn!
