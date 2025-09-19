# KaraokeSubtitle Component

Component React hiển thị phụ đề karaoke với smooth scrolling và token highlighting.

## Tính năng

- ✅ **Smooth scrolling**: Chuyển đổi mượt mà giữa các câu
- ✅ **Token highlighting**: Highlight từng từ theo thời gian audio
- ✅ **Audio sync**: Đồng bộ hoàn hảo với audioRef
- ✅ **Responsive design**: Tương thích mobile và desktop
- ✅ **Customizable**: Có thể tùy chỉnh số dòng hiển thị
- ✅ **Accessibility**: Hỗ trợ accessibility tốt

## Cách sử dụng

```jsx
import KaraokeSubtitle from './components/KaraokeSubtitle';

function MyComponent() {
  const audioRef = useRef(null);
  const segments = [
    {
      start: 0.0,
      end: 6.0,
      jp: "愛情： \"親の愛情は子供にとって大切だ。\"",
      vi: "tình yêu thương: \"Tình yêu thương của cha mẹ rất quan trọng đối với con cái.\"",
      tokens: [
        { "surface": "親", "reading": "おや", "romaji": "oya", "pos": "NOUN", "t": 0.1, "vi": "cha mẹ", "end": 0.4 },
        // ... more tokens
      ]
    }
  ];

  return (
    <div>
      <audio ref={audioRef} src="audio.mp3" />
      <KaraokeSubtitle
        segments={segments}
        audioRef={audioRef}
        numberOfLines={3}
        className="my-custom-class"
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `segments` | Array | `[]` | Mảng segments từ JSON data |
| `audioRef` | HTMLAudioElement | `null` | Reference đến audio element |
| `numberOfLines` | number | `3` | Số dòng hiển thị trên màn hình |
| `className` | string | `""` | CSS class tùy chỉnh |

## JSON Data Format

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 6.0,
      "jp": "愛情： \"親の愛情は子供にとって大切だ。\"",
      "vi": "tình yêu thương: \"Tình yêu thương của cha mẹ rất quan trọng đối với con cái.\"",
      "tokens": [
        {
          "surface": "親",
          "reading": "おや", 
          "romaji": "oya",
          "pos": "NOUN",
          "t": 0.1,
          "vi": "cha mẹ",
          "end": 0.4
        }
      ]
    }
  ]
}
```

## CSS Classes

Component sử dụng các CSS classes sau:

- `.karaoke-subtitle-container` - Container chính
- `.karaoke-subtitle-content` - Nội dung phụ đề
- `.karaoke-segment` - Mỗi segment/câu
- `.karaoke-segment.current` - Câu hiện tại
- `.karaoke-segment.next` - Câu tiếp theo
- `.karaoke-segment.previous` - Câu trước đó
- `.karaoke-token` - Mỗi token/từ
- `.karaoke-token.active` - Token đang được highlight
- `.karaoke-japanese` - Text tiếng Nhật
- `.karaoke-vietnamese` - Text tiếng Việt

## Styling

Component có thể được tùy chỉnh thông qua CSS:

```css
.karaoke-subtitle-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.karaoke-token.active {
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  color: #1f2937;
  font-weight: 700;
  transform: scale(1.05);
}
```

## Demo

Để xem demo, click vào nút "Karaoke" trong ứng dụng chính.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+
- CSS3 (transform, transition, animation)
