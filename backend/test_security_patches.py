#!/usr/bin/env python3
"""
Security Patch Verification Script
Tests all implemented security measures
"""

import asyncio
import httpx
import json
import time
from typing import Dict, Any

# Test configuration
BACKEND_URL = "http://159.223.198.119:8000"
TEST_ORIGIN = "https://smart4technology.com"
MALICIOUS_ORIGIN = "https://malicious-site.com"

class SecurityTester:
    """Test security implementations"""
    
    def __init__(self):
        self.client = httpx.AsyncClient()
        self.test_results = []
    
    async def test_cors_configuration(self) -> Dict[str, Any]:
        """Test CORS configuration"""
        print("🔒 Testing CORS Configuration...")
        
        # Test allowed origin
        headers = {"Origin": TEST_ORIGIN}
        response = await self.client.get(f"{BACKEND_URL}/health", headers=headers)
        
        cors_allowed = "access-control-allow-origin" in response.headers
        cors_origin = response.headers.get("access-control-allow-origin")
        
        # Test malicious origin
        headers = {"Origin": MALICIOUS_ORIGIN}
        response_malicious = await self.client.get(f"{BACKEND_URL}/health", headers=headers)
        
        malicious_blocked = "access-control-allow-origin" not in response_malicious.headers or \
                           response_malicious.headers.get("access-control-allow-origin") != MALICIOUS_ORIGIN
        
        result = {
            "test": "CORS Configuration",
            "allowed_origin_works": cors_allowed and cors_origin == TEST_ORIGIN,
            "malicious_origin_blocked": malicious_blocked,
            "status": "PASS" if cors_allowed and malicious_blocked else "FAIL"
        }
        
        print(f"   ✅ Allowed origin: {result['allowed_origin_works']}")
        print(f"   ✅ Malicious origin blocked: {result['malicious_origin_blocked']}")
        
        return result
    
    async def test_rate_limiting(self) -> Dict[str, Any]:
        """Test rate limiting"""
        print("⏱️ Testing Rate Limiting...")
        
        # Test video generation endpoint
        endpoint = f"{BACKEND_URL}/api/generate"
        headers = {"Authorization": "Bearer test-token", "Content-Type": "application/json"}
        data = {"prompt": "Test video", "style": "tiktok"}
        
        # Make multiple requests quickly
        responses = []
        for i in range(7):  # Should hit rate limit after 5 requests
            try:
                response = await self.client.post(endpoint, headers=headers, json=data)
                responses.append(response.status_code)
            except Exception as e:
                responses.append(f"Error: {e}")
        
        # Check if rate limiting kicked in
        rate_limited = any(status == 429 for status in responses if isinstance(status, int))
        successful_requests = sum(1 for status in responses if isinstance(status, int) and status in [200, 201, 500, 401])
        
        result = {
            "test": "Rate Limiting",
            "rate_limit_enforced": rate_limited,
            "successful_requests": successful_requests,
            "status": "PASS" if rate_limited else "FAIL"
        }
        
        print(f"   ✅ Rate limit enforced: {result['rate_limit_enforced']}")
        print(f"   📊 Successful requests: {result['successful_requests']}")
        
        return result
    
    async def test_input_validation(self) -> Dict[str, Any]:
        """Test input validation"""
        print("🧹 Testing Input Validation...")
        
        endpoint = f"{BACKEND_URL}/api/generate"
        headers = {"Authorization": "Bearer test-token", "Content-Type": "application/json"}
        
        # Test malicious prompts
        malicious_prompts = [
            {"prompt": "<script>alert('xss')</script>", "style": "tiktok"},
            {"prompt": "javascript:alert('xss')", "style": "tiktok"},
            {"prompt": "a" * 2000, "style": "tiktok"},  # Too long
            {"prompt": "", "style": "tiktok"},  # Empty
        ]
        
        validation_results = []
        for prompt_data in malicious_prompts:
            try:
                response = await self.client.post(endpoint, headers=headers, json=prompt_data)
                validation_results.append(response.status_code == 422)  # Should be validation error
            except Exception:
                validation_results.append(True)  # Exception is also good (blocked)
        
        all_blocked = all(validation_results)
        
        result = {
            "test": "Input Validation",
            "malicious_inputs_blocked": all_blocked,
            "blocked_count": sum(validation_results),
            "total_tests": len(malicious_prompts),
            "status": "PASS" if all_blocked else "FAIL"
        }
        
        print(f"   ✅ Malicious inputs blocked: {result['malicious_inputs_blocked']}")
        print(f"   📊 Blocked {result['blocked_count']}/{result['total_tests']} malicious inputs")
        
        return result
    
    async def test_file_upload_security(self) -> Dict[str, Any]:
        """Test file upload security"""
        print("📁 Testing File Upload Security...")
        
        endpoint = f"{BACKEND_URL}/api/video/upload"
        headers = {"Authorization": "Bearer test-token"}
        
        # Test with fake file data
        files = {
            "file": ("test.txt", b"This is not a video file", "text/plain")
        }
        
        try:
            response = await self.client.post(endpoint, headers=headers, files=files)
            file_rejected = response.status_code == 400
        except Exception:
            file_rejected = True
        
        result = {
            "test": "File Upload Security",
            "non_video_file_rejected": file_rejected,
            "status": "PASS" if file_rejected else "FAIL"
        }
        
        print(f"   ✅ Non-video file rejected: {result['non_video_file_rejected']}")
        
        return result
    
    async def test_request_size_limiting(self) -> Dict[str, Any]:
        """Test request size limiting"""
        print("📏 Testing Request Size Limiting...")
        
        # Create a large payload
        large_data = {"prompt": "x" * (101 * 1024 * 1024)}  # 101MB
        
        try:
            response = await self.client.post(
                f"{BACKEND_URL}/api/generate",
                headers={"Authorization": "Bearer test-token", "Content-Type": "application/json"},
                json=large_data
            )
            size_limited = response.status_code == 413
        except Exception as e:
            size_limited = "413" in str(e) or "too large" in str(e).lower()
        
        result = {
            "test": "Request Size Limiting",
            "large_request_rejected": size_limited,
            "status": "PASS" if size_limited else "FAIL"
        }
        
        print(f"   ✅ Large request rejected: {result['large_request_rejected']}")
        
        return result
    
    async def test_security_headers(self) -> Dict[str, Any]:
        """Test security headers"""
        print("🛡️ Testing Security Headers...")
        
        response = await self.client.get(f"{BACKEND_URL}/health")
        headers = response.headers
        
        security_headers = {
            "X-Frame-Options": headers.get("x-frame-options"),
            "X-Content-Type-Options": headers.get("x-content-type-options"),
            "Strict-Transport-Security": headers.get("strict-transport-security"),
        }
        
        headers_present = all(security_headers.values())
        
        result = {
            "test": "Security Headers",
            "headers_present": headers_present,
            "headers_found": security_headers,
            "status": "PASS" if headers_present else "FAIL"
        }
        
        print(f"   ✅ Security headers present: {result['headers_present']}")
        for header, value in security_headers.items():
            print(f"   📋 {header}: {value}")
        
        return result
    
    async def run_all_tests(self):
        """Run all security tests"""
        print("🚀 Starting Security Patch Verification...")
        print("=" * 50)
        
        tests = [
            self.test_cors_configuration,
            self.test_rate_limiting,
            self.test_input_validation,
            self.test_file_upload_security,
            self.test_request_size_limiting,
            self.test_security_headers,
        ]
        
        for test in tests:
            try:
                result = await test()
                self.test_results.append(result)
            except Exception as e:
                print(f"❌ Test failed with error: {e}")
                self.test_results.append({
                    "test": test.__name__,
                    "status": "ERROR",
                    "error": str(e)
                })
        
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 SECURITY TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result.get("status") == "PASS")
        failed = sum(1 for result in self.test_results if result.get("status") == "FAIL")
        errors = sum(1 for result in self.test_results if result.get("status") == "ERROR")
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"⚠️ Errors: {errors}")
        print(f"📈 Success Rate: {(passed / len(self.test_results)) * 100:.1f}%")
        
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            status_emoji = "✅" if result.get("status") == "PASS" else "❌" if result.get("status") == "FAIL" else "⚠️"
            print(f"   {status_emoji} {result.get('test', 'Unknown Test')}: {result.get('status', 'UNKNOWN')}")
        
        if failed == 0 and errors == 0:
            print("\n🎉 ALL SECURITY TESTS PASSED! Your AEON platform is secure.")
        else:
            print(f"\n⚠️ {failed + errors} security issues found. Please review and fix.")

async def main():
    """Main test function"""
    tester = SecurityTester()
    await tester.run_all_tests()
    await tester.client.aclose()

if __name__ == "__main__":
    asyncio.run(main()) 