# Hướng dẫn debug hiển thị text subtitle

## 🐛 **Vấn đề hiện tại:**

### ❌ **Text hiển thị sai:**
- **Japanese text** - Hiển thị đúng nhưng có thể bị wrap không đúng
- **Vietnamese text** - Bị cắt và hiển thị sai thứ tự
- **Content loss** - Một phần nội dung bị mất

### ✅ **Text đúng cần hiển thị:**
```
JP: 「昨日のライブ、やばかった！」と言えば「すごく楽しかった」という意味になります。このように「やばい」は、状況によって良い意味にも悪い意味にもなる、とても便利で感情的な言葉です。

VI: Hoặc nói Buổi live hôm qua yabakatta!, thì có nghĩa là rất vui, cực hay. Như vậy, yabai tùy ngữ cảnh có thể mang nghĩa xấu hoặc tốt, là một từ rất tiện dụng và giàu sắc thái cảm xúc.
```

---

## 🔧 **Debug Steps:**

### **1. Kiểm tra Console Log:**
- Mở Developer Tools (F12)
- Xem Console tab
- Tìm log "Current cue:" để kiểm tra data

### **2. Kiểm tra Text Wrapping:**
- Mở file `test_text_wrapping.html` trong browser
- Xem text có được wrap đúng không
- So sánh với hiển thị trong app

### **3. Kiểm tra Data Source:**
- Xem file SRT có đúng format không
- Kiểm tra JSON data có đầy đủ không
- Xem có bị cắt text khi parse không

---

## 🛠️ **Cải tiến đã thực hiện:**

### **1. Improved Text Wrapping:**
```javascript
// For Japanese text, split by characters instead of words
const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)

if (isJapanese) {
  // Japanese text wrapping by characters
  const chars = text.split('')
  // ... character-based wrapping
} else {
  // Vietnamese/English text wrapping by words
  const words = text.split(' ')
  // ... word-based wrapping
}
```

### **2. Debug Logging:**
```javascript
// Debug logging for current cue
if (isHighlight) {
  console.log('Current cue:', {
    jp: jpText,
    vi: viText,
    isHighlight,
    isActive,
    isPast,
    isFuture
  })
}
```

### **3. Better Text Handling:**
- ✅ **Japanese detection** - Tự động detect tiếng Nhật
- ✅ **Character-based wrapping** - Wrap theo ký tự cho tiếng Nhật
- ✅ **Word-based wrapping** - Wrap theo từ cho tiếng Việt
- ✅ **Empty text check** - Kiểm tra text rỗng

---

## 🎯 **Troubleshooting:**

### **Vấn đề 1: Text bị cắt**
**Nguyên nhân:** Text wrapping không đúng
**Giải pháp:** 
- Kiểm tra `maxWidth` có đúng không
- Xem font size có phù hợp không
- Test với `test_text_wrapping.html`

### **Vấn đề 2: Text hiển thị sai thứ tự**
**Nguyên nhân:** Data parsing hoặc rendering order
**Giải pháp:**
- Kiểm tra console log
- Xem data structure có đúng không
- Kiểm tra rendering order

### **Vấn đề 3: Content bị mất**
**Nguyên nhân:** Text quá dài hoặc height calculation sai
**Giải pháp:**
- Tăng `totalLines` từ 10 lên 12-15
- Kiểm tra `totalHeight` calculation
- Xem có bị overflow không

---

## 📊 **Test Cases:**

### **Test Case 1: Japanese Text**
```
Input: 「昨日のライブ、やばかった！」と言えば「すごく楽しかった」という意味になります。このように「やばい」は、状況によって良い意味にも悪い意味にもなる、とても便利で感情的な言葉です。

Expected: Hiển thị đầy đủ với character-based wrapping
```

### **Test Case 2: Vietnamese Text**
```
Input: Hoặc nói Buổi live hôm qua yabakatta!, thì có nghĩa là rất vui, cực hay. Như vậy, yabai tùy ngữ cảnh có thể mang nghĩa xấu hoặc tốt, là một từ rất tiện dụng và giàu sắc thái cảm xúc.

Expected: Hiển thị đầy đủ với word-based wrapping
```

### **Test Case 3: Combined Display**
```
Expected Layout:
┌─────────────────────────────────────┐
│ 昨日のライブ、やばかった！」と言えば    │
│ 「すごく楽しかった」という意味になります。│
│ このように「やばい」は、状況によって    │
│ 良い意味にも悪い意味にもなる、        │
│ とても便利で感情的な言葉です。        │
│                                     │
│ Hoặc nói Buổi live hôm qua yabakatta!│
│ , thì có nghĩa là rất vui, cực hay. │
│ Như vậy, yabai tùy ngữ cảnh có thể   │
│ mang nghĩa xấu hoặc tốt, là một từ   │
│ rất tiện dụng và giàu sắc thái cảm xúc│
└─────────────────────────────────────┘
```

---

## 🚀 **Next Steps:**

### **1. Immediate Actions:**
- ✅ **Test text wrapping** - Chạy `test_text_wrapping.html`
- ✅ **Check console logs** - Xem debug output
- ✅ **Verify data** - Kiểm tra SRT/JSON data

### **2. If Issues Persist:**
- **Increase line count** - Tăng từ 10 lên 15 hàng
- **Adjust font sizes** - Giảm font size để fit nhiều text hơn
- **Improve wrapping** - Fine-tune wrapping algorithm

### **3. Long-term Improvements:**
- **Dynamic line count** - Tự động điều chỉnh số hàng
- **Better font handling** - Tối ưu font rendering
- **Performance optimization** - Tối ưu hiệu suất

---

## 🎉 **Expected Results:**

### **After Fix:**
- ✅ **Full content display** - Hiển thị đầy đủ nội dung
- ✅ **Correct text order** - Thứ tự text đúng
- ✅ **Proper wrapping** - Text wrap phù hợp
- ✅ **No content loss** - Không bị mất nội dung

**Hãy test và báo cáo kết quả!** 🔍✨
