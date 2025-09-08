# Hướng dẫn hiệu ứng chuyển động mượt mà cho subtitle

## 🎯 **Hiệu ứng mới: Smooth Scrolling với Fade Animation**

### ✅ **Tính năng:**

1. **10 hàng hiển thị** - Tăng từ 6 lên 10 hàng để hiển thị nhiều nội dung hơn
2. **Hàng hiện tại ở giữa** - Vị trí thứ 5 (center) thay vì thứ 3
3. **Fade effect** - Hàng đã đọc xong sẽ mờ dần và biến mất
4. **Smooth transition** - Chuyển động mượt mà từ trên xuống dưới
5. **Auto-scroll** - Hàng sắp tới tự động nhảy lên

---

## 🎬 **Animation Flow:**

### **Layout Structure:**
```
┌─────────────────────────────────────┐
│  Hàng 1: [Đã đọc xong] ← Fade out   │ ← Mờ dần
│  Hàng 2: [Đã đọc xong] ← Fade out   │ ← Mờ dần
│  Hàng 3: [Đã đọc xong] ← Fade out   │ ← Mờ dần
│  Hàng 4: [Đã đọc xong] ← Fade out   │ ← Mờ dần
│  Hàng 5: [ĐANG ĐỌC] ← HIGHLIGHT     │ ← Sáng + Highlight
│  Hàng 6: [Sắp đọc]                  │ ← Bình thường
│  Hàng 7: [Sắp đọc]                  │ ← Bình thường
│  Hàng 8: [Sắp đọc]                  │ ← Bình thường
│  Hàng 9: [Sắp đọc]                  │ ← Bình thường
│  Hàng 10: [Sắp đọc]                 │ ← Bình thường
└─────────────────────────────────────┘
```

### **Movement Animation:**
- ✅ **Top to bottom** - Chuyển động từ trên xuống dưới
- ✅ **Fade out past** - Hàng đã đọc mờ dần và biến mất
- ✅ **Auto-scroll up** - Hàng sắp tới tự động nhảy lên
- ✅ **Center highlight** - Hàng hiện tại luôn ở giữa

---

## 🔧 **Technical Implementation:**

### **1. Increased Line Count:**
```javascript
const totalLines = 10 // Increased from 6 to 10 lines
const highlightIndex = 4 // Center line (0-based, so 4 is the 5th line)
```

### **2. Fade Effect Calculation:**
```javascript
// Calculate fade effect for past cues
let fadeAlpha = 1
if (isPast) {
  const distance = currentCueIndex - i
  fadeAlpha = Math.max(0.3, 1 - (distance * 0.15)) // Fade out past cues
}
```

### **3. Dynamic Color with Alpha:**
```javascript
// Color with fade effect
let baseColor = '#ffffff'
if (isPast) {
  baseColor = `rgba(160, 160, 170, ${fadeAlpha})` // Gray with fade
} else if (isFuture) {
  baseColor = `rgba(160, 160, 170, ${fadeAlpha})` // Gray with fade
} else {
  baseColor = `rgba(255, 255, 255, ${fadeAlpha})` // White with fade
}
```

### **4. Skip Rendering for Faded Cues:**
```javascript
// Skip rendering if too faded (past cues)
if (fadeAlpha < 0.1) {
  cursorY += cueHeight
  continue
}
```

---

## 🎨 **Visual Effects:**

### **Fade Animation:**
- ✅ **Past cues** - Mờ dần từ 100% → 30% opacity
- ✅ **Current cue** - 100% opacity + highlight
- ✅ **Future cues** - 100% opacity
- ✅ **Smooth transition** - Chuyển đổi mượt mà

### **Color Scheme:**
- ✅ **Current line** - White text + Blue highlight background
- ✅ **Past lines** - Gray text với fade effect
- ✅ **Future lines** - Gray text (bình thường)
- ✅ **Background** - Semi-transparent black

### **Highlight Effect:**
- ✅ **Blue background** - `rgba(59, 130, 246, 0.2)`
- ✅ **Fade with text** - Highlight cũng fade theo text
- ✅ **Dynamic size** - Kích thước theo chiều cao text

---

## 📱 **Responsive Behavior:**

### **Content Display:**
- ✅ **More content** - 10 hàng thay vì 6 hàng
- ✅ **Better context** - Thấy được nhiều nội dung hơn
- ✅ **Less content loss** - Ít bị mất nội dung hơn
- ✅ **Smooth scrolling** - Chuyển động mượt mà

### **Text Wrapping:**
- ✅ **Full content** - Text dài vẫn hiển thị đầy đủ
- ✅ **Word boundary** - Xuống dòng theo từ
- ✅ **Dynamic height** - Chiều cao tự động điều chỉnh

---

## 🎯 **User Experience:**

### **Reading Flow:**
1. **Context** - Thấy được 4 hàng trước để hiểu context
2. **Current** - Hàng hiện tại được highlight rõ ràng
3. **Preview** - Thấy được 5 hàng sắp đọc để chuẩn bị
4. **Smooth transition** - Chuyển động mượt mà không bị giật

### **Benefits:**
- ✅ **More content** - Hiển thị nhiều nội dung hơn
- ✅ **Better context** - Hiểu được nội dung trước và sau
- ✅ **Smooth animation** - Chuyển động mượt mà
- ✅ **Less content loss** - Ít bị mất nội dung hơn

---

## ⚙️ **Configuration Options:**

### **Customizable Parameters:**
```javascript
const totalLines = 10        // Số hàng hiển thị
const highlightIndex = 4     // Vị trí highlight (center)
const fadeRate = 0.15        // Tốc độ fade (0.15 = 15% per line)
const minFadeAlpha = 0.3     // Alpha tối thiểu (30%)
const jpFontSize = 11        // Font size tiếng Nhật
const viFontSize = 10        // Font size tiếng Việt
```

### **Easy Customization:**
- **Line count** - Thay đổi số hàng hiển thị
- **Fade rate** - Điều chỉnh tốc độ fade
- **Highlight position** - Thay đổi vị trí highlight
- **Colors** - Tùy chỉnh màu sắc

---

## 🚀 **Advanced Features:**

### **Smart Fade Management:**
- ✅ **Distance-based fade** - Fade theo khoảng cách
- ✅ **Minimum visibility** - Giữ tối thiểu 30% opacity
- ✅ **Skip rendering** - Không render khi quá mờ
- ✅ **Performance optimization** - Tối ưu hiệu suất

### **Smooth Transitions:**
- ✅ **Real-time updates** - Cập nhật theo thời gian thực
- ✅ **No flicker** - Không bị nhấp nháy
- ✅ **Consistent layout** - Layout ổn định
- ✅ **Fluid movement** - Chuyển động mượt mà

---

## 🎉 **Kết luận:**

### **Vấn đề đã được giải quyết:**
- ✅ **More content** - Hiển thị 10 hàng thay vì 6 hàng
- ✅ **Smooth animation** - Chuyển động mượt mà từ trên xuống dưới
- ✅ **Fade effect** - Hàng đã đọc mờ dần và biến mất
- ✅ **Auto-scroll** - Hàng sắp tới tự động nhảy lên
- ✅ **Less content loss** - Ít bị mất nội dung hơn

### **User Benefits:**
- ✅ **Better reading experience** - Trải nghiệm đọc tốt hơn
- ✅ **More context** - Thấy được nhiều nội dung hơn
- ✅ **Smooth transitions** - Chuyển đổi mượt mà
- ✅ **Professional look** - Giao diện chuyên nghiệp

**Bây giờ bạn có hiệu ứng chuyển động mượt mà với 10 hàng hiển thị!** 🎬✨
