# Tùy chỉnh Tác tử ⚙️

Tinh chỉnh các tác tử trong **mAI** cho phép bạn thay đổi sâu sắc hành vi, phong cách phản hồi và các công cụ mà chúng có thể truy cập.

## Cài đặt Cơ bản

Đối với mỗi tác tử, bạn có thể cấu hình:
- **Lời nhắc Hệ thống (System Prompt)**: Các hướng dẫn nền tảng xác định tính cách, quy tắc và vai trò của tác tử. Đây là cài đặt có ảnh hưởng nhất đến các phản hồi của tác tử.
- **Mô hình Ngôn ngữ (Language Model)**: Chọn LLM mặc định để sử dụng (ví dụ: GPT-4o, Claude 3.5 Sonnet, Llama 3).

## Cài đặt Nâng cao

Bạn cũng có thể sửa đổi các siêu tham số tạo (generation hyperparameters):
- **Nhiệt độ (Temperature)**: Kiểm soát tính sáng tạo của các phản hồi. Nhiệt độ thấp hơn (ví dụ: 0.2) tạo ra các câu trả lời thực tế và mang tính xác định hơn. Nhiệt độ cao hơn (ví dụ: 0.9) khuyến khích sự sáng tạo.
- **Top P**: Một phương pháp khác để kiểm soát tính đa dạng của phản hồi.
- **Hình phạt Hiện diện / Tần suất (Presence / Frequency Penalty)**: Khuyến khích hoặc ngăn cản tác tử lặp lại cùng một từ hoặc đi chệch khỏi các chủ đề được thảo luận.
- **Số lượng mã thông báo tối đa (Max Tokens)**: Giới hạn độ dài tối đa của phản hồi được tạo ra.
