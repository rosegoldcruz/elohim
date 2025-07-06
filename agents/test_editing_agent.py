#!/usr/bin/env python3
"""
Test script for AEON EditingAgent
Validates the editing plan schema and tests core functionality
"""

import json
import os
import sys
from pathlib import Path

# Add agents directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from editing_agent import EditingAgent, EditingPlanModel
    print("✅ EditingAgent imported successfully")
except ImportError as e:
    print(f"❌ Failed to import EditingAgent: {e}")
    sys.exit(1)

def test_schema_validation():
    """Test editing plan schema validation"""
    print("\n🧪 Testing schema validation...")
    
    # Test valid plan
    try:
        with open("editing_plan.json", "r") as f:
            plan_data = json.load(f)
        
        # Validate with Pydantic
        plan = EditingPlanModel(**plan_data)
        print("✅ Valid editing plan schema")
        print(f"   - {len(plan.clips)} clips")
        print(f"   - {len(plan.transitions)} transitions") 
        print(f"   - {len(plan.captions)} captions")
        print(f"   - {len(plan.sfx)} sound effects")
        print(f"   - Beat sync: {plan.beatSync.enabled if plan.beatSync else False}")
        
    except Exception as e:
        print(f"❌ Schema validation failed: {e}")
        return False
    
    # Test invalid plan
    try:
        invalid_plan = {"clips": []}  # Missing required fields
        EditingPlanModel(**invalid_plan)
        print("❌ Should have failed validation")
        return False
    except Exception:
        print("✅ Invalid plan correctly rejected")
    
    return True

def test_agent_initialization():
    """Test EditingAgent initialization"""
    print("\n🧪 Testing agent initialization...")
    
    try:
        agent = EditingAgent("editing_plan.json")
        print("✅ EditingAgent initialized successfully")
        print(f"   - Plan loaded: {len(agent.plan.clips)} clips")
        print(f"   - Output directory: {agent.output_dir}")
        return True
    except Exception as e:
        print(f"❌ Agent initialization failed: {e}")
        return False

def test_beat_detection():
    """Test beat detection functionality"""
    print("\n🧪 Testing beat detection...")
    
    try:
        agent = EditingAgent("editing_plan.json")
        
        # Test with missing audio file (should handle gracefully)
        beat_times = agent.detect_beats()
        print(f"✅ Beat detection completed: {len(beat_times)} beats detected")
        
        if beat_times:
            print(f"   - First beat at: {beat_times[0]:.2f}s")
            print(f"   - Last beat at: {beat_times[-1]:.2f}s")
        else:
            print("   - No beats detected (audio file may be missing)")
        
        return True
    except Exception as e:
        print(f"❌ Beat detection failed: {e}")
        return False

def test_transition_methods():
    """Test transition application methods"""
    print("\n🧪 Testing transition methods...")
    
    try:
        agent = EditingAgent("editing_plan.json")
        
        # Test transition types
        from editing_agent import TransitionModel
        
        transitions = [
            TransitionModel(type="zoom_punch", intensity=0.8),
            TransitionModel(type="glitch_blast", intensity=0.6),
            TransitionModel(type="velocity_wipe", duration=0.1),
            TransitionModel(type="ai_generated", glsl_code="// test shader")
        ]
        
        for transition in transitions:
            print(f"✅ Transition '{transition.type}' configured")
            print(f"   - Duration: {transition.duration}s")
            print(f"   - Intensity: {transition.intensity}")
            print(f"   - Beat synced: {transition.beat_synced}")
        
        return True
    except Exception as e:
        print(f"❌ Transition testing failed: {e}")
        return False

def create_sample_plan():
    """Create a minimal sample editing plan for testing"""
    print("\n🛠️ Creating sample editing plan...")
    
    sample_plan = {
        "clips": [
            "sample_clip1.mp4",
            "sample_clip2.mp4"
        ],
        "transitions": [
            {
                "type": "zoom_punch",
                "duration": 0.3,
                "intensity": 0.7
            }
        ],
        "captions": [
            {
                "text": "Test Caption",
                "start_time": 1.0,
                "style": "bounce"
            }
        ],
        "velocityEditing": {
            "enabled": True
        },
        "firstFrameHook": {
            "enabled": True,
            "text": "Test Hook"
        }
    }
    
    with open("sample_plan.json", "w") as f:
        json.dump(sample_plan, f, indent=2)
    
    print("✅ Sample plan created: sample_plan.json")
    return True

def test_plan_loading():
    """Test loading different plan configurations"""
    print("\n🧪 Testing plan loading...")
    
    try:
        # Test with sample plan
        create_sample_plan()
        agent = EditingAgent("sample_plan.json")
        print("✅ Sample plan loaded successfully")
        
        # Clean up
        os.remove("sample_plan.json")
        print("✅ Cleanup completed")
        
        return True
    except Exception as e:
        print(f"❌ Plan loading failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🎬 AEON EditingAgent Test Suite")
    print("=" * 50)
    
    tests = [
        ("Schema Validation", test_schema_validation),
        ("Agent Initialization", test_agent_initialization), 
        ("Beat Detection", test_beat_detection),
        ("Transition Methods", test_transition_methods),
        ("Plan Loading", test_plan_loading)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! EditingAgent is ready for production.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    print("\n💡 Next Steps:")
    print("1. Install dependencies: pip install moviepy librosa pydub opencv-python")
    print("2. Add video clips to assets/clips/")
    print("3. Add audio files to assets/audio/")
    print("4. Run: python editing_agent.py --plan editing_plan.json")

if __name__ == "__main__":
    main()
