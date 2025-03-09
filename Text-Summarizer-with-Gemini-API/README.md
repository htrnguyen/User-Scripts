# Text Summarizer with Gemini API

![Logo](https://github.com/htrnguyen/User-Scripts/raw/main/Text-Summarizer-with-Gemini-API/text-summarizer-logo.png)

![GitHub License](https://img.shields.io/github/license/htrnguyen/User-Scripts?style=for-the-badge)
![Greasy Fork Version](https://img.shields.io/badge/Version-2.1-brightgreen?style=for-the-badge)

**Text Summarizer with Gemini API** là một userscript giúp tóm tắt văn bản được chọn từ bất kỳ trang web nào sử dụng API Gemini 2.0 Flash. Với giao diện thân thiện và dễ sử dụng, script cung cấp các tính năng sau:

## Đặc Điểm

- **Tóm tắt văn bản**: Tự động tóm tắt văn bản được chọn khi nhấn phím tắt `Alt + T` (mặc định, có thể tùy chỉnh).
- **Giao diện thân thiện**: Giao diện popup tối ưu, dễ nhìn với nút đóng (×) trong popup kết quả và cài đặt.

## Yêu Cầu Hệ Thống

- **Trình duyệt hỗ trợ**: Chrome, Firefox, Edge, v.v.
- **Userscript Manager**: [Tampermonkey](https://www.tampermonkey.net/) hoặc [Violentmonkey](https://violentmonkey.github.io/) (phiên bản mới nhất được khuyến nghị).

## Cài Đặt

1. **Cài đặt Userscript Manager**:
   - Tải và cài đặt [Tampermonkey](https://www.tampermonkey.net/) hoặc [Violentmonkey](https://violentmonkey.github.io/).

2. **Cài đặt Script**:
   - Nhấp vào liên kết dưới đây để cài đặt script:  
     [![Install](https://img.shields.io/badge/Install-Script-brightgreen?style=for-the-badge)](https://greasyfork.org/vi/scripts/529267-text-summarizer-with-gemini-api)

## Sử Dụng

1. **Chọn văn bản**: Chọn văn bản bạn muốn tóm tắt trên bất kỳ trang web nào.
2. **Nhấn phím tắt**: Nhấn phím tắt mặc định `Alt + T` để tóm tắt văn bản (có thể tùy chỉnh trong cài đặt).
3. **Nhập API key**: Nếu bạn chưa nhập API key, một popup sẽ xuất hiện để bạn nhập và lưu API key.
4. **Cài đặt nâng cao**: Mở cài đặt qua menu Tampermonkey (nhấp phải > "Cài đặt Text Summarizer") để thay đổi phím tắt.

## Demo

![Demo](https://github.com/htrnguyen/User-Scripts/raw/main/Text-Summarizer-with-Gemini-API/DEMO.png)

## Phiên Bản 2.1

Phiên bản này cải tiến hiệu suất và trải nghiệm người dùng dựa trên phiên bản 1.33:

- **Loại bỏ nút cài đặt trong popup kết quả**: Chỉ hiển thị nút đóng (×), truy cập cài đặt qua menu Tampermonkey.
- **Hiển thị nguyên bản kết quả**: Giữ nguyên định dạng từ AI với `white-space: pre-wrap`.
- **Sử dụng GM_* API**: Thay thế `localStorage` bằng `GM_setValue` và `GM_getValue` để lưu trữ an toàn.
- **Làm mới trang khi lưu**: Tự động làm mới trang sau 1 giây khi lưu cài đặt để tránh lỗi kẹt.
- **Tối ưu hóa giao diện**: Đảm bảo popup rộng rãi, dễ đọc với hiệu ứng kéo và thay đổi kích thước.
- **Hỗ trợ metadata**: Thêm `@downloadURL` và `@updateURL` cho tự động cập nhật từ Greasy Fork.

## Hỗ Trợ

Nếu bạn gặp bất kỳ vấn đề nào hoặc có ý tưởng cải tiến, hãy tạo một [issue](https://github.com/htrnguyen/User-Scripts/issues) trên GitHub.

## Giấy Phép

Dự án này được cấp phép dưới **Giấy phép MIT**. Xem file [LICENSE](https://github.com/htrnguyen/User-Scripts/blob/main/LICENSE) để biết thêm chi tiết.

---

**Tác giả**: [Hà Trọng Nguyễn (htrnguyen)](https://github.com/htrnguyen)  
**GitHub Repository**: [Text Summarizer with Gemini API](https://github.com/htrnguyen/User-Scripts/tree/main/Text-Summarizer-with-Gemini-API)  
**Greasy Fork**: [Text Summarizer with Gemini API](https://greasyfork.org/vi/scripts/529267-text-summarizer-with-gemini-api)
