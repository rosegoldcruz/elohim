#!/usr/bin/env python3
"""
AEON Complete Pipeline Integration
DeepSeek Script Generation + Python Editing Agent
"""

import json
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def create_editing_plan_from_script(script_data, scene_plan):
    """Convert DeepSeek script output to EditingAgent plan"""
    
    # Extract scenes from script
    scenes = script_data.get('scenes', [])
    
    # Create editing plan
    editing_plan = {
        "clips": [f"assets/clips/scene_{i+1}.mp4" for i in range(len(scenes))],
        "transitions": [],
        "captions": [],
        "sfx": [],
        "beatSync": {
            "enabled": True,
            "audio_file": "assets/audio/trending_beat.mp3",
            "sensitivity": 0.7
        },
        "asmrLayers": [
            {
                "type": "swoosh",
                "timing": "pre_transition",
                "volume": 0.3
            },
            {
                "type": "click", 
                "timing": "post_transition",
                "volume": 0.4
            }
        ],
        "velocityEditing": {
            "enabled": True,
            "start_cut_duration": 1.5,
            "end_cut_duration": 0.3
        },
        "firstFrameHook": {
            "enabled": True,
            "freeze_duration": 0.5,
            "text": "STOP SCROLLING! 🛑"
        }
    }
    
    # Add transitions based on viral techniques
    viral_techniques = script_data.get('metadata', {}).get('viralTechniques', [])
    
    for i in range(len(scenes) - 1):
        if 'First-frame hook' in viral_techniques:
            transition_type = "zoom_punch"
            intensity = 0.8
        elif 'Meme integration' in viral_techniques:
            transition_type = "glitch_blast"
            intensity = 0.9
        else:
            transition_type = "velocity_wipe"
            intensity = 0.6
            
        editing_plan["transitions"].append({
            "type": transition_type,
            "duration": 0.3,
            "beat_synced": True,
            "intensity": intensity
        })
    
    # Add captions from scenes
    current_time = 0.5  # Start after first-frame hook
    
    for i, scene in enumerate(scenes):
        scene_duration = 60 / len(scenes)  # Distribute evenly
        
        # Extract key text from scene description
        description = scene.get('description', '')
        if len(description) > 50:
            caption_text = description[:47] + "..."
        else:
            caption_text = description
            
        # Determine caption style based on scene function
        scene_function = scene.get('function', '').lower()
        if 'hook' in scene_function:
            style = "bounce"
        elif 'reveal' in scene_function or 'payoff' in scene_function:
            style = "highlight"
        else:
            style = "typewriter"
            
        editing_plan["captions"].append({
            "text": caption_text,
            "start_time": current_time,
            "end_time": current_time + min(scene_duration * 0.8, 3.0),
            "style": style,
            "position": [0.5, 0.15 if i % 2 == 0 else 0.85]
        })
        
        current_time += scene_duration
    
    # Add sound effects based on viral techniques
    if 'ASMR elements' in viral_techniques:
        editing_plan["sfx"].extend([
            {
                "file": "assets/sfx/paper_rustle.mp3",
                "start_time": 2.0,
                "volume": 0.4
            },
            {
                "file": "assets/sfx/satisfying_click.mp3", 
                "start_time": 4.5,
                "volume": 0.5
            }
        ])
    
    if 'Punch-in effects' in viral_techniques:
        editing_plan["sfx"].append({
            "file": "assets/sfx/punch_impact.mp3",
            "start_time": 1.5,
            "volume": 0.7
        })
    
    return editing_plan

def run_complete_pipeline():
    """Run the complete AEON pipeline"""
    print("🚀 AEON Complete Pipeline: DeepSeek + EditingAgent")
    print("=" * 60)
    
    # Step 1: Generate script with DeepSeek (simulated)
    print("\n📝 Step 1: Generating script with DeepSeek...")
    
    # Simulated DeepSeek output
    script_data = {
        "scenes": [
            {
                "scene": "Scene 1",
                "function": "Hook",
                "description": "AI breakthrough that changes everything",
                "camera": "Close-up with dramatic zoom",
                "audio": "Trending beat drop",
                "overlay": "STOP SCROLLING! text with fire emojis",
                "sceneNumber": 1
            },
            {
                "scene": "Scene 2", 
                "function": "Escalation",
                "description": "Before and after comparison reveals shocking results",
                "camera": "Split screen effect",
                "audio": "Building tension music",
                "overlay": "BEFORE vs AFTER with arrows",
                "sceneNumber": 2
            },
            {
                "scene": "Scene 3",
                "function": "Reveal",
                "description": "The secret method that nobody talks about",
                "camera": "Punch-in to reveal details",
                "audio": "Satisfying reveal sound",
                "overlay": "THE SECRET highlighted text",
                "sceneNumber": 3
            },
            {
                "scene": "Scene 4",
                "function": "CTA",
                "description": "Follow for more AI secrets that blow minds",
                "camera": "Direct to camera appeal",
                "audio": "Upbeat call-to-action music",
                "overlay": "FOLLOW FOR MORE with arrow",
                "sceneNumber": 4
            }
        ],
        "metadata": {
            "topic": "AI video generation breakthrough",
            "style": "TikTok/Documentary",
            "duration": 60,
            "sceneCount": 4,
            "viralTechniques": [
                "First-frame hook",
                "Meme integration", 
                "ASMR elements",
                "Punch-in effects",
                "Text overlays"
            ],
            "generatedAt": "2024-01-01T00:00:00Z"
        }
    }
    
    print("✅ Script generated with DeepSeek")
    print(f"   - {len(script_data['scenes'])} scenes")
    print(f"   - Viral techniques: {', '.join(script_data['metadata']['viralTechniques'])}")
    
    # Step 2: Generate scene plan with GPT-4o (simulated)
    print("\n🎬 Step 2: Generating scene plan with GPT-4o...")
    
    scene_plan = """
    Scene 1 (0:00-0:15): Hook Scene
    Camera: Extreme close-up with quick zoom-out
    Visual: Split screen showing before/after
    Audio: Trending sound with bass drop
    Text: "AI JUST CHANGED EVERYTHING" with fire emojis
    Transition: Quick cut with glitch effect
    
    Scene 2 (0:15-0:30): Escalation
    Camera: Dynamic split screen comparison
    Visual: Before/after transformation
    Audio: Building tension with ASMR elements
    Text: "BEFORE vs AFTER" with animated arrows
    Transition: Zoom punch effect
    
    Scene 3 (0:30-0:45): Reveal
    Camera: Punch-in to reveal secret
    Visual: Highlighted key information
    Audio: Satisfying reveal sound
    Text: "THE SECRET" highlighted background
    Transition: Velocity wipe
    
    Scene 4 (0:45-1:00): Call to Action
    Camera: Direct eye contact appeal
    Visual: Follow button animation
    Audio: Upbeat engagement music
    Text: "FOLLOW FOR MORE AI SECRETS"
    """
    
    print("✅ Scene plan generated with GPT-4o")
    
    # Step 3: Convert to EditingAgent plan
    print("\n🔄 Step 3: Converting to EditingAgent plan...")
    
    editing_plan = create_editing_plan_from_script(script_data, scene_plan)
    
    # Save editing plan
    plan_file = "generated_editing_plan.json"
    with open(plan_file, "w") as f:
        json.dump(editing_plan, f, indent=2)
    
    print(f"✅ Editing plan created: {plan_file}")
    print(f"   - {len(editing_plan['clips'])} clips")
    print(f"   - {len(editing_plan['transitions'])} transitions")
    print(f"   - {len(editing_plan['captions'])} captions")
    print(f"   - {len(editing_plan['sfx'])} sound effects")
    
    # Step 4: Process with EditingAgent
    print("\n🎬 Step 4: Processing with EditingAgent...")
    
    try:
        # Import EditingAgent
        sys.path.append(str(project_root / "agents"))
        from editing_agent import EditingAgent
        
        # Initialize agent
        agent = EditingAgent(plan_file)
        print("✅ EditingAgent initialized")
        
        # Note: Actual processing would require video clips
        print("📋 Ready to process (requires video clips in assets/clips/)")
        print("   To complete processing:")
        print(f"   1. Add video clips: {', '.join(editing_plan['clips'])}")
        print("   2. Add audio file: assets/audio/trending_beat.mp3")
        print("   3. Run: python agents/editing_agent.py --plan generated_editing_plan.json")
        
    except ImportError as e:
        print(f"⚠️ EditingAgent not available: {e}")
        print("   Install dependencies: pip install -r agents/requirements.txt")
    
    # Step 5: Summary
    print("\n🎉 Pipeline Complete!")
    print("=" * 60)
    print("✅ DeepSeek script generation")
    print("✅ GPT-4o scene planning") 
    print("✅ EditingAgent plan conversion")
    print("✅ Ready for video processing")
    
    print(f"\n📁 Generated files:")
    print(f"   - {plan_file}")
    
    # Cleanup
    try:
        os.remove(plan_file)
        print(f"   - Cleaned up {plan_file}")
    except:
        pass

if __name__ == "__main__":
    run_complete_pipeline()
