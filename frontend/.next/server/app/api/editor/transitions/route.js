(()=>{var e={};e.id=1676,e.ids=[1676],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14343:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>g,routeModule:()=>p,serverHooks:()=>v,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>d});var o={};t.r(o),t.d(o,{GET:()=>l,POST:()=>c});var i=t(96559),s=t(48088),a=t(37719),n=t(32190);let u=[{id:"zoom-punch",name:"Zoom Punch",category:"tiktok-essentials",duration:.3,intensity:"extreme",viralScore:9.2,previewUrl:"/transitions/previews/zoom-punch.mp4",glslCode:`
      precision mediump float;
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform float u_progress;
      uniform float u_intensity;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float zoom = 1.0 + u_progress * u_intensity * 2.0;
        vec2 zoomedCoord = center + (v_texCoord - center) / zoom;
        
        vec4 color1 = texture2D(u_texture1, zoomedCoord);
        vec4 color2 = texture2D(u_texture2, v_texCoord);
        
        float alpha = smoothstep(0.7, 1.0, u_progress);
        gl_FragColor = mix(color1, color2, alpha);
      }
    `,parameters:[{name:"intensity",type:"float",value:1.5,min:.5,max:3,step:.1,description:"Zoom intensity"}],description:"High-energy zoom transition perfect for TikTok content",tags:["viral","energetic","zoom","punch"]},{id:"glitch-blast",name:"Glitch Blast",category:"glitch",duration:.4,intensity:"extreme",viralScore:8.8,previewUrl:"/transitions/previews/glitch-blast.mp4",glslCode:`
      precision mediump float;
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform float u_progress;
      uniform float u_glitchAmount;
      varying vec2 v_texCoord;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = v_texCoord;
        float glitch = u_progress * u_glitchAmount;
        
        // RGB separation
        float r = texture2D(u_texture1, uv + vec2(glitch * 0.01, 0.0)).r;
        float g = texture2D(u_texture1, uv).g;
        float b = texture2D(u_texture1, uv - vec2(glitch * 0.01, 0.0)).b;
        
        vec4 color1 = vec4(r, g, b, 1.0);
        vec4 color2 = texture2D(u_texture2, uv);
        
        // Digital noise
        float noise = random(uv + u_progress) * glitch;
        color1.rgb += noise * 0.1;
        
        gl_FragColor = mix(color1, color2, smoothstep(0.3, 0.7, u_progress));
      }
    `,parameters:[{name:"glitchAmount",type:"float",value:.8,min:.1,max:1,step:.1,description:"Glitch intensity"}],description:"Digital glitch effect with RGB separation",tags:["glitch","digital","cyberpunk","modern"]},{id:"film-burn",name:"Film Burn",category:"cinematic",duration:.6,intensity:"moderate",viralScore:7.5,previewUrl:"/transitions/previews/film-burn.mp4",glslCode:`
      precision mediump float;
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform float u_progress;
      uniform float u_burnSpeed;
      varying vec2 v_texCoord;
      
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = v_texCoord;
        float burn = u_progress * u_burnSpeed;
        
        // Create burn pattern
        float burnPattern = noise(uv * 10.0 + burn * 5.0);
        float burnMask = smoothstep(burn - 0.1, burn + 0.1, burnPattern);
        
        vec4 color1 = texture2D(u_texture1, uv);
        vec4 color2 = texture2D(u_texture2, uv);
        
        // Add orange burn effect
        vec3 burnColor = vec3(1.0, 0.5, 0.1);
        color1.rgb = mix(color1.rgb, burnColor, burnMask * 0.8);
        
        gl_FragColor = mix(color1, color2, smoothstep(0.4, 0.8, u_progress));
      }
    `,parameters:[{name:"burnSpeed",type:"float",value:1,min:.5,max:2,step:.1,description:"Burn speed"}],description:"Classic film burn transition for cinematic feel",tags:["cinematic","vintage","film","classic"]},{id:"cube-rotate",name:"Cube Rotate",category:"3d-transforms",duration:.5,intensity:"strong",viralScore:8.1,previewUrl:"/transitions/previews/cube-rotate.mp4",glslCode:`
      precision mediump float;
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform float u_progress;
      uniform int u_axis;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        float angle = u_progress * 3.14159;
        
        // Simple cube rotation simulation
        float face = step(0.5, u_progress);
        vec2 rotatedUV = uv;
        
        if (u_axis == 0) { // X-axis
          rotatedUV.x = uv.x * cos(angle) - (uv.y - 0.5) * sin(angle) + 0.5;
        } else if (u_axis == 1) { // Y-axis
          rotatedUV.y = uv.y * cos(angle) - (uv.x - 0.5) * sin(angle) + 0.5;
        }
        
        vec4 color1 = texture2D(u_texture1, rotatedUV);
        vec4 color2 = texture2D(u_texture2, uv);
        
        gl_FragColor = mix(color1, color2, face);
      }
    `,parameters:[{name:"axis",type:"int",value:1,min:0,max:2,step:1,description:"Rotation axis (0=X, 1=Y, 2=Z)"}],description:"3D cube rotation transition",tags:["3d","rotation","geometric","modern"]},{id:"starfield",name:"Starfield",category:"particle-fx",duration:.7,intensity:"moderate",viralScore:7.8,previewUrl:"/transitions/previews/starfield.mp4",glslCode:`
      precision mediump float;
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform float u_progress;
      uniform float u_starDensity;
      varying vec2 v_texCoord;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Generate stars
        vec2 starUV = uv * 50.0;
        float star = random(floor(starUV));
        star = step(1.0 - u_starDensity * 0.01, star);
        
        // Animate stars
        float starAlpha = sin(u_progress * 6.28 + star * 100.0) * 0.5 + 0.5;
        vec3 starColor = vec3(1.0) * star * starAlpha;
        
        vec4 color1 = texture2D(u_texture1, uv);
        vec4 color2 = texture2D(u_texture2, uv);
        
        vec4 result = mix(color1, color2, u_progress);
        result.rgb += starColor * 0.5;
        
        gl_FragColor = result;
      }
    `,parameters:[{name:"starDensity",type:"float",value:2,min:.5,max:5,step:.1,description:"Star density"}],description:"Magical starfield particle transition",tags:["particles","stars","magical","space"]},{id:"neural-style",name:"Neural Style",category:"ai-generated",duration:.8,intensity:"strong",viralScore:8.5,previewUrl:"/transitions/previews/neural-style.mp4",glslCode:`
      precision mediump float;
      uniform sampler2D u_texture1;
      uniform sampler2D u_texture2;
      uniform float u_progress;
      uniform float u_styleStrength;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Simulate neural style transfer effect
        vec2 offset = vec2(sin(uv.y * 20.0 + u_progress * 10.0), cos(uv.x * 20.0 + u_progress * 10.0)) * 0.01 * u_styleStrength;
        
        vec4 color1 = texture2D(u_texture1, uv + offset);
        vec4 color2 = texture2D(u_texture2, uv - offset);
        
        // Add artistic distortion
        float distortion = sin(u_progress * 3.14159) * u_styleStrength;
        color1.rgb = mix(color1.rgb, vec3(dot(color1.rgb, vec3(0.299, 0.587, 0.114))), distortion * 0.3);
        
        gl_FragColor = mix(color1, color2, smoothstep(0.2, 0.8, u_progress));
      }
    `,parameters:[{name:"styleStrength",type:"float",value:1,min:.1,max:2,step:.1,description:"Style transfer strength"}],description:"AI-powered neural style transfer transition",tags:["ai","artistic","neural","creative"]}];async function l(e){try{let{searchParams:r}=new URL(e.url),t=r.get("category"),o=r.get("intensity"),i=r.get("search"),s=r.get("sortBy")||"viral",a=parseInt(r.get("limit")||"50"),l=[...u];if(t&&"all"!==t&&(l=l.filter(e=>e.category===t)),o&&"all"!==o&&(l=l.filter(e=>e.intensity===o)),i){let e=i.toLowerCase();l=l.filter(r=>r.name.toLowerCase().includes(e)||r.description.toLowerCase().includes(e)||r.tags.some(r=>r.toLowerCase().includes(e)))}l.sort((e,r)=>{switch(s){case"viral":return r.viralScore-e.viralScore;case"name":return e.name.localeCompare(r.name);case"duration":return e.duration-r.duration;case"category":return e.category.localeCompare(r.category);default:return 0}}),a>0&&(l=l.slice(0,a));let c=u.reduce((e,r)=>(e[r.category]=(e[r.category]||0)+1,e),{});return n.NextResponse.json({success:!0,transitions:l,total:l.length,totalAvailable:u.length,categoryStats:c,filters:{category:t,intensity:o,search:i,sortBy:s,limit:a}})}catch(e){return console.error("Error in GET /api/editor/transitions:",e),n.NextResponse.json({error:"Internal server error"},{status:500})}}async function c(e){try{let{transitionId:r}=await e.json();if(!r)return n.NextResponse.json({error:"Transition ID is required"},{status:400});let t=u.find(e=>e.id===r);if(!t)return n.NextResponse.json({error:"Transition not found"},{status:404});return n.NextResponse.json({success:!0,transition:t})}catch(e){return console.error("Error in POST /api/editor/transitions:",e),n.NextResponse.json({error:"Internal server error"},{status:500})}}let p=new i.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/editor/transitions/route",pathname:"/api/editor/transitions",filename:"route",bundlePath:"app/api/editor/transitions/route"},resolvedPagePath:"C:\\Users\\Administrator\\Elohim\\frontend\\app\\api\\editor\\transitions\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:m,workUnitAsyncStorage:d,serverHooks:v}=p;function g(){return(0,a.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:d})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[4447,580],()=>t(14343));module.exports=o})();