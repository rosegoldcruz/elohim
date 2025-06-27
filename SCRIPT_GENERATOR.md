# 🎬 AEON Script Generator

A cinematic AI-powered script generation tool integrated into the AEON platform.

## ✨ Features

- **AI-Powered Scene Generation**: Transform any topic into professional cinematic scenes
- **Customizable Parameters**: Control duration, scene count, and visual style
- **Real-time Preview**: See generated scenes instantly with professional formatting
- **AEON Design Integration**: Seamlessly integrated with the AEON platform's glassmorphism UI
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Usage

### Access the Script Generator

1. **From Homepage**: Click "Try Script Generator" button
2. **From Navigation**: Use the "Script" link in the header navigation
3. **Direct URL**: Visit `/script` page

### Generate a Script

1. **Enter Video Topic**: Describe your video concept in detail
   - Example: "A day in the life of a space explorer discovering a new planet"
   
2. **Add Visual Style** (Optional): Specify the cinematic style
   - Examples: "Blade Runner", "Pixar animation", "documentary style"
   
3. **Set Parameters**:
   - **Duration**: 30-300 seconds (default: 60)
   - **Scene Count**: 3-12 scenes (default: 6)
   
4. **Generate**: Click "Generate Script" and wait for AI processing

### Review Generated Scenes

- Each scene includes detailed cinematic descriptions
- Scenes are numbered and formatted for easy reading
- Duration per scene is automatically calculated
- Copy scenes for use in video production tools

## 🎯 Example Outputs

### Input
- **Topic**: "A chef preparing a gourmet meal in a busy restaurant kitchen"
- **Style**: "Gordon Ramsay documentary style"
- **Duration**: 60 seconds
- **Scenes**: 6

### Generated Output
1. **Scene 1**: Gordon Ramsay documentary style: Opening shot establishing the world of a chef preparing a gourmet meal in a busy restaurant kitchen. Wide cinematic angle with dramatic lighting, setting the mood and atmosphere for the story to unfold.

2. **Scene 2**: Gordon Ramsay documentary style: Introduction of key elements in a chef preparing a gourmet meal in a busy restaurant kitchen. Medium shots with warm lighting, building character development and story foundation.

[... and so on]

## 🔧 Technical Implementation

### Frontend (Next.js)
- **Location**: `/app/script/page.tsx`
- **Components**: Uses shadcn/ui components (Card, Input, Button, etc.)
- **Styling**: Tailwind CSS with AEON's glassmorphism theme
- **State Management**: React hooks for form and scene data

### Backend Integration
- **Mock Mode**: Currently uses client-side mock generation for demo
- **Production Mode**: Connects to FastAPI backend `/scriptwriter/generate` endpoint
- **API Structure**: 
  ```typescript
  Request: {
    prompt: string,
    duration: number,
    scene_count: number
  }
  
  Response: {
    success: boolean,
    scenes: string[],
    total_scenes: number,
    estimated_duration_per_scene: number
  }
  ```

## 🛠️ Development

### Enable Real API Connection

To connect to the actual AEON backend:

1. **Setup Backend**: Ensure FastAPI backend is running with proper environment variables
2. **Configure Environment**: Set `NEXT_PUBLIC_BACKEND_URL` if different from localhost:8000
3. **Update Code**: In `/app/script/page.tsx`, uncomment the real API call section and comment out the mock section

### Mock vs Real API

**Current (Mock)**:
- ✅ Works without backend setup
- ✅ Instant demonstration
- ✅ No API keys required
- ❌ Limited scene variety
- ❌ No AI intelligence

**Real API**:
- ✅ True AI-powered generation
- ✅ Unlimited scene variety
- ✅ Professional quality output
- ❌ Requires OpenAI API key
- ❌ Requires Supabase setup
- ❌ Backend dependencies

## 🎨 Design Philosophy

The script generator follows AEON's core design principles:

- **Conversion-Focused**: Every element serves the user's creative goals
- **Mobile-First**: TikTok-generation attention spans and mobile usage
- **Glassmorphism**: Translucent surfaces with backdrop blur effects
- **Purple-Pink Gradients**: Consistent with AEON's brand identity
- **Instant Feedback**: Real-time loading states and success notifications

## 🔮 Future Enhancements

- **Style Presets**: Pre-defined visual styles (Cinematic, Documentary, Commercial, etc.)
- **Scene Templates**: Industry-standard scene structures
- **Export Options**: PDF, Word, Final Draft format exports
- **Collaboration**: Share and collaborate on scripts
- **Version History**: Track script iterations
- **AI Refinement**: Refine individual scenes with AI
- **Video Integration**: Direct connection to video generation pipeline

## 📱 User Experience

The script generator is designed for:

- **Content Creators**: YouTubers, TikTokers, social media managers
- **Filmmakers**: Independent filmmakers, students, professionals
- **Marketers**: Brand managers, advertising agencies
- **Educators**: Film schools, creative writing courses
- **Hobbyists**: Anyone interested in video storytelling

## 🎬 Integration with AEON

The script generator seamlessly integrates with AEON's video generation pipeline:

1. **Generate Script** → Professional scene breakdowns
2. **Create Video** → Use scenes in AEON's video generator
3. **Refine Output** → Edit and enhance generated videos
4. **Publish** → Share completed videos across platforms

---

**Built with ❤️ for the AEON AI Video Generation Platform**
