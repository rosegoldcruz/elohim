#!/usr/bin/env python3
"""
Test script to verify that all modules can be imported correctly
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, '/app')

def test_import(module_name, description):
    """Test importing a module and report the result"""
    try:
        __import__(module_name)
        print(f"✅ {description}: SUCCESS")
        return True
    except Exception as e:
        print(f"❌ {description}: FAILED - {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all import tests"""
    print("Testing module imports...")
    print("=" * 50)
    
    # Test basic dependencies
    success_count = 0
    total_tests = 0
    
    tests = [
        ("numpy", "NumPy"),
        ("cv2", "OpenCV"),
        ("moviepy.editor", "MoviePy"),
        ("app.transitions", "Transitions module"),
        ("app.main", "Main module"),
    ]
    
    for module, description in tests:
        total_tests += 1
        if test_import(module, description):
            success_count += 1
    
    print("=" * 50)
    print(f"Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All imports successful!")
        return 0
    else:
        print("⚠️  Some imports failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
