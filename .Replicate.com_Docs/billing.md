[](#lifecycle-of-an-instance)Lifecycle of an instance
-----------------------------------------------------

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();

Offline

Offline

TypeDuration

*   Setup time
    
    0.0s
*   Active time
    
    0.0s
*   Idle time
    
    0.0s

Offline

When a model isn’t under demand, we scale it down to the minimum number of instances set (0 by default - you can customize this for deployments).

Setting up

When requests start to come in for a model, or the request volume is too high for the model's current scale to cope with, we set up an instance (up to a maximum - you can customize this for deployments). This can take a few seconds as we perform setup work like downloading weights.

Active

Once the model instance has finished setting up, it can start processing the queue of requests.

Idle

When there's a gap in requests, the instance will go idle for a few minutes rather than shutting down immediately, so it can stay responsive and avoid needing to set up from scratch every time.

[](#public-models)Public models
-------------------------------

When you use a public model on Replicate, you only pay for the time it’s active processing your requests. Setup and idle time for the model is free.

By default, you share a hardware pool with other customers, meaning your requests enter a shared queue alongside other customer requests. This means you will sometimes encounter [cold boots](https://replicate.com/docs/how-does-replicate-work#cold-boots) or scaling limits depending on how other customers are using the model.

If you would like more control over how the model is run, you can use a [deployment](https://replicate.com/docs/deployments) and have your own instances and request queue.

[](#private-models)Private models
---------------------------------

Unlike public models, most private models (with the exception of [fast booting fine-tunes](#fast-booting-fine-tunes)) run on dedicated hardware and you don’t have to share a queue with anyone else. This means you pay for all the time instances of the model are online: the time they spend setting up; the time they spend idle, waiting for requests; and the time they spend active, processing your requests.

As with public models, if you would like more control over how a private model is run, you can use a [deployment](https://replicate.com/docs/deployments).

Here’s an example using [Meta’s Llama 3.1 405B Instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct):

Tokens

Count

Price

Input

Write a limerick about llamas

8

$0.0000760

Output

There once was a llama named Sue,\\n  
Whose favorite color was blue,\\n  
She lived in the Andes,\\n  
With her friends eating candies\\n  
And together they all played kazoo.

43

$0.0004085

Total

51

$0.0004845

[](#fast-booting-fine-tunes)Fast booting fine-tunes
---------------------------------------------------

Sometimes, we’re able to optimize how a trained model is run so it boots fast. This works by using a common, shared pool of hardware running a base model. In these cases, we only ever charge you for the time the model is active and processing your requests, regardless of whether or not it’s public or private.

Fast booting fine-tunes are labeled as such in the model’s version list. You can also see which versions support the creation of fast booting models when training.

[](#deployments)Deployments
---------------------------

[Deployments](https://replicate.com/docs/deployments) are a feature that allow you to, among other things, control the hardware and scaling parameters of any model. Like with private models, we charge for all the time deployment instances are online: the time they spend setting up; the time they spend idle, waiting for requests; and the time they spend active, processing your requests.

In addition to the benefits of having a stable endpoint and graceful rollouts of versions, you might want to use a deployment if, for example:

*   you want to configure a public model owned by someone else to run on different hardware
*   you have steady use of a model and want to avoid being impacted by other customers using it
*   you know your expected request rate and want to avoid cold boots
*   you have a private model with a consistent, predictable request rate

Note that well-tuned deployments are usually only marginally more expensive than public models, because, despite paying for setup and idle time for deployment instances, when configured correctly, they should only be setting up or idle for a fraction of the time they’re active.

[](#failed-and-canceled-runs)Failed and canceled runs
-----------------------------------------------------

For public models, if a run fails, we don’t charge you for its time. However, if you cancel a run, we charge you for the time it ran up until that point.

For private models and deployments, failed and canceled runs are billed for the time the instances they ran on were active, as normal.

[](#hardware)Hardware
---------------------

Different models run on different hardware. You’ll find the hardware specifications under the “Run time and cost” heading on each model’s page. Check out [stability-ai/sdxl](https://replicate.com/stability-ai/sdxl#performance) for an example.

If a model is one you created on Replicate, you can adjust which hardware to use in the model’s settings. You can also specify hardware for a deployment.

[](#billing)Billing
-------------------

At the beginning of each month, we charge you for your usage from the previous month.

Sometimes, if your usage crosses certain limits for the first time, we’ll charge you early. This helps us catch fraud before it becomes a problem. If that happens, we’ll email you a receipt right away using the email address configured when you set up billing. The amount will show up as a credit on your next invoice.

To view and configure your billing email address, go to the [billing settings](https://replicate.com/account/billing) page and click **Manage billing**.

[You can find your current usage and manage your billing settings on your account page](https://replicate.com/account/billing).

[](#free-limits)Free limits
---------------------------

You can try [featured models](https://replicate.com/explore#featured-models) out on Replicate for free, but after a bit you’ll be asked to set up billing.

Some features are only available to customers with billing set up.