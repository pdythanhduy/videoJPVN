# Hướng dẫn debug vấn đề text không hiển thị đầy đủ

## 🐛 **Vấn đề hiện tại:**

### ❌ **Text bị mất:**
- **Vietnamese text** - Phần cuối bị mất: "Như vậy, yabai tùy ngữ cảnh có thể mang nghĩa xấu hoặc tốt, là một từ rất tiện dụng và giàu sắc thái cảm xúc."
- **Content loss** - Nội dung bị cắt hoặc không hiển thị

### ✅ **Text đúng cần hiển thị:**
```
JP: 「昨日のライブ、やばかった！」と言えば「すごく楽しかった」という意味になります。このように「やばい」は、状況によって良い意味にも悪い意味にもなる、とても便利で感情的な言葉です。

VI: Hoặc nói Buổi live hôm qua yabakatta!, thì có nghĩa là rất vui, cực hay. Như vậy, yabai tùy ngữ cảnh có thể mang nghĩa xấu hoặc tốt, là một từ rất tiện dụng và giàu sắc thái cảm xúc.
```

---

## 🔍 **Debug Steps:**

### **1. Kiểm tra Console Log:**
- Mở Developer Tools (F12)
- Xem Console tab
- Tìm log "=== CURRENT CUE DEBUG ==="
- Kiểm tra:
  - JP Text Length
  - VI Text Length
  - JP Text (full content)
  - VI Text (full content)
  - JP Lines (wrapped)
  - VI Lines (wrapped)

### **2. Kiểm tra Text Wrapping:**
- Mở file `debug_text_issue.html` trong browser
- Xem text có được wrap đúng không
- Kiểm tra:
  - JP Line Count
  - VI Line Count
  - Text Analysis
  - Content preservation

### **3. Kiểm tra Data Source:**
- Xem file SRT có đúng format không
- Kiểm tra JSON data có đầy đủ không
- Xem có bị cắt text khi parse không

---

## 🛠️ **Cải tiến đã thực hiện:**

### **1. Enhanced Debug Logging:**
```javascript
console.log('=== CURRENT CUE DEBUG ===')
console.log('JP Text Length:', jpText.length)
console.log('VI Text Length:', viText.length)
console.log('JP Text:', jpText)
console.log('VI Text:', viText)
console.log('JP Lines:', jpLines)
console.log('VI Lines:', viLines)
console.log('JP Line Count:', jpLines.length)
console.log('VI Line Count:', viLines.length)
console.log('Box Width:', boxW - 16)
console.log('JP Font Size:', jpFontSize)
console.log('VI Font Size:', viFontSize)
console.log('========================')
```

### **2. Vietnamese Text Wrapping Debug:**
```javascript
// Debug logging for Vietnamese text
if (text.includes('yabai') || text.includes('tùy ngữ cảnh')) {
  console.log('VI Text Wrapping Debug:')
  console.log('Original text:', text)
  console.log('Words:', words)
  console.log('Lines:', lines)
  console.log('Max width:', maxWidth)
}
```

### **3. Better Text Handling:**
- ✅ **Word-based wrapping** - Wrap theo từ cho tiếng Việt
- ✅ **Character-based wrapping** - Wrap theo ký tự cho tiếng Nhật
- ✅ **Debug logging** - Log chi tiết cho debugging
- ✅ **Content preservation** - Đảm bảo không mất nội dung

---

## 🎯 **Troubleshooting:**

### **Vấn đề 1: Text bị cắt khi wrap**
**Nguyên nhân:** Text wrapping không đúng
**Giải pháp:** 
- Kiểm tra `maxWidth` có đúng không
- Xem font size có phù hợp không
- Test với `debug_text_issue.html`

### **Vấn đề 2: Text không hiển thị đầy đủ**
**Nguyên nhân:** Data parsing hoặc rendering
**Giải pháp:**
- Kiểm tra console log
- Xem data structure có đúng không
- Kiểm tra rendering order

### **Vấn đề 3: Content bị mất**
**Nguyên nhân:** Text quá dài hoặc height calculation sai
**Giải pháp:**
- Kiểm tra text wrapping
- Xem height calculation
- Kiểm tra có bị overflow không

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

### **Test Case 3: Content Preservation**
```
Check: Tất cả text có được preserve không
Method: So sánh original text với reconstructed text
Expected: 100% match
```

---

## 🚀 **Next Steps:**

### **1. Immediate Actions:**
- ✅ **Test text wrapping** - Chạy `debug_text_issue.html`
- ✅ **Check console logs** - Xem debug output
- ✅ **Verify data** - Kiểm tra SRT/JSON data

### **2. If Issues Persist:**
- **Check data source** - Xem SRT/JSON có đúng không
- **Verify parsing** - Kiểm tra data parsing
- **Test rendering** - Kiểm tra rendering logic

### **3. Long-term Improvements:**
- **Better error handling** - Xử lý lỗi tốt hơn
- **Content validation** - Validate nội dung
- **Performance optimization** - Tối ưu hiệu suất

---

## 🎉 **Expected Results:**

### **After Debug:**
- ✅ **Full content display** - Hiển thị đầy đủ nội dung
- ✅ **Correct text order** - Thứ tự text đúng
- ✅ **Proper wrapping** - Text wrap phù hợp
- ✅ **No content loss** - Không bị mất nội dung

### **Debug Output:**
- ✅ **Console logs** - Thông tin chi tiết
- ✅ **Text analysis** - Phân tích text
- ✅ **Content preservation** - Kiểm tra nội dung
- ✅ **Error identification** - Xác định lỗi

**Hãy test và báo cáo kết quả debug!** 🔍✨
