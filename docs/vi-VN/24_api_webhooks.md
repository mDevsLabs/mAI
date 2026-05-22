# API và Webhooks 🔗

**mAI** cung cấp các giao diện lập trình để cho phép tích hợp bên ngoài với các ứng dụng, dịch vụ web hoặc tập lệnh tự động hóa của riêng bạn.

## API Cục bộ (HTTP)

Ứng dụng máy tính để bàn mAI có thể chạy một máy chủ web cục bộ an toàn trên một cổng được chỉ định. Máy chủ này hiển thị một số điểm cuối (endpoints):
- `POST /api/chat`: Gửi một tin nhắn đến một tác tử cụ thể và trả về một phản hồi có cấu trúc (hỗ trợ định dạng tiêu chuẩn hoặc phát trực tuyến - streaming).
- `GET /api/agents`: Liệt kê tất cả các tác tử có sẵn và cấu hình của chúng.
- `POST /api/agents`: Cho phép tạo một tác tử mới bằng lập trình.

## Tích hợp Webhooks

Bạn có thể cấu hình các webhook gửi đi trong cài đặt nâng cao của mAI. Một webhook sẽ tự động gửi một tải dữ liệu JSON (JSON payload) đến một URL bên ngoài bất cứ khi nào các sự kiện cụ thể xảy ra:
- **Tin nhắn trò chuyện hoàn thành**: Được kích hoạt ngay khi tác tử hoàn thành việc tạo phản hồi.
- **Tác tử được tạo**: Được kích hoạt khi một hồ sơ tác tử mới được thêm vào.
- **Lỗi hệ thống**: Được kích hoạt khi xảy ra các sự cố xác thực khóa API hoặc mất kết nối của nhà cung cấp LLM.
