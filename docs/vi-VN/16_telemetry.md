# Phép đo Từ xa (Telemetry) 📊

Trong **mAI**, tính minh bạch và tôn trọng quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Tài liệu này trình bày chi tiết cách thức hoạt động của phép đo từ xa trong ứng dụng và những dữ liệu nào có thể được thu thập.

## Thu thập Dữ liệu Ẩn danh

Để giúp chúng tôi cải thiện độ ổn định của ứng dụng và xác định các lỗi giao diện, mAI bao gồm phép đo từ xa ẩn danh. Nếu bạn chọn tham gia, các thông tin sau sẽ được truyền ở định dạng hoàn toàn ẩn danh:
- Báo cáo sự cố (crash reports) và các ngoại lệ JavaScript không được xử lý.
- Thống kê sử dụng toàn cầu (ví dụ: số lượng tác tử tùy chỉnh được tạo, mô hình ngôn ngữ được chọn thường xuyên nhất hoặc tỷ lệ kích hoạt plugin).
- Thông tin hệ thống cơ bản (phiên bản ứng dụng, hệ điều hành, độ phân giải màn hình).

## Những gì Chúng tôi KHÔNG BAO GIỜ Thu thập

Phép đo từ xa trong mAI tôn trọng nghiêm ngặt quyền riêng tư của bạn. Chúng tôi **không bao giờ** thu thập, đọc hoặc lưu trữ:
- Nội dung tin nhắn hoặc các cuộc trò chuyện của bạn.
- Lời nhắc hệ thống tùy chỉnh hoặc cấu hình tác tử của bạn.
- Khóa API hoặc chi tiết thông tin xác thực của bạn.
- Bất kỳ thông tin nhận dạng cá nhân nào (tên, địa chỉ email, v.v.).

## Bật hoặc Tắt Phép đo Từ xa

Bạn có thể chọn tham gia cải thiện mAI hoặc từ chối bất kỳ lúc nào:
1. Đi tới **Cài đặt (Settings)** ứng dụng.
2. Nhấp vào tab **Giới thiệu / Phép đo từ xa (About / Telemetry)**.
3. Bật/tắt tùy chọn **Cho phép báo cáo sự cố ẩn danh và thống kê sử dụng**.
