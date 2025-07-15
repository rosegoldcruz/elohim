# AEON Editor Agent - Assets Directory

This directory contains all the assets used by the AEON Viral Python Editing Agent for creating viral TikTok content.

## Directory Structure

```
assets/
├── fonts/              # Custom fonts for viral captions
├── sfx/               # Sound effects library for viral engagement
├── overlays/          # Logo and watermark assets
├── presets/           # Viral editing presets and configurations
└── templates/         # Video templates and layouts
```

## Fonts Directory (`fonts/`)

Contains custom fonts optimized for mobile viewing and viral content:

- `Arial-Bold.ttf` - Primary font for captions
- `Impact.ttf` - High-impact headers and hooks
- `Roboto-Bold.ttf` - Clean, readable font
- `Montserrat-ExtraBold.ttf` - Modern, attention-grabbing
- `Bebas-Neue.ttf` - Condensed, powerful font

### Font Usage Guidelines:
- Use bold fonts for maximum readability on mobile
- Ensure high contrast with background
- Test on various screen sizes
- Consider accessibility requirements

## SFX Directory (`sfx/`)

Viral sound effects library organized by category:

### Transition SFX
- `whoosh_1.wav`, `whoosh_2.wav`, `whoosh_3.wav` - Swoosh effects
- `pop_1.wav`, `pop_2.wav`, `pop_3.wav` - Pop sounds
- `glitch_1.wav`, `glitch_2.wav` - Digital glitch effects
- `boom_1.wav`, `boom_2.wav` - Impact sounds
- `zap_1.wav`, `zap_2.wav` - Electric zap effects

### ASMR SFX
- `paper_rustle_1.wav`, `paper_rustle_2.wav` - Paper sounds
- `keyboard_typing_1.wav`, `keyboard_typing_2.wav` - Typing sounds
- `water_drop_1.wav`, `water_drop_2.wav` - Water droplets
- `bubble_wrap_1.wav`, `bubble_wrap_2.wav` - Bubble popping
- `rain_ambient.wav` - Rain background

### Viral SFX
- `air_horn_1.wav`, `air_horn_2.wav` - Air horn blasts
- `vinyl_scratch_1.wav`, `vinyl_scratch_2.wav` - DJ scratch effects
- `click_1.wav`, `click_2.wav` - UI click sounds
- `ding_1.wav`, `ding_2.wav` - Notification sounds

### Usage Guidelines:
- Keep SFX volume at 30-40% of main audio
- Use sparingly for maximum impact
- Match SFX to content type and energy level
- Ensure SFX are royalty-free or properly licensed

## Overlays Directory (`overlays/`)

Logo and watermark assets for branding:

- `aeon_logo.png` - Main AEON logo (transparent background)
- `aeon_watermark.png` - Subtle watermark version
- `social_icons/` - Social media platform icons
- `badges/` - Achievement and verification badges
- `frames/` - Decorative frames and borders

### Overlay Specifications:
- PNG format with transparency
- High resolution (minimum 1080p)
- Optimized file sizes
- Multiple size variants available

## Presets Directory (`presets/`)

Viral editing presets and configurations:

### Content Type Presets
- `tiktok_dance.json` - Optimized for dance content
- `tutorial.json` - Educational content settings
- `comedy.json` - Comedy and entertainment
- `lifestyle.json` - Lifestyle and vlog content
- `gaming.json` - Gaming content optimization

### Transition Presets
- `high_energy.json` - Fast-paced, energetic transitions
- `smooth_flow.json` - Smooth, flowing transitions
- `dramatic.json` - Dramatic, impactful transitions

### Example Preset Structure:
```json
{
  "name": "TikTok Dance",
  "description": "Optimized for viral dance content",
  "settings": {
    "transitions": "viral_cut",
    "beat_sync": true,
    "velocity_editing": true,
    "first_frame_hook": true,
    "asmr_layer": false,
    "kinetic_captions": true,
    "aspect_ratio": "9:16",
    "quality": "high"
  },
  "viral_score_target": 95
}
```

## Templates Directory (`templates/`)

Video templates and layouts:

- `tiktok_template.json` - Standard TikTok layout
- `instagram_stories.json` - Instagram Stories format
- `youtube_shorts.json` - YouTube Shorts optimization
- `square_format.json` - 1:1 square format

## Asset Management

### Adding New Assets

1. **Fonts**: Add to `fonts/` directory with proper licensing
2. **SFX**: Organize by category in `sfx/` subdirectories
3. **Overlays**: Ensure transparency and multiple sizes
4. **Presets**: Follow JSON schema for consistency

### File Naming Conventions

- Use lowercase with underscores: `file_name.ext`
- Include version numbers for variants: `logo_v2.png`
- Use descriptive names: `whoosh_fast.wav` vs `sound1.wav`

### Licensing Requirements

All assets must be:
- Royalty-free or properly licensed
- Cleared for commercial use
- Documented with source and license info
- Compliant with platform guidelines

### Quality Standards

- **Audio**: 44.1kHz, 16-bit minimum
- **Images**: PNG with transparency, 1080p+
- **Fonts**: TrueType (.ttf) or OpenType (.otf)
- **File sizes**: Optimized for fast loading

## Integration with Code

Assets are loaded dynamically by the editing pipeline:

```python
# Font loading
font_path = os.path.join("assets", "fonts", "Arial-Bold.ttf")

# SFX loading
sfx_path = os.path.join("assets", "sfx", "whoosh_1.wav")

# Overlay loading
overlay_path = os.path.join("assets", "overlays", "aeon_logo.png")
```

## Performance Considerations

- Assets are cached in memory for faster access
- Large files are loaded on-demand
- Compressed formats used where possible
- CDN integration for production deployment

## Viral Optimization

Assets are specifically chosen and optimized for:
- Mobile viewing experience
- TikTok algorithm preferences
- Maximum engagement potential
- Cross-platform compatibility
- Accessibility compliance

## Maintenance

Regular maintenance includes:
- Updating assets based on trends
- Optimizing file sizes
- Adding new viral sound effects
- Refreshing font selections
- Testing cross-platform compatibility

## Contributing

When adding new assets:
1. Follow naming conventions
2. Ensure proper licensing
3. Test with various content types
4. Document usage guidelines
5. Update this README

---

**Note**: This assets directory is essential for the viral optimization capabilities of the AEON Editor Agent. All assets are carefully curated for maximum engagement and platform compliance.
