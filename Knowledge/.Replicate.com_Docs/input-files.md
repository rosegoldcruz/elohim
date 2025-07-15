Some models accept files as input, like images, audio, or video, zip files, PDFs, etc.

There are multiple ways to use files as input when running a model on Replicate. You can provide a file as input using a URL, a local file on your computer, or a base64-encoded object.

[](#option-1-hosted-file)Option 1: Hosted file
----------------------------------------------

Use a URL to provide a hosted file:

JavascriptPythonHTTP

```js
const fileInput = "https://example.com/path/to/your/file";
```

```python
file_input = "https://example.com/path/to/your/file"
```

```bash
file_input="https://example.com/path/to/your/file"
```

This is useful if you already have a file hosted somewhere on the internet.

[](#option-2-local-file)Option 2: Local file
--------------------------------------------

You can provide Replicate with a `Blob`, `File`, or `Buffer` object, and the library will handle the upload for you. This will work for files up to 100MB:

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();

JavascriptPythonHTTP

```js
import { readFile } from "node:fs/promises";
const fileInput = await readFile("./path/to/your/file");
```

```python
file_input = open("./path/to/your/file", "rb")
```

```bash
file_input="./path/to/your/file"
file=$(curl -s -X POST "https://api.replicate.com/v1/files" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "content=@$file_input;type=application/octet-stream;title=$(basename $file_input)")
file_input_url=$(echo "$file" | jq -r '.urls.get')
```

[](#option-3-data-uri)Option 3: Data URI
----------------------------------------

Create a data URI consisting of the base64 encoded data for your file. This is only recommended if the file is less than 1MB:

JavascriptPythonHTTP

```js
import { readFile } from "node:fs/promises";
const data = (await readFile("./path/to/your/file")).toString("base64");
const fileInput = `data:application/octet-stream;base64,${data}`;
```

```python
import base64
with open("./path/to/your/file", "rb") as file:
    data = base64.b64encode(file.read()).decode("utf-8")
    file_input = f"data:application/octet-stream;base64,{data}"
```

```bash
file_input="data:application/octet-stream,$(base64 < ./path/to/your/file)"
```

[](#using-the-file-input)Using the file input
---------------------------------------------

Once you have your file input ready, you can use it in your prediction:

JavascriptPythonHTTP

```js
const input = { file: fileInput };
const output = await replicate.run("your-model-id", { input });
```

```python
import replicate
input = { "file": file_input }
output = replicate.run("your-model-id", input=input)
```

```bash
curl --silent --show-error "https://api.replicate.com/v1/predictions" \
  --request POST \
  --header "Authorization: Bearer $REPLICATE_API_TOKEN" \
  --header "Content-Type: application/json" \
  --data @- <<EOM
{
  "version": "your-model-id",
  "input": { "file": "$file_input_url" }
}
EOM
```