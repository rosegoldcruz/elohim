"""
AEON Editor Agent - Pipeline Tests
Test the complete viral editing pipeline with real video processing
"""

import pytest
import asyncio
import os
import tempfile
from unittest.mock import Mock, patch
from app.pipeline import process_video_edit
from app.utils import validate_clips, resize_video, calculate_viral_score
from moviepy.editor import VideoFileClip, ColorClip

class TestAeonPipeline:
    """Test suite for AEON viral editing pipeline"""
    
    @pytest.fixture
    def sample_config(self):
        """Sample configuration for testing"""
        return {
            "transitions": "zoom_punch",
            "fade_in_out": True,
            "aspect_ratio": "9:16",
            "viral_mode": True,
            "beat_sync": True,
            "velocity_editing": True,
            "asmr_layer": True,
            "kinetic_captions": True,
            "first_frame_hook": True,
            "quality": "high",
            "watermark_text": "AEON Test"
        }
    
    @pytest.fixture
    def temp_video_clips(self):
        """Create temporary test video clips"""
        clips = []
        temp_dir = tempfile.mkdtemp()
        
        for i in range(3):
            # Create a simple test video clip
            clip_path = os.path.join(temp_dir, f"test_clip_{i}.mp4")
            
            # Create a 3-second colored clip
            color_clip = ColorClip(
                size=(1080, 1920),  # 9:16 aspect ratio
                color=(i * 80, 100, 200),  # Different colors
                duration=3.0
            )
            
            color_clip.write_videofile(
                clip_path,
                fps=30,
                codec='libx264',
                audio_codec='aac',
                verbose=False,
                logger=None
            )
            
            color_clip.close()
            clips.append(clip_path)
        
        yield clips
        
        # Cleanup
        for clip_path in clips:
            if os.path.exists(clip_path):
                os.remove(clip_path)
        os.rmdir(temp_dir)
    
    @pytest.fixture
    def temp_output_path(self):
        """Create temporary output path"""
        temp_dir = tempfile.mkdtemp()
        output_path = os.path.join(temp_dir, "test_output.mp4")
        
        yield output_path
        
        # Cleanup
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rmdir(temp_dir)
    
    @pytest.mark.asyncio
    async def test_basic_pipeline_execution(self, temp_video_clips, temp_output_path, sample_config):
        """Test basic pipeline execution with minimal features"""
        # Simplified config for basic test
        basic_config = {
            "transitions": "slide",
            "fade_in_out": True,
            "aspect_ratio": "9:16",
            "viral_mode": False,
            "beat_sync": False,
            "velocity_editing": False,
            "asmr_layer": False,
            "kinetic_captions": False,
            "first_frame_hook": False,
            "quality": "medium",
            "watermark_text": ""
        }
        
        result = await process_video_edit(
            clip_paths=temp_video_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=basic_config
        )
        
        assert result["success"] is True
        assert "processing_time" in result
        assert result["clips_processed"] == len(temp_video_clips)
        assert os.path.exists(temp_output_path)
        
        # Verify output video
        output_clip = VideoFileClip(temp_output_path)
        assert output_clip.duration > 0
        assert output_clip.size == (1080, 1920)  # 9:16 aspect ratio
        output_clip.close()
    
    @pytest.mark.asyncio
    async def test_viral_mode_pipeline(self, temp_video_clips, temp_output_path, sample_config):
        """Test pipeline with viral mode enabled"""
        result = await process_video_edit(
            clip_paths=temp_video_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=sample_config
        )
        
        assert result["success"] is True
        assert result["viral_score"] > 50  # Should have high viral score
        assert "features_applied" in result
        
        # Check that viral features were applied
        features = result["features_applied"]
        assert "viral_mode" in features
        assert "first_frame_hook" in features
        assert "velocity_editing" in features
    
    @pytest.mark.asyncio
    async def test_pipeline_with_invalid_clips(self, temp_output_path, sample_config):
        """Test pipeline behavior with invalid clip paths"""
        invalid_clips = ["/nonexistent/clip1.mp4", "/nonexistent/clip2.mp4"]
        
        result = await process_video_edit(
            clip_paths=invalid_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=sample_config
        )
        
        assert result["success"] is False
        assert "error" in result
        assert "No valid video clips found" in result["error"]
    
    @pytest.mark.asyncio
    async def test_pipeline_error_handling(self, temp_video_clips, temp_output_path):
        """Test pipeline error handling with invalid config"""
        invalid_config = {
            "transitions": "invalid_transition",
            "aspect_ratio": "invalid_ratio",
            "quality": "invalid_quality"
        }
        
        result = await process_video_edit(
            clip_paths=temp_video_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=invalid_config
        )
        
        # Should handle errors gracefully
        assert "success" in result
        assert "processing_time" in result
    
    def test_clip_validation(self, temp_video_clips):
        """Test video clip validation"""
        # Test with valid clips
        valid_clips = validate_clips(temp_video_clips)
        assert len(valid_clips) == len(temp_video_clips)
        
        # Test with invalid clips
        invalid_clips = ["/nonexistent/clip.mp4", "invalid_file.txt"]
        valid_clips = validate_clips(invalid_clips)
        assert len(valid_clips) == 0
        
        # Test with mixed valid/invalid clips
        mixed_clips = temp_video_clips + invalid_clips
        valid_clips = validate_clips(mixed_clips)
        assert len(valid_clips) == len(temp_video_clips)
    
    def test_video_resize(self, temp_video_clips):
        """Test video resizing functionality"""
        clip_path = temp_video_clips[0]
        
        # Test different aspect ratios
        aspect_ratios = ["9:16", "16:9", "1:1"]
        
        for aspect_ratio in aspect_ratios:
            resized_clip = resize_video(clip_path, aspect_ratio, "medium")
            
            # Verify aspect ratio
            width, height = resized_clip.size
            if aspect_ratio == "9:16":
                assert abs(width / height - 9/16) < 0.01
            elif aspect_ratio == "16:9":
                assert abs(width / height - 16/9) < 0.01
            elif aspect_ratio == "1:1":
                assert abs(width / height - 1.0) < 0.01
            
            resized_clip.close()
    
    def test_viral_score_calculation(self):
        """Test viral score calculation"""
        # Minimal config
        minimal_config = {
            "viral_mode": False,
            "beat_sync": False,
            "velocity_editing": False,
            "first_frame_hook": False,
            "kinetic_captions": False,
            "transitions": "slide",
            "aspect_ratio": "16:9"
        }
        
        score = calculate_viral_score(minimal_config)
        assert 40 <= score <= 60  # Should be around base score
        
        # Maximum viral config
        viral_config = {
            "viral_mode": True,
            "beat_sync": True,
            "velocity_editing": True,
            "first_frame_hook": True,
            "kinetic_captions": True,
            "transitions": "viral_cut",
            "aspect_ratio": "9:16"
        }
        
        score = calculate_viral_score(viral_config)
        assert score >= 90  # Should be high viral score
    
    @pytest.mark.asyncio
    async def test_preview_mode(self, temp_video_clips, temp_output_path):
        """Test preview mode functionality"""
        preview_config = {
            "transitions": "zoom_punch",
            "fade_in_out": True,
            "aspect_ratio": "9:16",
            "viral_mode": True,
            "quality": "medium",
            "preview_mode": True,
            "max_duration": 10
        }
        
        result = await process_video_edit(
            clip_paths=temp_video_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=preview_config
        )
        
        assert result["success"] is True
        
        # Verify preview duration
        output_clip = VideoFileClip(temp_output_path)
        assert output_clip.duration <= 10  # Should be limited to max_duration
        output_clip.close()
    
    @pytest.mark.asyncio
    async def test_watermark_functionality(self, temp_video_clips, temp_output_path):
        """Test watermark addition"""
        config = {
            "transitions": "slide",
            "fade_in_out": False,
            "aspect_ratio": "9:16",
            "viral_mode": False,
            "quality": "medium",
            "watermark_text": "AEON TEST WATERMARK"
        }
        
        result = await process_video_edit(
            clip_paths=temp_video_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=config
        )
        
        assert result["success"] is True
        assert "watermark" in result["features_applied"]
    
    @pytest.mark.asyncio
    async def test_different_transition_types(self, temp_video_clips, temp_output_path):
        """Test different transition types"""
        transitions = ["zoom_punch", "glitch", "slide", "3d_flip", "viral_cut"]
        
        for transition in transitions:
            config = {
                "transitions": transition,
                "fade_in_out": True,
                "aspect_ratio": "9:16",
                "viral_mode": False,
                "quality": "low"  # Use low quality for faster testing
            }
            
            # Use different output path for each transition
            output_path = temp_output_path.replace(".mp4", f"_{transition}.mp4")
            
            result = await process_video_edit(
                clip_paths=temp_video_clips[:2],  # Use fewer clips for speed
                bgm_path=None,
                overlay_path=None,
                captions_path=None,
                output_path=output_path,
                config=config
            )
            
            assert result["success"] is True, f"Transition {transition} failed"
            assert os.path.exists(output_path), f"Output not created for {transition}"
            
            # Cleanup
            if os.path.exists(output_path):
                os.remove(output_path)
    
    @pytest.mark.asyncio
    async def test_performance_metrics(self, temp_video_clips, temp_output_path, sample_config):
        """Test performance metrics collection"""
        result = await process_video_edit(
            clip_paths=temp_video_clips,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=temp_output_path,
            config=sample_config
        )
        
        assert result["success"] is True
        assert "processing_time" in result
        assert "viral_score" in result
        assert "clips_processed" in result
        assert "features_applied" in result
        
        # Performance should be reasonable
        assert result["processing_time"] < 60  # Should complete within 60 seconds
        assert result["clips_processed"] == len(temp_video_clips)

@pytest.mark.integration
class TestPipelineIntegration:
    """Integration tests for the complete pipeline"""
    
    @pytest.mark.asyncio
    async def test_end_to_end_viral_video(self):
        """Test complete end-to-end viral video creation"""
        # This would test with real video files in a full integration environment
        pass
    
    @pytest.mark.asyncio
    async def test_gpu_acceleration(self):
        """Test GPU acceleration if available"""
        # This would test CUDA functionality if GPU is available
        pass
    
    @pytest.mark.asyncio
    async def test_large_file_handling(self):
        """Test handling of large video files"""
        # This would test with larger video files
        pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
