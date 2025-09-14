# 🎬 Video Review Tool - Hướng dẫn sử dụng

## 🚀 Cách khởi động (Đơn giản nhất):

### **Cách 1: Tự động (Khuyến nghị)**
1. Double-click file `start_all_fixed.bat`
2. Chờ 5 giây
3. Mở trình duyệt: http://localhost:5174

### **Cách 2: Thủ công**
1. Mở 2 terminal:
   - Terminal 1: `cd backend && python main_simple.py`
   - Terminal 2: `npm run dev`
2. Mở trình duyệt: http://localhost:5174

## 📝 Cách sử dụng Video Review Tool:

### **Bước 1: Upload Video**
- Nhấn "Choose File" và chọn video bất kỳ
- Video sẽ hiện preview

### **Bước 2: Chọn loại Review**
- **General Review**: Review chung chung
- **Tech Review**: Review công nghệ
- **Product Review**: Review sản phẩm
- **Movie Review**: Review phim

### **Bước 3: Nhập thông tin**
- **Product/Movie Name**: Tên sản phẩm hoặc phim
- **Video Description**: Mô tả nội dung video (tùy chọn)

### **Bước 4: Tạo Script**
- Nhấn "Generate Script"
- Script sẽ được tạo tự động (offline)
- Có thể chỉnh sửa script trong textarea

### **Bước 5: Tạo Video Review**
- Nhấn "Create Video Review"
- Sẽ tạo metadata và script file
- Có thể download script

## ⚠️ Lưu ý quan trọng:

- **Tool hoạt động offline** - không cần backend
- **Script được tạo tự động** dựa trên template
- **Video thực tế** cần backend để tạo (TTS, subtitle, etc.)
- **Tất cả đều hoạt động** ngay cả khi backend lỗi

## 🔧 Nếu gặp lỗi:

1. **Frontend không mở**: Chạy `npm run dev`
2. **Backend lỗi**: Bỏ qua, tool vẫn hoạt động offline
3. **Script không tạo**: Refresh trang và thử lại
4. **Video không hiện**: Kiểm tra file video có hợp lệ không

## 📞 Hỗ trợ:
- Tool được thiết kế để hoạt động offline
- Không cần cài đặt thêm gì
- Chỉ cần Node.js và Python
