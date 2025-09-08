# Hướng dẫn hiển thị subtitle cố định 6 hàng

## 🎯 **Layout mới: Fixed 6 Lines với Current Line ở giữa**

### ✅ **Cách hoạt động:**

1. **Cố định 6 hàng** - Luôn hiển thị 6 hàng subtitle
2. **Hàng hiện tại ở giữa** - Hàng đang đọc ở vị trí thứ 3 (center)
3. **2 hàng trước** - Hiển thị 2 hàng đã đọc xong
4. **3 hàng sau** - Hiển thị 3 hàng sắp đọc
5. **Text wrapping** - Text dài vẫn được wrap đầy đủ

---

## 📐 **Layout Structure:**

```
┌─────────────────────────────────────┐
│  Hàng 1: [Đã đọc xong]              │ ← Mờ
│  Hàng 2: [Đã đọc xong]              │ ← Mờ  
│  Hàng 3: [ĐANG ĐỌC] ← HIGHLIGHT     │ ← Sáng + Highlight
│  Hàng 4: [Sắp đọc]                  │ ← Bình thường
│  Hàng 5: [Sắp đọc]                  │ ← Bình thường
│  Hàng 6: [Sắp đọc]                  │ ← Bình thường
└─────────────────────────────────────┘
```

### **Visual Hierarchy:**
- ✅ **Hàng hiện tại** - Sáng nhất + Blue highlight background
- ✅ **Hàng đã đọc** - Mờ hơn (gray)
- ✅ **Hàng sắp đọc** - Bình thường (medium brightness)

---

## 🔧 **Technical Implementation:**

### **1. Fixed Line Count:**
```javascript
const totalLines = 6 // Fixed 6 lines
const highlightIndex = 2 // Center line (0-based, so 2 is the 3rd line)
```

### **2. Cue Selection Logic:**
```javascript
// Get 6 cues around current one (2 before, current, 3 after)
const startIndex = Math.max(0, currentCueIndex - highlightIndex)
const endIndex = Math.min(cues.length - 1, startIndex + totalLines - 1)
```

### **3. Text Wrapping:**
```javascript
const wrapText = (text, maxWidth, fontSize) => {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  ctx.font = `${fontSize}px ${fontFamily}`
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}
```

---

## 🎨 **Visual Design:**

### **Color Scheme:**
- ✅ **Current line** - White text + Blue highlight background
- ✅ **Previous lines** - Light gray text (mờ)
- ✅ **Next lines** - Medium gray text (bình thường)
- ✅ **Background** - Semi-transparent black

### **Typography:**
- ✅ **JP text** - Bold, 11px
- ✅ **VI text** - Medium, 10px
- ✅ **Font family** - System fonts (Segoe UI, Arial, etc.)

### **Spacing:**
- ✅ **Line gap** - 4px between lines
- ✅ **Padding** - 8px top/bottom, 14px left/right
- ✅ **Margin** - 28px from bottom

---

## 📱 **Responsive Behavior:**

### **Screen Adaptation:**
- ✅ **Width** - `W - 24` (full width minus padding)
- ✅ **Height** - Dynamic based on text wrapping
- ✅ **Position** - Fixed at bottom with margin

### **Text Wrapping:**
- ✅ **Max width** - `boxW - 16` (subtract padding)
- ✅ **Word boundary** - Break at word boundaries
- ✅ **Font measurement** - Accurate text width calculation

---

## 🎯 **User Experience:**

### **Reading Flow:**
1. **Context** - Thấy được 2 hàng trước để hiểu context
2. **Current** - Hàng hiện tại được highlight rõ ràng
3. **Preview** - Thấy được 3 hàng sắp đọc để chuẩn bị
4. **Continuity** - Luôn có 6 hàng, không bị gián đoạn

### **Benefits:**
- ✅ **Better context** - Hiểu được nội dung trước và sau
- ✅ **Smooth reading** - Không bị gián đoạn khi chuyển hàng
- ✅ **Predictable layout** - Luôn biết vị trí hàng hiện tại
- ✅ **Full content** - Text dài vẫn hiển thị đầy đủ

---

## 🔄 **Animation & Transitions:**

### **Line Movement:**
- ✅ **Smooth transition** - Hàng di chuyển mượt mà
- ✅ **Highlight follow** - Highlight theo hàng hiện tại
- ✅ **Color transition** - Màu sắc thay đổi theo trạng thái

### **Text Updates:**
- ✅ **Real-time** - Cập nhật theo thời gian thực
- ✅ **No flicker** - Không bị nhấp nháy
- ✅ **Consistent** - Layout ổn định

---

## ⚙️ **Configuration Options:**

### **Customizable Parameters:**
```javascript
const totalLines = 6        // Số hàng hiển thị
const highlightIndex = 2    // Vị trí highlight (center)
const jpFontSize = 11       // Font size tiếng Nhật
const viFontSize = 10       // Font size tiếng Việt
const lineGap = 4           // Khoảng cách giữa các dòng
const boxW = W - 24         // Chiều rộng subtitle box
```

### **Easy Customization:**
- **Line count** - Thay đổi số hàng hiển thị
- **Highlight position** - Điều chỉnh vị trí highlight
- **Font sizes** - Tùy chỉnh kích thước font
- **Colors** - Thay đổi màu sắc

---

## 🚀 **Advanced Features:**

### **Smart Line Selection:**
- ✅ **Boundary handling** - Xử lý khi ở đầu/cuối danh sách
- ✅ **Overflow protection** - Không vượt quá số hàng có sẵn
- ✅ **Dynamic adjustment** - Tự động điều chỉnh khi thiếu hàng

### **Performance Optimization:**
- ✅ **Efficient rendering** - Chỉ render 6 hàng cần thiết
- ✅ **Text measurement** - Tính toán chính xác kích thước
- ✅ **Memory management** - Quản lý bộ nhớ hiệu quả

---

## 🎉 **Kết luận:**

### **Vấn đề đã được giải quyết:**
- ✅ **Fixed layout** - Layout cố định 6 hàng
- ✅ **Current line center** - Hàng hiện tại ở giữa
- ✅ **Full context** - Hiển thị đầy đủ context trước/sau
- ✅ **Text wrapping** - Text dài vẫn hiển thị đầy đủ

### **User Benefits:**
- ✅ **Better reading experience** - Trải nghiệm đọc tốt hơn
- ✅ **Predictable layout** - Layout dự đoán được
- ✅ **Full content visibility** - Thấy được toàn bộ nội dung
- ✅ **Smooth transitions** - Chuyển đổi mượt mà

**Bây giờ bạn có layout subtitle cố định 6 hàng với hàng hiện tại ở giữa!** 📖✨
