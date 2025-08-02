#!/usr/bin/env python3
"""
Test script for AEON Video Generation API
Tests the /generate and /generate/status endpoints
"""

import asyncio
import json
import os
import sys
import time
from typing import Dict, Any

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
REPLICATE_TOKEN = os.getenv("REPLICATE_API_TOKEN")

async def test_health_endpoint():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False

async def test_generate_endpoint():
    """Test the video generation endpoint"""
    print("\n🎬 Testing video generation endpoint...")
    
    if not REPLICATE_TOKEN:
        print("❌ REPLICATE_API_TOKEN not set, skipping generation test")
        return None
    
    payload = {
        "prompt": "a beautiful sunset over mountains, cinematic style",
        "model": "kling",
        "width": 576,
        "height": 1024,
        "duration": 4
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                prediction_id = data.get("id")
                print(f"✅ Generation started successfully")
                print(f"   Prediction ID: {prediction_id}")
                print(f"   Status: {data.get('status')}")
                return prediction_id
            else:
                print(f"❌ Generation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Generation error: {e}")
            return None

async def test_status_endpoint(prediction_id: str):
    """Test the status checking endpoint"""
    print(f"\n📊 Testing status endpoint for prediction: {prediction_id}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(f"{BACKEND_URL}/generate/status/{prediction_id}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status check successful")
                print(f"   Status: {data.get('status')}")
                print(f"   Created: {data.get('created_at')}")
                
                if data.get('output'):
                    print(f"   Output: {data.get('output')}")
                
                if data.get('logs'):
                    print(f"   Latest log: {data.get('logs')[-1] if data.get('logs') else 'None'}")
                
                return data
            else:
                print(f"❌ Status check failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Status check error: {e}")
            return None

async def poll_until_complete(prediction_id: str, max_attempts: int = 20):
    """Poll the status endpoint until completion"""
    print(f"\n⏳ Polling for completion (max {max_attempts} attempts)...")
    
    for attempt in range(max_attempts):
        status_data = await test_status_endpoint(prediction_id)
        
        if not status_data:
            print(f"❌ Failed to get status on attempt {attempt + 1}")
            continue
        
        status = status_data.get('status')
        
        if status == 'succeeded':
            print(f"🎉 Generation completed successfully!")
            output = status_data.get('output')
            if output:
                print(f"   Video URL: {output[0] if isinstance(output, list) else output}")
            return status_data
        
        elif status == 'failed':
            print(f"❌ Generation failed")
            error = status_data.get('error')
            if error:
                print(f"   Error: {error}")
            return status_data
        
        elif status in ['starting', 'processing']:
            print(f"   Attempt {attempt + 1}/{max_attempts}: Status is '{status}', waiting...")
            await asyncio.sleep(5)  # Wait 5 seconds between polls
        
        else:
            print(f"   Unknown status: {status}")
            await asyncio.sleep(5)
    
    print(f"⏰ Polling timeout after {max_attempts} attempts")
    return None

async def run_full_test():
    """Run the complete test suite"""
    print("🚀 AEON Video Generation API Test Suite")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = await test_health_endpoint()
    if not health_ok:
        print("❌ Health check failed, aborting tests")
        return False
    
    # Test 2: Generate video
    prediction_id = await test_generate_endpoint()
    if not prediction_id:
        print("❌ Video generation failed, skipping status tests")
        return False
    
    # Test 3: Check status immediately
    await test_status_endpoint(prediction_id)
    
    # Test 4: Poll until complete (optional - can take 1-2 minutes)
    print("\n❓ Do you want to poll until completion? This may take 1-2 minutes.")
    print("   Press Enter to continue, or Ctrl+C to skip...")
    
    try:
        input()  # Wait for user input
        final_status = await poll_until_complete(prediction_id)
        
        if final_status and final_status.get('status') == 'succeeded':
            print("\n🎉 Full test suite completed successfully!")
            return True
        else:
            print("\n⚠️  Test suite completed with issues")
            return False
            
    except KeyboardInterrupt:
        print("\n⏭️  Skipping completion polling")
        print("\n✅ Basic test suite completed successfully!")
        return True

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        global BACKEND_URL
        BACKEND_URL = sys.argv[1]
    
    print(f"Testing backend at: {BACKEND_URL}")
    
    try:
        success = asyncio.run(run_full_test())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
