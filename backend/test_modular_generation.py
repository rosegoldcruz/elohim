#!/usr/bin/env python3
"""
Test script for AEON Modular Video Generation API
Tests the /api/generate/modular and /api/poll/modular-status endpoints
"""

import asyncio
import json
import os
import sys
import time
from typing import Dict, Any, List

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

async def test_models_endpoint():
    """Test the models endpoint"""
    print("\n🤖 Testing models endpoint...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/api/generate/models")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Models endpoint successful")
                print(f"   Fast models (5s): {[m['id'] for m in data.get('fast_models_5s', [])]}")
                print(f"   Stable models (10s): {[m['id'] for m in data.get('stable_models_10s', [])]}")
                return data
            else:
                print(f"❌ Models endpoint failed: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Models endpoint error: {e}")
            return None

async def test_modular_generate():
    """Test the modular generation endpoint"""
    print("\n🎬 Testing modular generation endpoint...")
    
    if not REPLICATE_TOKEN:
        print("❌ REPLICATE_API_TOKEN not set, skipping generation test")
        return None
    
    # Create test scenes
    scenes = [
        {
            "segment_id": "test_scene_1",
            "prompt_text": "a beautiful sunset over mountains, cinematic style - Scene 1",
            "duration": 5,
            "model": "kling",
            "width": 576,
            "height": 1024
        },
        {
            "segment_id": "test_scene_2", 
            "prompt_text": "a beautiful sunset over mountains, cinematic style - Scene 2",
            "duration": 5,
            "model": "haiper",
            "width": 576,
            "height": 1024
        }
    ]
    
    payload = {"scenes": scenes}
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/generate/modular",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Modular generation started successfully")
                print(f"   Total scenes: {data.get('total_scenes')}")
                print(f"   Successful launches: {data.get('successful_launches')}")
                print(f"   Failed launches: {data.get('failed_launches')}")
                
                # Extract poll URLs
                poll_urls = []
                for scene in data.get('scenes', []):
                    if scene.get('poll_url'):
                        poll_urls.append(scene['poll_url'])
                        print(f"   Scene {scene.get('scene_id')}: {scene.get('status')} ({scene.get('model')})")
                
                return poll_urls
            else:
                print(f"❌ Modular generation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Modular generation error: {e}")
            return None

async def test_modular_status(poll_urls: List[str]):
    """Test the modular status endpoint"""
    print(f"\n📊 Testing modular status endpoint with {len(poll_urls)} URLs...")
    
    payload = {"poll_urls": poll_urls}
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/poll/modular-status",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status check successful")
                
                summary = data.get('summary', {})
                print(f"   Total: {summary.get('total')}")
                print(f"   Completed: {summary.get('completed')}")
                print(f"   Failed: {summary.get('failed')}")
                print(f"   In Progress: {summary.get('in_progress')}")
                
                # Show individual scene status
                for i, scene in enumerate(data.get('scenes', [])):
                    status = scene.get('status')
                    prediction_id = scene.get('prediction_id', 'unknown')[:8]
                    print(f"   Scene {i+1} ({prediction_id}): {status}")
                    
                    if scene.get('output_url'):
                        print(f"     Output: {scene['output_url'][:50]}...")
                    if scene.get('error'):
                        print(f"     Error: {scene['error']}")
                
                return data
            else:
                print(f"❌ Status check failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Status check error: {e}")
            return None

async def poll_until_complete(poll_urls: List[str], max_attempts: int = 30):
    """Poll until all scenes are complete"""
    print(f"\n⏳ Polling until completion (max {max_attempts} attempts)...")
    
    for attempt in range(max_attempts):
        status_data = await test_modular_status(poll_urls)
        
        if not status_data:
            print(f"❌ Failed to get status on attempt {attempt + 1}")
            await asyncio.sleep(5)
            continue
        
        summary = status_data.get('summary', {})
        completed = summary.get('completed', 0)
        failed = summary.get('failed', 0)
        in_progress = summary.get('in_progress', 0)
        total = summary.get('total', 0)
        
        if completed == total:
            print(f"🎉 All scenes completed successfully!")
            
            # Show final results
            for i, scene in enumerate(status_data.get('scenes', [])):
                if scene.get('output_url'):
                    print(f"   Scene {i+1} URL: {scene['output_url']}")
            
            return status_data
        
        elif failed > 0 and in_progress == 0:
            print(f"❌ Generation completed with {failed} failures")
            return status_data
        
        elif in_progress > 0:
            print(f"   Attempt {attempt + 1}/{max_attempts}: {completed} done, {in_progress} processing, {failed} failed")
            await asyncio.sleep(8)  # Wait 8 seconds between polls
        
        else:
            print(f"   Unknown state: completed={completed}, failed={failed}, in_progress={in_progress}")
            await asyncio.sleep(5)
    
    print(f"⏰ Polling timeout after {max_attempts} attempts")
    return None

async def run_full_test():
    """Run the complete test suite"""
    print("🚀 AEON Modular Video Generation API Test Suite")
    print("=" * 60)
    
    # Test 1: Health check
    health_ok = await test_health_endpoint()
    if not health_ok:
        print("❌ Health check failed, aborting tests")
        return False
    
    # Test 2: Models endpoint
    models = await test_models_endpoint()
    if not models:
        print("⚠️ Models endpoint failed, but continuing...")
    
    # Test 3: Start modular generation
    poll_urls = await test_modular_generate()
    if not poll_urls:
        print("❌ Modular generation failed, skipping status tests")
        return False
    
    # Test 4: Check status immediately
    await test_modular_status(poll_urls)
    
    # Test 5: Poll until complete (optional)
    print("\n❓ Do you want to poll until completion? This may take 2-5 minutes.")
    print("   Press Enter to continue, or Ctrl+C to skip...")
    
    try:
        input()  # Wait for user input
        final_status = await poll_until_complete(poll_urls)
        
        if final_status:
            summary = final_status.get('summary', {})
            if summary.get('completed', 0) > 0:
                print("\n🎉 Modular test suite completed successfully!")
                return True
            else:
                print("\n⚠️ Test suite completed but no scenes succeeded")
                return False
        else:
            print("\n⚠️ Test suite completed with polling timeout")
            return False
            
    except KeyboardInterrupt:
        print("\n⏭️ Skipping completion polling")
        print("\n✅ Basic modular test suite completed successfully!")
        return True

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        global BACKEND_URL
        BACKEND_URL = sys.argv[1]
    
    print(f"Testing modular backend at: {BACKEND_URL}")
    
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
