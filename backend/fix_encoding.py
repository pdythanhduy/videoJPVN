#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix encoding issues trong tất cả các file Python
"""

import os
import re
from pathlib import Path

def fix_file_encoding(file_path: Path):
    """Fix encoding trong một file"""
    try:
        # Đọc file với encoding mặc định
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Tìm các pattern cần fix
        patterns_to_fix = [
            # Fix open() without encoding
            (r'open\(([^)]+),\s*[\'"]w[\'"]\)', r'open(\1, \'w\', encoding=\'utf-8\')'),
            (r'open\(([^)]+),\s*[\'"]a[\'"]\)', r'open(\1, \'a\', encoding=\'utf-8\')'),
            (r'open\(([^)]+),\s*[\'"]r[\'"]\)', r'open(\1, \'r\', encoding=\'utf-8\')'),
        ]
        
        original_content = content
        for pattern, replacement in patterns_to_fix:
            content = re.sub(pattern, replacement, content)
        
        # Chỉ ghi file nếu có thay đổi
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {file_path}")
            return True
        else:
            print(f"⏭️  No changes needed: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def fix_all_files():
    """Fix encoding trong tất cả các file Python"""
    current_dir = Path(__file__).parent
    python_files = list(current_dir.rglob("*.py"))
    
    print(f"🔍 Found {len(python_files)} Python files to check...")
    print("=" * 60)
    
    fixed_count = 0
    for file_path in python_files:
        if fix_file_encoding(file_path):
            fixed_count += 1
    
    print("=" * 60)
    print(f"🎉 Fixed {fixed_count} files out of {len(python_files)} total files")

def check_encoding_issues():
    """Kiểm tra các file có thể có lỗi encoding"""
    current_dir = Path(__file__).parent
    python_files = list(current_dir.rglob("*.py"))
    
    print("🔍 Checking for potential encoding issues...")
    print("=" * 60)
    
    issues_found = 0
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Tìm các pattern có thể gây lỗi
            problematic_patterns = [
                r'open\([^)]+,\s*[\'"]w[\'"]\)(?!.*encoding)',
                r'open\([^)]+,\s*[\'"]a[\'"]\)(?!.*encoding)',
                r'open\([^)]+,\s*[\'"]r[\'"]\)(?!.*encoding)',
            ]
            
            for pattern in problematic_patterns:
                if re.search(pattern, content):
                    print(f"⚠️  Potential issue in {file_path}")
                    issues_found += 1
                    break
                    
        except Exception as e:
            print(f"❌ Error checking {file_path}: {e}")
    
    if issues_found == 0:
        print("✅ No encoding issues found!")
    else:
        print(f"⚠️  Found {issues_found} files with potential encoding issues")

if __name__ == "__main__":
    print("🔧 Fixing encoding issues...")
    print("=" * 60)
    
    # Check for issues first
    check_encoding_issues()
    
    print("\n" + "=" * 60)
    
    # Fix issues
    fix_all_files()
    
    print("\n" + "=" * 60)
    print("🎉 Encoding fix completed!")
