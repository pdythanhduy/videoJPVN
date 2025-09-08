# Hướng dẫn hiển thị Subtitle 5 hàng với Highlight

## 🎯 **Tính năng mới:**

### ✅ **Hiển thị 5 hàng subtitle:**
- **Hàng 1-2:** Subtitle trước đó (màu xám nhạt)
- **Hàng 3:** Subtitle hiện tại (highlight màu xanh)
- **Hàng 4-5:** Subtitle tiếp theo (màu xám nhạt)

### ✅ **Highlight ở giữa:**
- **Vị trí:** Hàng thứ 3 (giữa 5 hàng)
- **Màu nền:** Xanh nhạt (rgba(59, 130, 246, 0.2))
- **Màu chữ:** Trắng sáng (#ffffff)

## 🎨 **Thiết kế giao diện:**

### **Màu sắc:**
- **Highlight (hàng 3):** 
  - Nền: Xanh nhạt
  - JP: Trắng (#ffffff)
  - VI: Xám sáng (#e5e7eb)
- **Các hàng khác:**
  - JP: Xám sáng (#a1a1aa)
  - VI: Xám nhạt (#71717a)

### **Font:**
- **JP:** 11px, Bold (700)
- **VI:** 10px, Medium (500)
- **Font family:** system-ui, -apple-system, Segoe UI, Roboto, Arial

### **Layout:**
- **Tổng cộng:** 5 hàng
- **Khoảng cách:** 4px giữa các hàng
- **Padding:** 8px trên/dưới
- **Margin:** 28px từ đáy màn hình

## 🚀 **Cách sử dụng:**

### **1. Mở ImageVideo page:**
- Truy cập: http://localhost:5173
- Chọn tab "Image/Video"

### **2. Upload SRT file:**
- Click "Choose SRT file"
- Chọn file .srt
- Subtitle sẽ hiển thị 5 hàng

### **3. Phát video/audio:**
- Click nút Play
- Subtitle sẽ scroll với highlight ở giữa
- Hàng hiện tại luôn ở vị trí thứ 3

## 🔧 **Tùy chỉnh:**

### **Thay đổi số hàng:**
```javascript
const totalLines = 5 // Đổi thành số hàng mong muốn
const highlightIndex = Math.floor(totalLines / 2) // Tự động tính giữa
```

### **Thay đổi màu highlight:**
```javascript
// Màu nền highlight
ctx.fillStyle = 'rgba(59, 130, 246, 0.2)' // Xanh
// Hoặc
ctx.fillStyle = 'rgba(34, 197, 94, 0.2)' // Xanh lá
// Hoặc
ctx.fillStyle = 'rgba(239, 68, 68, 0.2)' // Đỏ
```

### **Thay đổi font size:**
```javascript
const jpFontSize = 11 // Font size tiếng Nhật
const viFontSize = 10 // Font size tiếng Việt
```

### **Thay đổi vị trí:**
```javascript
const bottomMargin = 28 // Khoảng cách từ đáy
const padX = 14 // Padding trái/phải
const padY = 8 // Padding trên/dưới
```

## 📊 **So sánh:**

### **Trước (1 hàng):**
- Chỉ hiển thị 1 subtitle tại 1 thời điểm
- Không có context
- Khó theo dõi

### **Sau (5 hàng):**
- Hiển thị 5 subtitle cùng lúc
- Context rõ ràng
- Highlight dễ nhận biết
- Trải nghiệm tốt hơn

## 🎯 **Lợi ích:**

### **1. Context tốt hơn:**
- Thấy được subtitle trước và sau
- Hiểu được ngữ cảnh
- Dễ theo dõi câu chuyện

### **2. Highlight rõ ràng:**
- Subtitle hiện tại nổi bật
- Màu sắc phân biệt rõ ràng
- Dễ tập trung

### **3. Trải nghiệm mượt:**
- Scroll tự nhiên
- Không bị giật lag
- Giao diện đẹp

## 🔧 **Troubleshooting:**

### **Nếu subtitle không hiển thị:**
1. Kiểm tra file SRT có đúng format không
2. Kiểm tra có subtitle nào trong thời gian hiện tại không
3. Kiểm tra console có lỗi không

### **Nếu highlight không đúng:**
1. Kiểm tra `highlightIndex` có đúng không
2. Kiểm tra logic tìm `currentCueIndex`
3. Kiểm tra màu sắc có được set đúng không

### **Nếu layout bị lỗi:**
1. Kiểm tra `totalLines` và `highlightIndex`
2. Kiểm tra tính toán `boxH` và `cursorY`
3. Kiểm tra font size và line height

## 🎉 **Kết luận:**

### **Tính năng mới:**
- ✅ **5 hàng subtitle** - Context đầy đủ
- ✅ **Highlight ở giữa** - Dễ nhận biết
- ✅ **Màu sắc phân biệt** - Rõ ràng
- ✅ **Giao diện đẹp** - Trải nghiệm tốt

### **Cách sử dụng:**
1. **Upload SRT** file
2. **Phát video/audio**
3. **Xem subtitle** với 5 hàng
4. **Tập trung** vào hàng highlight

**Bây giờ subtitle sẽ hiển thị đẹp và dễ đọc hơn!** 🎯
