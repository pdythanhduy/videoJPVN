# 📈 Trends & Hashtags Tool Guide

## 🎯 Tổng quan

Trends Tool là một mini-tool mạnh mẽ để thu thập trend/hashtag hôm nay từ nhiều nguồn đáng tin cậy:

- **X/Twitter**: trends24 (Worldwide + từng quốc gia)
- **TikTok**: Creative Center, trending hashtags, top songs
- **Google Trends**: trending searches

## 🚀 Cách sử dụng

### 1. Mở Trends Tool
- Click nút **"Trends"** trong header
- Tool sẽ mở trong modal popup

### 2. Cấu hình thu thập

#### **Regions (Khu vực)**
- Chọn một hoặc nhiều khu vực:
  - `worldwide` - Toàn cầu
  - `japan` - Nhật Bản
  - `united-states` - Mỹ
  - `india` - Ấn Độ
  - `vietnam` - Việt Nam
  - Và nhiều quốc gia khác...

#### **Limit per source**
- Điều chỉnh số lượng trend mỗi nguồn (10-100)
- Mặc định: 30

#### **Exclude platforms**
- Loại trừ platform không muốn thu thập:
  - `x` - X/Twitter
  - `tiktok` - TikTok
  - `google` - Google Trends

#### **Include TikTok songs**
- Có bao gồm top songs từ Tokchart không

### 3. Thu thập trends
- Click **"Collect Trends"**
- Chờ quá trình thu thập hoàn tất
- Xem kết quả trong panel bên phải

## 📊 Kết quả

### **JSON Output**
```json
{
  "date_jst": "2024-01-15",
  "items": [
    {
      "platform": "x",
      "region": "worldwide", 
      "label": "#AI",
      "type": "hashtag",
      "source": "https://trends24.in/",
      "collected_at": "2024-01-15T10:30:00+09:00"
    }
  ],
  "csv_file": "trends_data/trends_20240115_103000.csv"
}
```

### **CSV File**
- Tự động tạo file CSV trong thư mục `trends_data/`
- Format: UTF-8 with BOM
- Có thể download và import vào Excel/Google Sheets

## 📁 Quản lý files

### **Xem danh sách files**
- Panel "Trend Files" hiển thị tất cả files đã tạo
- Thông tin: tên file, kích thước, thời gian tạo

### **Download file**
- Click icon 📥 để download CSV
- File sẽ được tải về máy

### **Xóa file**
- Click icon 🗑️ để xóa file
- Xác nhận trước khi xóa

## 🎨 Sample Data Preview

- Xem 10 items đầu tiên trong kết quả
- Hiển thị platform, region, type, label
- Color coding theo platform:
  - 🔵 X/Twitter
  - 🟣 TikTok  
  - 🟢 Google

## 💡 Tips sử dụng hiệu quả

### **1. Ưu tiên giao điểm**
- Tìm trends xuất hiện trên ≥2 platforms
- Đây thường là trends thực sự hot

### **2. Chấm điểm score**
```
Score = số_platforms_trùng + (có_hashtag ? 1 : 0)
```

### **3. Whitelist chủ đề**
- Tạo danh sách chủ đề phù hợp với kênh
- Loại bỏ spam tags (#fyp, #followme...)

### **4. Lưu snapshot theo ngày**
- So sánh trends giữa các ngày
- Phát hiện xu hướng tăng/giảm

## 🔧 Cấu hình nâng cao

### **Command line usage**
```bash
# Thu thập toàn cầu
python backend/trendspy.py --region worldwide --limit 40 --csv today_worldwide.csv

# Thu thập Nhật + Mỹ
python backend/trendspy.py --region japan united-states --limit 30 --tiktok-songs --csv jp_us_today.csv

# Loại trừ TikTok
python backend/trendspy.py --region worldwide --no-tiktok --csv no_tiktok.csv
```

### **API Endpoints**
```bash
# Thu thập trends
POST /api/trends/collect
{
  "regions": ["worldwide", "japan"],
  "limit": 30,
  "include_tiktok_songs": true,
  "exclude_platforms": []
}

# Lấy danh sách regions
GET /api/trends/regions

# Lấy danh sách platforms  
GET /api/trends/platforms

# Lấy danh sách files
GET /api/trends/files

# Download file
GET /api/trends/download/{filename}

# Xóa file
DELETE /api/trends/files/{filename}
```

## 🛠️ Troubleshooting

### **Lỗi connection**
- Kiểm tra backend có chạy không
- Kiểm tra firewall/antivirus

### **Lỗi thu thập**
- Một số nguồn có thể bị chặn
- Thử loại trừ platform có vấn đề

### **File không tạo**
- Kiểm tra quyền ghi thư mục
- Kiểm tra dung lượng ổ cứng

## 📈 Use Cases

### **Content Creator**
- Tìm hashtag trending cho video
- Phân tích xu hướng theo khu vực
- Tạo content phù hợp với trend

### **Marketing**
- Theo dõi brand mentions
- Phân tích competitor trends
- Tối ưu campaign timing

### **Research**
- Nghiên cứu xu hướng xã hội
- Phân tích sentiment theo region
- Dự đoán trend tương lai

## 🎯 Kết luận

Trends Tool cung cấp:
- ✅ Thu thập real-time từ nhiều nguồn
- ✅ Export JSON + CSV dễ dàng
- ✅ UI thân thiện, dễ sử dụng
- ✅ Quản lý files tiện lợi
- ✅ API endpoints linh hoạt

**Perfect cho workflow content creation và marketing!** 🚀
