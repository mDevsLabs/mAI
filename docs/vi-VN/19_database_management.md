# Quản lý Cơ sở Dữ liệu 🗄️

**mAI** quản lý việc lưu trữ dữ liệu của mình một cách có cấu trúc và hiệu suất cao để đảm bảo quyền truy cập nhanh, ngoại tuyến vào các cuộc trò chuyện và cấu hình của bạn.

## Kiến trúc Lưu trữ

Tùy thuộc vào môi trường chạy (Máy tính để bàn hoặc Web), mAI sử dụng các công cụ lưu trữ khác nhau:
- **Ứng dụng Máy tính để bàn**: Sử dụng cơ sở dữ liệu cục bộ nhẹ (SQLite) được lưu trữ trong thư mục người dùng của ứng dụng. Nó đảm bảo hiệu suất đọc/ghi tuyệt vời cho khối lượng lịch sử lớn.
- **Ứng dụng Web**: Dựa trên cơ sở dữ liệu nội bộ của trình duyệt (IndexedDB) hoặc các dịch vụ API bên ngoài được đồng bộ hóa với cơ sở dữ liệu PostgreSQL nếu chế độ đám mây được bật.

## Di chuyển Sơ đồ (Schema Migrations)

mAI bao gồm hệ thống di chuyển sơ đồ cơ sở dữ liệu tự động. Với mỗi bản cập nhật ứng dụng, nếu cấu trúc cơ sở dữ liệu thay đổi (ví dụ: thêm một trường mới vào tác tử hoặc tin nhắn), các lần di chuyển sẽ chạy liền mạch khi khởi động mà không làm thay đổi dữ liệu hiện có của bạn.

## Tối ưu hóa Hiệu suất

Để giữ cho ứng dụng luôn nhanh:
- **Dọn dẹp Tự động**: Các tin nhắn tạm thời hoặc các phiên hết hạn có thể được cắt tỉa định kỳ.
- **Lập chỉ mục**: Các tin nhắn trò chuyện được lập chỉ mục để cho phép tìm kiếm văn bản gần như tức thời.
