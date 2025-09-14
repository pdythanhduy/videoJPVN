#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test encoding để kiểm tra lỗi cp932
"""

import os
import sys
from pathlib import Path

def test_encoding():
    """Test encoding với ký tự tiếng Việt"""
    
    # Test 1: Tạo file với ký tự tiếng Việt
    test_dir = Path("test_encoding")
    test_dir.mkdir(exist_ok=True)
    
    test_content = """
# Test AI Video
Prompt: Một con mèo đang chơi với quả bóng len
Duration: 5s
Generated at: 2024-12-19
"""
    
    try:
        # Test với encoding='utf-8'
        test_file = test_dir / "test_utf8.txt"
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(test_content)
        print("✅ UTF-8 encoding: OK")
        
        # Test với encoding='utf-8-sig' (UTF-8 with BOM)
        test_file_bom = test_dir / "test_utf8_bom.txt"
        with open(test_file_bom, 'w', encoding='utf-8-sig') as f:
            f.write(test_content)
        print("✅ UTF-8 with BOM encoding: OK")
        
        # Test đọc file
        with open(test_file, 'r', encoding='utf-8') as f:
            content = f.read()
        print("✅ UTF-8 reading: OK")
        
        # Test với ký tự đặc biệt
        special_chars = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ"
        test_file_special = test_dir / "test_special_chars.txt"
        with open(test_file_special, 'w', encoding='utf-8') as f:
            f.write(f"Special characters: {special_chars}")
        print("✅ Special characters: OK")
        
        # Cleanup
        for file in test_dir.glob("*.txt"):
            file.unlink()
        test_dir.rmdir()
        
        print("\n🎉 All encoding tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Encoding test failed: {e}")
        return False

def test_ai_video_service():
    """Test AI Video Service với encoding"""
    try:
        from services.ai_video_service import AIVideoService
        
        service = AIVideoService()
        
        # Test tạo demo video với ký tự tiếng Việt
        result = service.generate_video_from_text(
            prompt="Một con mèo đang chơi với quả bóng len",
            duration=5,
            platform="demo",
            style="realistic",
            aspect_ratio="16:9"
        )
        
        if result.get("success"):
            print("✅ AI Video Service encoding: OK")
            print(f"   Generated file: {result.get('filename')}")
            return True
        else:
            print(f"❌ AI Video Service failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ AI Video Service test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing encoding...")
    print("=" * 50)
    
    # Test 1: Basic encoding
    test1 = test_encoding()
    
    print("\n" + "=" * 50)
    
    # Test 2: AI Video Service
    test2 = test_ai_video_service()
    
    print("\n" + "=" * 50)
    
    if test1 and test2:
        print("🎉 All tests passed! Encoding is working correctly.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Check the errors above.")
        sys.exit(1)
