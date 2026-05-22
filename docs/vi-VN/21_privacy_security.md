# Quyền riêng tư và Bảo mật 🔒

Bảo mật dữ liệu và tôn trọng quyền riêng tư của bạn là những nguyên tắc cơ bản trong thiết kế của **mAI**.

## Lưu trữ Cục bộ được Mã hóa

Tất cả dữ liệu nhạy cảm của bạn được lưu trữ cục bộ trên thiết bị của bạn:
- **Khóa API**: Chúng được mã hóa bằng các thuật toán tiêu chuẩn công nghiệp trước khi được lưu vào bộ nhớ cục bộ của bạn. Khóa API của bạn không bao giờ được gửi đến máy chủ của chúng tôi; chúng được gửi trực tiếp từ thiết bị của bạn đến các máy chủ của nhà cung cấp LLM tương ứng.
- **Lịch sử Trò chuyện**: Các cuộc trò chuyện của bạn vẫn ở trên máy của bạn (trừ khi bạn bật đồng bộ hóa đám mây an toàn một cách rõ ràng).

## Kết nối An toàn

Tất cả các yêu cầu gửi đi tới API mô hình ngôn ngữ đều sử dụng các giao thức truyền thông an toàn (HTTPS / SSL), đảm bảo rằng dữ liệu được trao đổi không thể bị chặn trên mạng.

## Các Thực hành Doanh nghiệp được Khuyến nghị

Để có mức bảo mật cao nhất trong môi trường doanh nghiệp:
- Sử dụng các mô hình được lưu trữ cục bộ thông qua **Ollama** hoặc máy chủ suy luận riêng (nghĩa là không có dữ liệu nào rời khỏi mạng doanh nghiệp).
- Từ chối tham gia phép đo từ xa ẩn danh trong tab cài đặt chung.
