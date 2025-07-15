"""
AEON Editor Agent - Transitions Tests
Test viral transition effects and GPU-accelerated processing
"""

import pytest
import numpy as np
import tempfile
import os
from moviepy.editor import VideoFileClip, ColorClip
from app.transitions import (
    apply_viral_transitions,
    create_transition,
    zoom_punch_transition,
    glitch_transition,
    slide_transition,
    flip_3d_transition,
    viral_cut_transition,
    crossfade_transition,
    get_random_viral_transition,
    apply_transition_sequence
)

class TestViralTransitions:
    """Test suite for viral transition effects"""
    
    @pytest.fixture
    def sample_clips(self):
        """Create sample video clips for testing"""
        clips = []
        
        # Create two test clips with different colors
        for i, color in enumerate([(255, 0, 0), (0, 255, 0)]):  # Red and Green
            clip = ColorClip(
                size=(1080, 1920),  # 9:16 TikTok format
                color=color,
                duration=2.0
            ).set_fps(30)
            
            clips.append(clip)
        
        yield clips
        
        # Cleanup
        for clip in clips:
            clip.close()
    
    @pytest.fixture
    def temp_output_path(self):
        """Create temporary output path for test videos"""
        temp_dir = tempfile.mkdtemp()
        output_path = os.path.join(temp_dir, "test_transition.mp4")
        
        yield output_path
        
        # Cleanup
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rmdir(temp_dir)
    
    def test_apply_viral_transitions_basic(self, sample_clips):
        """Test basic viral transitions application"""
        result = apply_viral_transitions(
            clips=sample_clips,
            transition_type="slide",
            fade_in_out=True,
            preview_mode=False
        )
        
        assert result is not None
        assert result.duration > 0
        assert result.size == (1080, 1920)
        
        # Should be longer than individual clips due to transitions
        total_clip_duration = sum(clip.duration for clip in sample_clips)
        assert result.duration >= total_clip_duration
        
        result.close()
    
    def test_single_clip_handling(self, sample_clips):
        """Test handling of single clip (no transitions needed)"""
        single_clip = [sample_clips[0]]
        
        result = apply_viral_transitions(
            clips=single_clip,
            transition_type="zoom_punch",
            fade_in_out=True,
            preview_mode=False
        )
        
        assert result is not None
        assert abs(result.duration - single_clip[0].duration) < 1.0  # Allow for fade effects
        
        result.close()
    
    def test_empty_clips_handling(self):
        """Test handling of empty clips list"""
        with pytest.raises(ValueError, match="No clips provided"):
            apply_viral_transitions(
                clips=[],
                transition_type="zoom_punch",
                fade_in_out=False,
                preview_mode=False
            )
    
    def test_zoom_punch_transition(self, sample_clips):
        """Test zoom punch transition effect"""
        clip1, clip2 = sample_clips
        
        transition = zoom_punch_transition(clip1, clip2, duration=0.5)
        
        assert transition is not None
        assert transition.duration == 0.5
        assert transition.size == clip1.size
        
        transition.close()
    
    def test_glitch_transition(self, sample_clips):
        """Test glitch transition effect"""
        clip1, clip2 = sample_clips
        
        transition = glitch_transition(clip1, clip2, duration=0.4)
        
        assert transition is not None
        assert transition.duration == 0.4
        assert transition.size == clip1.size
        
        transition.close()
    
    def test_slide_transition(self, sample_clips):
        """Test slide transition effect"""
        clip1, clip2 = sample_clips
        
        transition = slide_transition(clip1, clip2, duration=0.6)
        
        assert transition is not None
        assert transition.duration == 0.6
        assert transition.size == clip1.size
        
        transition.close()
    
    def test_3d_flip_transition(self, sample_clips):
        """Test 3D flip transition effect"""
        clip1, clip2 = sample_clips
        
        transition = flip_3d_transition(clip1, clip2, duration=0.8)
        
        assert transition is not None
        assert transition.duration == 0.8
        assert transition.size == clip1.size
        
        transition.close()
    
    def test_viral_cut_transition(self, sample_clips):
        """Test viral cut transition effect"""
        clip1, clip2 = sample_clips
        
        transition = viral_cut_transition(clip1, clip2, duration=0.3)
        
        assert transition is not None
        assert transition.duration <= 0.3  # Viral cuts are very short
        assert transition.size == clip1.size
        
        transition.close()
    
    def test_crossfade_transition(self, sample_clips):
        """Test crossfade transition (fallback)"""
        clip1, clip2 = sample_clips
        
        transition = crossfade_transition(clip1, clip2, duration=0.5)
        
        assert transition is not None
        assert transition.duration == 0.5
        assert transition.size == clip1.size
        
        transition.close()
    
    def test_create_transition_all_types(self, sample_clips):
        """Test create_transition with all transition types"""
        clip1, clip2 = sample_clips
        transition_types = ["zoom_punch", "glitch", "slide", "3d_flip", "viral_cut"]
        
        for transition_type in transition_types:
            transition = create_transition(
                clip1, clip2, transition_type, preview_mode=False
            )
            
            assert transition is not None, f"Failed to create {transition_type} transition"
            assert transition.duration > 0
            assert transition.size == clip1.size
            
            transition.close()
    
    def test_create_transition_unknown_type(self, sample_clips):
        """Test create_transition with unknown transition type"""
        clip1, clip2 = sample_clips
        
        # Should fallback to crossfade
        transition = create_transition(
            clip1, clip2, "unknown_transition", preview_mode=False
        )
        
        assert transition is not None
        assert transition.duration > 0
        
        transition.close()
    
    def test_preview_mode_transitions(self, sample_clips):
        """Test transitions in preview mode (faster/simpler)"""
        result = apply_viral_transitions(
            clips=sample_clips,
            transition_type="zoom_punch",
            fade_in_out=True,
            preview_mode=True
        )
        
        assert result is not None
        assert result.duration > 0
        
        result.close()
    
    def test_fade_in_out_effects(self, sample_clips):
        """Test fade in/out effects"""
        # Test with fade effects
        result_with_fade = apply_viral_transitions(
            clips=sample_clips,
            transition_type="slide",
            fade_in_out=True,
            preview_mode=False
        )
        
        # Test without fade effects
        result_without_fade = apply_viral_transitions(
            clips=sample_clips,
            transition_type="slide",
            fade_in_out=False,
            preview_mode=False
        )
        
        assert result_with_fade is not None
        assert result_without_fade is not None
        
        # Both should work, duration might be slightly different
        assert result_with_fade.duration > 0
        assert result_without_fade.duration > 0
        
        result_with_fade.close()
        result_without_fade.close()
    
    def test_get_random_viral_transition(self):
        """Test random viral transition selection"""
        content_types = ["high_energy", "smooth_flow", "dramatic", "tech_gaming", "lifestyle"]
        
        for content_type in content_types:
            transition = get_random_viral_transition(content_type)
            assert transition is not None
            assert isinstance(transition, str)
            assert len(transition) > 0
        
        # Test unknown content type (should default to high_energy)
        transition = get_random_viral_transition("unknown_type")
        assert transition is not None
    
    def test_apply_transition_sequence(self, sample_clips):
        """Test applying a sequence of different transitions"""
        # Create more clips for sequence testing
        extra_clips = []
        for i, color in enumerate([(0, 0, 255), (255, 255, 0)]):  # Blue and Yellow
            clip = ColorClip(
                size=(1080, 1920),
                color=color,
                duration=1.5
            ).set_fps(30)
            extra_clips.append(clip)
        
        all_clips = sample_clips + extra_clips
        transition_sequence = ["zoom_punch", "slide", "viral_cut"]
        
        try:
            result = apply_transition_sequence(all_clips, transition_sequence)
            
            assert result is not None
            assert result.duration > 0
            assert result.size == (1080, 1920)
            
            result.close()
        
        finally:
            # Cleanup extra clips
            for clip in extra_clips:
                clip.close()
    
    def test_transition_error_handling(self, sample_clips):
        """Test transition error handling"""
        clip1, clip2 = sample_clips
        
        # Test with very short duration
        transition = create_transition(clip1, clip2, "zoom_punch", preview_mode=False)
        assert transition is not None
        
        # Test with clips of different sizes
        small_clip = ColorClip(size=(540, 960), color=(128, 128, 128), duration=1.0)
        
        try:
            transition = create_transition(clip1, small_clip, "slide", preview_mode=False)
            assert transition is not None
        finally:
            small_clip.close()
            if transition:
                transition.close()
    
    def test_transition_performance(self, sample_clips):
        """Test transition performance and timing"""
        import time
        
        start_time = time.time()
        
        result = apply_viral_transitions(
            clips=sample_clips,
            transition_type="viral_cut",  # Fastest transition
            fade_in_out=False,
            preview_mode=True  # Fastest mode
        )
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        assert result is not None
        assert processing_time < 10  # Should complete within 10 seconds
        
        result.close()
    
    def test_transition_memory_usage(self, sample_clips):
        """Test transition memory efficiency"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Apply multiple transitions
        for transition_type in ["zoom_punch", "slide", "viral_cut"]:
            result = apply_viral_transitions(
                clips=sample_clips,
                transition_type=transition_type,
                fade_in_out=False,
                preview_mode=True
            )
            
            if result:
                result.close()
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 500MB)
        assert memory_increase < 500 * 1024 * 1024
    
    def test_transition_output_quality(self, sample_clips, temp_output_path):
        """Test transition output quality and format"""
        result = apply_viral_transitions(
            clips=sample_clips,
            transition_type="zoom_punch",
            fade_in_out=True,
            preview_mode=False
        )
        
        # Export to file to test quality
        result.write_videofile(
            temp_output_path,
            codec='libx264',
            audio_codec='aac',
            fps=30,
            verbose=False,
            logger=None
        )
        
        result.close()
        
        # Verify output file
        assert os.path.exists(temp_output_path)
        assert os.path.getsize(temp_output_path) > 0
        
        # Load and verify output video
        output_clip = VideoFileClip(temp_output_path)
        assert output_clip.duration > 0
        assert output_clip.size == (1080, 1920)
        assert output_clip.fps == 30
        
        output_clip.close()

@pytest.mark.performance
class TestTransitionPerformance:
    """Performance tests for transition effects"""
    
    def test_gpu_acceleration_available(self):
        """Test if GPU acceleration is available"""
        try:
            import cupy
            # Test basic GPU operation
            gpu_array = cupy.array([1, 2, 3, 4, 5])
            result = cupy.sum(gpu_array)
            assert result > 0
        except ImportError:
            pytest.skip("CuPy not available - GPU acceleration not tested")
        except Exception:
            pytest.skip("GPU not available or not configured properly")
    
    @pytest.mark.benchmark
    def test_transition_speed_benchmark(self, sample_clips):
        """Benchmark transition processing speed"""
        import time
        
        transition_types = ["zoom_punch", "glitch", "slide", "3d_flip", "viral_cut"]
        results = {}
        
        for transition_type in transition_types:
            start_time = time.time()
            
            result = apply_viral_transitions(
                clips=sample_clips,
                transition_type=transition_type,
                fade_in_out=False,
                preview_mode=True
            )
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            results[transition_type] = processing_time
            
            if result:
                result.close()
        
        # All transitions should complete within reasonable time
        for transition_type, time_taken in results.items():
            assert time_taken < 5.0, f"{transition_type} took too long: {time_taken}s"
        
        print(f"Transition benchmark results: {results}")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
