(()=>{var e={};e.id=4742,e.ids=[4742],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},20954:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>x,routeModule:()=>p,serverHooks:()=>d,workAsyncStorage:()=>u,workUnitAsyncStorage:()=>l});var o={};r.r(o),r.d(o,{POST:()=>c});var s=r(96559),n=r(48088),a=r(37719),i=r(32190);async function c(e){try{var t,r,o;let s,n,a,c,p,u;console.log("\uD83D\uDCE4 DocHarvester Export: Starting export...");let{documents:l,format:d}=await e.json();if(!l||0===l.length)return i.NextResponse.json({error:"No documents provided for export"},{status:400});switch(console.log(`📋 Exporting ${l.length} documents in ${d} format`),d){case"json":s=JSON.stringify(l,null,2),n="application/json",a="docharvester_export.json";break;case"markdown":t=l,c=`# DocHarvester Export

Generated: ${new Date().toISOString()}
Total Documents: ${t.length}

`,t.forEach((e,t)=>{c+=`## Document ${t+1}: ${e.title||"Untitled"}

**URL:** ${e.url}
**Status:** ${e.status}
`,"success"===e.status?c+=`**Size:** ${e.size||0} characters

### Content

${e.content||"No content"}

`:c+=`**Error:** ${e.error||"Unknown error"}

`,c+="---\n\n"}),s=c,n="text/markdown",a="docharvester_export.md";break;case"text":r=l,p=`DocHarvester Export
===================

Generated: ${new Date().toISOString()}
Total Documents: ${r.length}

`,r.forEach((e,t)=>{p+=`Document ${t+1}: ${e.title||"Untitled"}
URL: ${e.url}
Status: ${e.status}
`,"success"===e.status?p+=`Size: ${e.size||0} characters

Content:
${e.content||"No content"}

`:p+=`Error: ${e.error||"Unknown error"}

`,p+="----------------------------------------\n\n"}),s=p,n="text/plain",a="docharvester_export.txt";break;case"csv":o=l,u="URL,Title,Status,Size,Error,Content\n",o.forEach(e=>{let t=e=>`"${e.replace(/"/g,'""')}"`;u+=[t(e.url),t(e.title||""),t(e.status),e.size||0,t(e.error||""),t((e.content||"").substring(0,1e3))].join(",")+"\n"}),s=u,n="text/csv",a="docharvester_export.csv";break;case"training":s=l.filter(e=>"success"===e.status&&e.content).map(e=>({text:e.content,metadata:{url:e.url,title:e.title,size:e.size,timestamp:new Date().toISOString()}})).map(e=>JSON.stringify(e)).join("\n"),n="application/jsonl",a="docharvester_export.jsonl";break;default:return i.NextResponse.json({error:`Unsupported export format: ${d}`},{status:400})}return console.log(`✅ Export complete: ${a} (${s.length} characters)`),new i.NextResponse(s,{status:200,headers:{"Content-Type":n,"Content-Disposition":`attachment; filename="${a}"`,"Content-Length":s.length.toString()}})}catch(e){return console.error("❌ Export error:",e),i.NextResponse.json({error:"Export failed",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let p=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/harvest/export/route",pathname:"/api/harvest/export",filename:"route",bundlePath:"app/api/harvest/export/route"},resolvedPagePath:"C:\\Users\\Administrator\\Elohim\\frontend\\app\\api\\harvest\\export\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:u,workUnitAsyncStorage:l,serverHooks:d}=p;function x(){return(0,a.patchFetch)({workAsyncStorage:u,workUnitAsyncStorage:l})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},96487:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[4447,580],()=>r(20954));module.exports=o})();