
# FILE: testing-webhook-code.md

When writing the code for your new webhook handler, it’s useful to be able to receive real webhooks in your development environment so you can verify your code is handling them as expected.

[ngrok](https://ngrok.com/) is a free reverse proxy tool that can create a secure tunnel to your local machine so you can receive webhooks. If you have Node.js installed, run ngrok directly from the command line using the `npx` command that’s included with Node.js.

```shell
npx ngrok http 3000
```

The command above will generate output that looks like this:

```plaintext
Session Status                online
Session Expires               1 hour, 59 minutes
Version                       2.3.41
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://3e48-20-171-41-18.ngrok.io -> http://localhost:3000
Forwarding                    https://3e48-20-171-41-18.ngrok.io -> http://localhost:3000
```

The HTTPS URL in the output (`http://3e48-20-171-41-18.ngrok.io` in the example above) is a temporary URL pointing to your local machine. Copy that URL and use it as the base of your webhook URL.

Here’s an example using the [`replicate` JavaScript client](https://github.com/replicate/replicate-javascript):

```js
await replicate.predictions.create({
  version: "d55b9f2d...",
  input: { prompt: "call me later maybe" },
  webhook: "https://3e48-20-171-41-18.ngrok.io/replicate-webhook",
});
```

Your webhook handler should now receive webhooks from Replicate. Once you’ve deployed your app, change the value of the `webhook` URL to your production webhook handler endpoint when creating predictions.

For a real-world example of webhook handling in Next.js, check out [Scribble Diffusion’s codebase](https://github.com/replicate/scribble-diffusion/pull/27/commits/627c872c78aad89cadd02798d37d4696e3278a12).

--- END OF testing-webhook-code.md ---


# FILE: organizations.md

You can use an organization to collaborate with other people on Replicate.

Organizations let you share access to models, API tokens, billing, dashboards, and more. When you run models as the organization, it gets billed to your shared credit card instead of your personal account.

You can also use organizations to create [private models](/docs/topics/models/private-models) that are only visible to people on your team.

To get started, use the account menu to create your organization:

![](https://github.com/replicate/cog/assets/2289/7f2640b7-3add-4705-a053-328760565f99)

--- END OF organizations.md ---


# FILE: billing.md

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

--- END OF billing.md ---


# FILE: subprocessors.md

Name

Description

Location

Attio

User CRM

United States

AWS

Cloud Hosted Infrastructure and Data Hosting

United States

Betterstack

Status page and log aggregator for Postgres

Europe

CloudAMQP

RabbitMQ for web

United States

Cloudflare

Content Delivery service

United States

CoreWeave

Cloud Hosted infrastructure

United States

Crunchy Bridge

Postgres

United States

Fly.io

Public Cloud infrastructure

United States

GCP (Google)

Cloud Hosted Infrastructure

United States

Hightouch

Data collection

United States

Honeycomb

Tracing and telemetry

United States

LaunchDarkly

Feature flag management platform

United States

Loops.so

Marketing emails

United States

Markprompt

AI Support assistants

United States

Metabase

Data analysis

United States

Metronome

Usage and invoicing

United States

Pylon

Customer support platform

United States

Render

Cloud hosting provider

United States

Rudder Labs

Data collection

United States

Stripe

Payment processing

United States

Zendesk

Customer support ticketing system

United States

--- END OF subprocessors.md ---


# FILE: how-does-replicate-work.md

Replicate lets you run machine learning models with a cloud API, without having to understand the intricacies of machine learning or manage your own infrastructure.

You can [run open-source models](https://replicate.com/explore) that other people have published, or bring your own training data to [create fine-tuned models](/docs/get-started/fine-tune-with-flux), or build and [publish custom models](/docs/guides/push-a-model) from scratch.

[](#terminology)Terminology
---------------------------

Let’s start by defining some important terms that you’ll need to know:

### [](#models)Models

In the world of machine learning, the word “model” can mean many different things depending on context. It can be the source code, the trained weights, the architecture, or some combination thereof. At Replicate, when we say “model” we’re generally referring to a trained, packaged, and published software program that accepts inputs and returns outputs.

### [](#versions)Versions

Just like normal software, machine learning models change and improve over time, and those changes are released as new versions. Whenever a model author retrains a model with new data, fixes a bug in the source code, or updates a dependency, those changes can influence the behavior of the model. The changes are published as new versions, so model authors can make improvements without disrupting the experience for people using older versions of the model. Versioning is essential to making machine learning reproducible: it helps guarantee that a model will behave consistently regardless of when or where it’s being run.

### [](#predictions)Predictions

Every time you run a model, you’re creating a prediction. A prediction is an object that represents a single result from running the model, including the inputs that you provided, the outputs that the model returned, as well as [other metadata](https://replicate.com/docs/reference/http#predictions.get) like the model version, the user who created it, the status of the prediction, and timestamps.

[](#running-models-in-the-browser)Running models in the browser
---------------------------------------------------------------

You can run models on Replicate using the [cloud API](https://replicate.com/docs/get-started/python) or the [web](https://replicate.com/explore).

The web interface is a good place to start when trying out a model for the first time. It gives you a visual view of all the inputs to the model, and generates a form for running the model right from your browser:

[![Replicate's browser UI for running models in the browser](https://user-images.githubusercontent.com/2289/184978386-d1d387e3-8173-406f-892a-5a5c4588108c.png)](https://replicate.com/kuprel/min-dalle)

[](#running-models-with-the-api)Running models with the API
-----------------------------------------------------------

The web interface is great for getting acquainted with a model, but when you’re ready to integrate a model into something like a chat bot, website, or mobile app, that’s when the API comes into play.

Our [HTTP API](https://replicate.com/docs/reference/http) can be used with any programming language, but there are also [client libraries](https://replicate.com/docs/reference/client-libraries) for Python, JavaScript, and other languages that make it easier to use the API.

Using the [Python client](https://github.com/replicate/replicate-python), you can create predictions with just a few lines of code:

```py
import replicate
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "an astronaut riding a horse"}
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

The [JavaScript client](https://github.com/replicate/replicate-javascript) works similarly:

```js
import Replicate from "replicate";
const replicate = new Replicate({auth: process.env.REPLICATE_API_TOKEN});
const model = "black-forest-labs/flux-schnell";
const input = {prompt: "a 19th century portrait of a raccoon gentleman wearing a suit"};
const output = await replicate.run(model, { input });
// Save the output image
fs.writeFileSync("output.png", output[0]);
```

[](#how-predictions-work)How predictions work
---------------------------------------------

Whenever you run a model, you’re creating a [prediction](#predictions).

Some models run very quickly and can return a result within a few milliseconds. Other models can take longer to run, especially generative models, like the kind which produce [images from text prompts](https://replicate.com/collections/text-to-image).

For these long-running models, you need to poll the API to check the status of a prediction. Predictions can have any of the following statuses:

*   `starting`: the prediction is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the prediction. Refer to [Cold boots](#cold-boots).
*   `processing`: the `predict()` method of the model is currently running.
*   `succeeded`: the prediction completed successfully.
*   `failed`: the prediction encountered an error during processing.
*   `canceled`: the prediction was canceled by the user.

Predictions timeout after running for 30 minutes. If you require more than 30 minute timeouts for predictions, [contact us](https://replicate.com/support).

When you’re logged in, you can view a list of your predictions on the [dashboard](https://replicate.com/), with summaries of status, run time, etc:

[![](https://user-images.githubusercontent.com/2289/185239725-18baa5fb-b7bb-4882-9471-3879dde4037a.png)](/)

[](#share-predictions)Share predictions
---------------------------------------

Every prediction that you create is associated with your user account, and only you can see the predictions that you create. If you’re using the web interface, then you can click the “Share” button to make the prediction public, so that others can view it.

[](#delete-predictions)Delete predictions
-----------------------------------------

Input and output (including any files) are automatically deleted after an hour for any predictions created through the API, so you must save a copy of any files in the output if you’d like to continue using them. For more details on how to store prediction data, see the [guide to webhooks](https://replicate.com/docs/topics/webhooks).

Predictions created through the web interface are kept indefinitely, unless you delete them manually.

To manually delete a prediction on the website, go to your dashboard, find the prediction, and look for a “Delete” button on the prediction page. Clicking this button completely removes the prediction from the site, including any output data and output files associated with it.

[](#prediction-output-files)Prediction output files
---------------------------------------------------

When models generate files (like images, audio, or video), they return `FileOutput` objects that provide direct access to the file data. This makes it easy to save or process the files in your code.

The `FileOutput` interface differs slightly between Python and JavaScript. Let’s look at each:

### [](#python)Python

In Python, the `FileOutput` is based on `httpx.Response` and provides:

*   Direct access to the file data through `read()` or async `aread()`
*   A `url` attribute that points to where the file is hosted (see [Working with URLs](/docs/topics/predictions/output-files#working-with-urls))
*   Streaming capabilities as the `FileOutput` is both an Iterator and AsyncIterator

Here’s how to work with output files in Python:

```python
import replicate
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "an astronaut riding a horse"}
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

### [](#javascript)JavaScript

In JavaScript, the `FileOutput` is based on the `Response` object and provides:

*   Direct access to the file data via `.blob()`
*   A `url()` method that returns a URL to the file (see [Working with URLs](/docs/topics/predictions/output-files#working-with-urls))
*   Streaming capabilities as the `FileOutput` is a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams).

Here’s how to work with output files in JavaScript:

```javascript
import Replicate from "replicate";
const replicate = new Replicate();
const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    { input: { prompt: "an astronaut riding a horse" }}
);
// Save the output image
await fs.writeFile("output.png", output[0]);
```

For both Python and JavaScript, the `url` property (or `url()` method in JavaScript) will return the URL pointing to the underlying data source.

Output files are served via `replicate.delivery` and its subdomains. If you use an allow list of external domains for your assets, add `replicate.delivery` and `*.replicate.delivery` to it.

For example, if you’re building a [Next.js app that displays output files from Replicate](/docs/get-started/nextjs), update your Next.js config as follows:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.replicate.delivery",
      }
    ]
  }
}
```

To stream file data back from a Next.js handler, you can do this:

```javascript
export async function GET(request: Request) {
  const output = await replicate.run(...);
  return new Response(output);
}
```

For more details about working with output files, see the [Output files documentation](/docs/topics/predictions/output-files).

[](#which-models-can-you-run)Which models can you run?
------------------------------------------------------

You can use the API or the web interface to run any public model on Replicate from your own code. It can be an open-source model created by someone else, like [meta/meta-llama-3-70b-instruct](https://replicate.com/meta/meta-llama-3-70b-instruct) or [stability-ai/sdxl](https://replicate.com/stability-ai/sdxl), or you can publish and run your own models.

You can also push your own model to Replicate. Refer to [Pushing your own models](#pushing-your-own-models).

[](#finding-models)Finding models
---------------------------------

You can find models to run by [exploring popular and featured models](https://replicate.com/explore) or [searching for something specific](https://replicate.com/explore?query=sdxl).

The search returns models that meet the following criteria:

*   The model is public.
*   The model has at least one published version.
*   The model has at least one example prediction. To add an example, create a prediction using the web interface then click the “Add to examples” button below the prediction output.

If you’re pushing your own models and want others to be able to discover them, make sure they meet the above criteria.

[](#pricing)Pricing
-------------------

Take a look at the page on [how billing works](https://replicate.com/docs/billing).

[](#commercial-use)Commercial use
---------------------------------

The models on Replicate have been built and contributed by different people and organizations, and the licenses vary for each model. Here are a few examples:

For [Stable Diffusion](https://replicate.com/stability-ai/stable-diffusion), neither Replicate nor the authors of the model claim any ownership over the output. For details, see the [Stable Diffusion license](https://huggingface.co/spaces/CompVis/stable-diffusion-license), and [Replicate’s terms of service](https://replicate.com/terms).

Other models like [Pixray](https://github.com/pixray/pixray/blob/master/LICENSE) have some restrictions on commercial use.

You can view the license for a model by clicking the button at the top right of the model page:

[![](https://user-images.githubusercontent.com/2289/207943447-a0985df2-009f-4fa5-932b-70c7ff97696e.png)](https://replicate.com/stability-ai/stable-diffusion)

[](#safety)Safety
-----------------

Image generation models like [Stability AI’s SDXL](https://replicate.com/stability-ai/sdxl) include a safety checker to prevent the model from generating images that portray nudity, violence, and other unsafe content.

To protect users from generating unsafe content, we enable the safety checker for web predictions on the [SDXL base model](https://replicate.com/stability-ai/sdxl) and all [derivative fine-tunes of SDXL](https://replicate.com/stability-ai/sdxl/train).

The safety checker is intended to protect users, but it can sometimes be too restrictive or generate false positives, incorrectly flagging safe content as unsafe. For those cases, you can disable the safety checker when running the model with the API. This gives you the flexibility to use a [custom safety-checking model](https://replicate.com/zsxkib/stable-diffusion-safety-checker) or a third-party service as part of your workflow.

For more details on allowed use, see the [terms of service](https://replicate.com/terms).

[](#cold-boots)Cold boots
-------------------------

We have a huge catalogue of models. To make good use of resources, we only run the models that are actually being used. When a model hasn’t been used for a little while, we turn it off.

When you make a request to run a prediction on a model, you’ll get a fast response if the model is “warm” (already running), and a slower response if the model is “cold” (starting up). Machine learning models are often very large and resource intensive, and we have to fetch and load several gigabytes of code for some models. In some cases this process can take several minutes.

Cold boots can also happen when there’s a big spike in demand. We autoscale by running multiple copies of a model on different machines, but the model can take a while to become ready.

For popular public models, cold boots are uncommon because the model is kept “warm” from all the activity. For less-frequently used models, cold boots are more frequent.

If you’re using the API to create predictions in the background, then cold boots probably aren’t a big deal: we only charge for the time that your prediction is actually running, so it doesn’t affect your costs.

If you are running a model that you need to keep warm, you can [create a deployment](/docs/topics/deployments) for it. Deployments allow you to customize the hardware and scaling configuration of a model. You can create a deployment with minimum instances set to 1 or more to ensure that it is always running and ready to respond to requests.

[](#rate-limits)Rate limits
---------------------------

We limit the number of API requests that can be made to Replicate.

See the [HTTP API reference docs](https://replicate.com/docs/reference/http#rate-limits) for more details.

[](#organizations)Organizations
-------------------------------

You can use an organization to collaborate with other people on Replicate.

Organizations let you share access to models, API tokens, billing, dashboards, and more. When you run models as the organization, it gets billed to your shared credit card instead of your personal account.

You can also use organizations to create private models that are only visible to people on your team.

To get started, use the account menu to create your organization:

![](https://github.com/replicate/cog/assets/2289/7f2640b7-3add-4705-a053-328760565f99)

[](#push-your-own-models)Push your own models
---------------------------------------------

In addition to running other people’s models, you can push your own models to Replicate. You can make your model public so that other people can run it, or you can make it private so that only you can run it.

To learn more, check out [Push a model to Replicate](https://replicate.com/docs/guides/push-a-model).

[](#private-models)Private models
---------------------------------

When creating a model on Replicate, you can choose whether to make it public or private.

You can create a private model on your personal account, and it will only be visible to you.

You can also create a private model in an [organization](#organizations) to share it with members of your team.

To create a private model, go to [replicate.com/create](https://replicate.com/create) and select the “Private” option:

![](https://github.com/replicate/cog/assets/2289/e433e837-8538-4894-84cd-15f8ce99643b)

To learn more, check out the [guide to deploying a custom model](https://replicate.com/docs/guides/deploy-a-custom-model).

[](#get-support)Get support
---------------------------

Stuck on something? Our community’s here to help. [Find us in Discord](https://discord.gg/replicate).

--- END OF how-does-replicate-work.md ---


# FILE: client-libraries.md

Client libraries make it easier to call the HTTP API from various languages.

[](#official-client-libraries)Official client libraries
-------------------------------------------------------

*   [github.com/replicate/replicate-javascript](https://github.com/replicate/replicate-javascript) – Node.js client
*   [github.com/replicate/replicate-python](https://github.com/replicate/replicate-python) – Python client
*   [github.com/replicate/replicate-swift](https://github.com/replicate/replicate-swift) – Swift client
*   [github.com/replicate/replicate-go](https://github.com/replicate/replicate-go) – Go client
*   [github.com/replicate/cli](https://github.com/replicate/cli) – Command-line interface for Replicate

[](#community-maintained-client-libraries)Community-maintained client libraries
-------------------------------------------------------------------------------

*   [github.com/cbh123/replicate-elixir](https://github.com/cbh123/replicate-elixir) – Elixir client
*   [github.com/dreamingtulpa/replicate-ruby](https://github.com/dreamingtulpa/replicate-ruby) – Ruby client
*   [github.com/dreamingtulpa/replicate-rails](https://github.com/dreamingtulpa/replicate-rails) – Rails integration
*   [github.com/fofr/replicate-predict](https://github.com/fofr/replicate-predict) - JavaScript wrapper to run and save batches of API calls on Replicate
*   [github.com/halilcosdu/laravel-replicate](https://github.com/halilcosdu/laravel-replicate) - Laravel client

Got one you’d like to add? [Contact us](https://replicate.com/support).

--- END OF client-libraries.md ---


# FILE: http.md

[Authentication](#authentication)

[`predictions.create` - Create a prediction](#predictions.create)

[`predictions.get` - Get a prediction](#predictions.get)

[`predictions.list` - List predictions](#predictions.list)

[`predictions.cancel` - Cancel a prediction](#predictions.cancel)

[`models.create` - Create a model](#models.create)

[`models.get` - Get a model](#models.get)

[`models.list` - List public models](#models.list)

[`models.search` - Search public models](#models.search)

[`models.delete` - Delete a model](#models.delete)

[`models.examples.list` - List examples for a model](#models.examples.list)

[`models.predictions.create` - Create a prediction using an official model](#models.predictions.create)

[`models.readme.get` - Get a model's README](#models.readme.get)

[`models.versions.get` - Get a model version](#models.versions.get)

[`models.versions.list` - List model versions](#models.versions.list)

[`models.versions.delete` - Delete a model version](#models.versions.delete)

[`collections.get` - Get a collection of models](#collections.get)

[`collections.list` - List collections of models](#collections.list)

[`deployments.create` - Create a deployment](#deployments.create)

[`deployments.get` - Get a deployment](#deployments.get)

[`deployments.list` - List deployments](#deployments.list)

[`deployments.update` - Update a deployment](#deployments.update)

[`deployments.delete` - Delete a deployment](#deployments.delete)

[`deployments.predictions.create` - Create a prediction using a deployment](#deployments.predictions.create)

[`files.list` - List files](#files.list)

[`files.create` - Create a file](#files.create)

[`files.delete` - Delete a file](#files.delete)

[`files.get` - Get a file](#files.get)

[`files.download` - Download a file](#files.download)

[`trainings.create` - Create a training](#trainings.create)

[`trainings.get` - Get a training](#trainings.get)

[`trainings.list` - List trainings](#trainings.list)

[`trainings.cancel` - Cancel a training](#trainings.cancel)

[`hardware.list` - List available hardware for models](#hardware.list)

[`account.get` - Get the authenticated account](#account.get)

[`webhooks.default.secret.get` - Get the signing secret for the default webhook](#webhooks.default.secret.get)

[](#authentication)Authentication
---------------------------------

All API requests must include a valid API token in the `Authorization` request header. The token must be prefixed by “Bearer”, followed by a space and the token value. Example: `Authorization: Bearer r8_Hw***********************************` Find your tokens at [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

[](#predictions.create)Create a prediction
------------------------------------------

### [](#predictions.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/predictions
```

### [](#predictions.create-description)Description

Create a prediction for the model version and inputs you provide.

If you’re running an [official model](https://replicate.com/collections/official), use the [`models.predictions.create`](#models.predictions.create) operation instead.

Example cURL request:

Copy

```shell
curl -s -X POST -H 'Prefer: wait' \
  -d '{"version": "replicate/hello-world:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa", "input": {"text": "Alice"}}' \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  https://api.replicate.com/v1/predictions
```

The request will wait up to 60 seconds for the model to run. If this time is exceeded the prediction will be returned in a `"starting"` state and need to be retrieved using the `predictions.get` endpiont.

For a complete overview of the `predictions.create` API check out our documentation on [creating a prediction](https://replicate.com/docs/topics/predictions/create-a-prediction) which covers a variety of use cases.

### [](#predictions.create-headers)Headers

*   [Prefer](#predictions.create-headers-prefer)string
    
    Leave the request open and wait for the model to finish generating output. Set to `wait=n` where n is a number of seconds between 1 and 60.
    
    See https://replicate.com/docs/topics/predictions/create-a-prediction#sync-mode for more information.
    

### [](#predictions.create-request-body)Request Body

*   [input](#predictions.create-request-body-input)objectRequired
    
    The model's input as a JSON object. The input schema depends on what model you are running. To see the available inputs, click the "API" tab on the model you are running or [get the model version](#models.versions.get) and look at its `openapi_schema` property. For example, [stability-ai/sdxl](https://replicate.com/stability-ai/sdxl) takes `prompt` as an input.
    
    Files should be passed as HTTP URLs or data URLs.
    
    Use an HTTP URL when:
    
    *   you have a large file > 256kb
    *   you want to be able to use the file multiple times
    *   you want your prediction metadata to be associable with your input files
    
    Use a data URL when:
    
    *   you have a small file <= 256kb
    *   you don't want to upload and host the file somewhere
    *   you don't need to use the file again (Replicate will not store it)
    
*   [version](#predictions.create-request-body-version)stringRequired
    
    The ID of the model version that you want to run. This can be specified in two formats:
    
    1.  Just the 64-character version ID: `9dcd6d78e7c6560c340d916fe32e9f24aabfa331e5cce95fe31f77fb03121426`
    2.  Full model identifier with version ID in the format `{owner}/{model}:{id}`. For example, `replicate/hello-world:9dcd6d78e7c6560c340d916fe32e9f24aabfa331e5cce95fe31f77fb03121426`
    
*   [stream](#predictions.create-request-body-stream)boolean
    
    **This field is deprecated.**
    
    Request a URL to receive streaming output using [server-sent events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).
    
    This field is no longer needed as the returned prediction will always have a `stream` entry in its `url` property if the model supports streaming.
    
*   [webhook](#predictions.create-request-body-webhook)string
    
    An HTTPS URL for receiving a webhook when the prediction has new output. The webhook will be a POST request where the request body is the same as the response body of the [get prediction](#predictions.get) operation. If there are network problems, we will retry the webhook a few times, so make sure it can be safely called more than once. Replicate will not follow redirects when sending webhook requests to your service, so be sure to specify a URL that will resolve without redirecting.
    
*   [webhook\_events\_filter](#predictions.create-request-body-webhookeventsfilter)array
    
    By default, we will send requests to your webhook URL whenever there are new outputs or the prediction has finished. You can change which events trigger webhook requests by specifying `webhook_events_filter` in the prediction request:
    
    *   `start`: immediately on prediction start
    *   `output`: each time a prediction generates an output (note that predictions can generate multiple outputs)
    *   `logs`: each time log output is generated by a prediction
    *   `completed`: when the prediction reaches a terminal state (succeeded/canceled/failed)
    
    For example, if you only wanted requests to be sent at the start and end of the prediction, you would provide:
    
    {
      "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
      "input": {
        "text": "Alice"
      },
      "webhook": "https://example.com/my-webhook",
      "webhook_events_filter": ["start", "completed"]
    }
    
    Requests for event types `output` and `logs` will be sent at most once every 500ms. If you request `start` and `completed` webhooks, then they'll always be sent regardless of throttling.
    

[](#predictions.get)Get a prediction
------------------------------------

### [](#predictions.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/predictions/{prediction_id}
```

### [](#predictions.get-description)Description

Get the current state of a prediction.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu
```

The response will be the prediction object:

Copy

```json
{
  "id": "gm3qorzdhgbfurvjtvhg6dckhu",
  "model": "replicate/hello-world",
  "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "input": {
    "text": "Alice"
  },
  "logs": "",
  "output": "hello Alice",
  "error": null,
  "status": "succeeded",
  "created_at": "2023-09-08T16:19:34.765994Z",
  "data_removed": false,
  "started_at": "2023-09-08T16:19:34.779176Z",
  "completed_at": "2023-09-08T16:19:34.791859Z",
  "metrics": {
    "predict_time": 0.012683
  },
  "urls": {
    "web": "https://replicate.com/p/gm3qorzdhgbfurvjtvhg6dckhu",
    "get": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu",
    "cancel": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu/cancel"
  }
}
```

`status` will be one of:

*   `starting`: the prediction is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the prediction.
*   `processing`: the `predict()` method of the model is currently running.
*   `succeeded`: the prediction completed successfully.
*   `failed`: the prediction encountered an error during processing.
*   `canceled`: the prediction was canceled by its creator.

In the case of success, `output` will be an object containing the output of the model. Any files will be represented as HTTPS URLs. You’ll need to pass the `Authorization` header to request them.

In the case of failure, `error` will contain the error encountered during the prediction.

Terminated predictions (with a status of `succeeded`, `failed`, or `canceled`) will include a `metrics` object with a `predict_time` property showing the amount of CPU or GPU time, in seconds, that the prediction used while running. It won’t include time waiting for the prediction to start.

All input parameters, output values, and logs are automatically removed after an hour, by default, for predictions created through the API.

You must save a copy of any data or files in the output if you’d like to continue using them. The `output` key will still be present, but it’s value will be `null` after the output has been removed.

Output files are served by `replicate.delivery` and its subdomains. If you use an allow list of external domains for your assets, add `replicate.delivery` and `*.replicate.delivery` to it.

### [](#predictions.get-parameters)URL Parameters

*   [prediction\_id](#predictions.get-parameters-predictionid)stringRequired
    
    The ID of the prediction to get.
    

[](#predictions.list)List predictions
-------------------------------------

### [](#predictions.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/predictions
```

### [](#predictions.list-description)Description

Get a paginated list of all predictions created by the user or organization associated with the provided API token.

This will include predictions created from the API and the website. It will return 100 records per page.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/predictions
```

The response will be a paginated JSON array of prediction objects, sorted with the most recent prediction first:

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();Copy

```json
{
  "next": null,
  "previous": null,
  "results": [
    {
      "completed_at": "2023-09-08T16:19:34.791859Z",
      "created_at": "2023-09-08T16:19:34.907244Z",
      "data_removed": false,
      "error": null,
      "id": "gm3qorzdhgbfurvjtvhg6dckhu",
      "input": {
        "text": "Alice"
      },
      "metrics": {
        "predict_time": 0.012683
      },
      "output": "hello Alice",
      "started_at": "2023-09-08T16:19:34.779176Z",
      "source": "api",
      "status": "succeeded",
      "urls": {
        "web": "https://replicate.com/p/gm3qorzdhgbfurvjtvhg6dckhu",
        "get": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu",
        "cancel": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu/cancel"
      },
      "model": "replicate/hello-world",
      "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
    }
  ]
}
```

`id` will be the unique ID of the prediction.

`source` will indicate how the prediction was created. Possible values are `web` or `api`.

`status` will be the status of the prediction. Refer to [get a single prediction](#predictions.get) for possible values.

`urls` will be a convenience object that can be used to construct new API requests for the given prediction. If the requested model version supports streaming, this will have a `stream` entry with an HTTPS URL that you can use to construct an [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).

`model` will be the model identifier string in the format of `{model_owner}/{model_name}`.

`version` will be the unique ID of model version used to create the prediction.

`data_removed` will be `true` if the input and output data has been deleted.

### [](#predictions.list-query-parameters)Query Parameters

*   [created\_after](#predictions.list-query-parameters-createdafter)string
    
    Include only predictions created at or after this date-time, in ISO 8601 format.
    
*   [created\_before](#predictions.list-query-parameters-createdbefore)string
    
    Include only predictions created before this date-time, in ISO 8601 format.
    

[](#predictions.cancel)Cancel a prediction
------------------------------------------

### [](#predictions.cancel-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/predictions/{prediction_id}/cancel
```

### [](#predictions.cancel-description)Description

Cancel a prediction that is currently running.

Example cURL request that creates a prediction and then cancels it:

Copy

```shell
# First, create a prediction
PREDICTION_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "a video that may take a while to generate"
    }
  }' \
  https://api.replicate.com/v1/models/minimax/video-01/predictions | jq -r '.id')
# Echo the prediction ID
echo "Created prediction with ID: $PREDICTION_ID"
# Cancel the prediction
curl -s -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/predictions/$PREDICTION_ID/cancel
```

### [](#predictions.cancel-parameters)URL Parameters

*   [prediction\_id](#predictions.cancel-parameters-predictionid)stringRequired
    
    The ID of the prediction to cancel.
    

[](#models.create)Create a model
--------------------------------

### [](#models.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/models
```

### [](#models.create-description)Description

Create a model.

Example cURL request:

Copy

```shell
curl -s -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"owner": "alice", "name": "hot-dog-detector", "description": "Detect hot dogs in images", "visibility": "public", "hardware": "cpu"}' \
  https://api.replicate.com/v1/models
```

The response will be a model object in the following format:

Copy

```json
{
  "url": "https://replicate.com/alice/hot-dog-detector",
  "owner": "alice",
  "name": "hot-dog-detector",
  "description": "Detect hot dogs in images",
  "visibility": "public",
  "github_url": null,
  "paper_url": null,
  "license_url": null,
  "run_count": 0,
  "cover_image_url": null,
  "default_example": null,
  "latest_version": null,
}
```

Note that there is a limit of 1,000 models per account. For most purposes, we recommend using a single model and pushing new [versions](https://replicate.com/docs/how-does-replicate-work#versions) of the model as you make changes to it.

### [](#models.create-request-body)Request Body

*   [hardware](#models.create-request-body-hardware)stringRequired
    
    The SKU for the hardware used to run the model. Possible values can be retrieved from the `hardware.list` endpoint.
    
*   [name](#models.create-request-body-name)stringRequired
    
    The name of the model. This must be unique among all models owned by the user or organization.
    
*   [owner](#models.create-request-body-owner)stringRequired
    
    The name of the user or organization that will own the model. This must be the same as the user or organization that is making the API request. In other words, the API token used in the request must belong to this user or organization.
    
*   [visibility](#models.create-request-body-visibility)stringRequired
    
    Whether the model should be public or private. A public model can be viewed and run by anyone, whereas a private model can be viewed and run only by the user or organization members that own the model.
    
*   [cover\_image\_url](#models.create-request-body-coverimageurl)string
    
    A URL for the model's cover image. This should be an image file.
    
*   [description](#models.create-request-body-description)string
    
    A description of the model.
    
*   [github\_url](#models.create-request-body-githuburl)string
    
    A URL for the model's source code on GitHub.
    
*   [license\_url](#models.create-request-body-licenseurl)string
    
    A URL for the model's license.
    
*   [paper\_url](#models.create-request-body-paperurl)string
    
    A URL for the model's paper.
    

[](#models.get)Get a model
--------------------------

### [](#models.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/models/{model_owner}/{model_name}
```

### [](#models.get-description)Description

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world
```

The response will be a model object in the following format:

Copy

```json
{
  "url": "https://replicate.com/replicate/hello-world",
  "owner": "replicate",
  "name": "hello-world",
  "description": "A tiny model that says hello",
  "visibility": "public",
  "github_url": "https://github.com/replicate/cog-examples",
  "paper_url": null,
  "license_url": null,
  "run_count": 5681081,
  "cover_image_url": "...",
  "default_example": {...},
  "latest_version": {...},
}
```

The model object includes the [input and output schema](https://replicate.com/docs/reference/openapi#model-schemas) for the latest version of the model.

Here’s an example showing how to fetch the model with cURL and display its input schema with [jq](https://stedolan.github.io/jq/):

Copy

```shell
curl -s \
    -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
    https://api.replicate.com/v1/models/replicate/hello-world \
    | jq ".latest_version.openapi_schema.components.schemas.Input"
```

This will return the following JSON object:

Copy

```json
{
  "type": "object",
  "title": "Input",
  "required": [
    "text"
  ],
  "properties": {
    "text": {
      "type": "string",
      "title": "Text",
      "x-order": 0,
      "description": "Text to prefix with 'hello '"
    }
  }
}
```

The `cover_image_url` string is an HTTPS URL for an image file. This can be:

*   An image uploaded by the model author.
*   The output file of the example prediction, if the model author has not set a cover image.
*   The input file of the example prediction, if the model author has not set a cover image and the example prediction has no output file.
*   A generic fallback image.

The `default_example` object is a [prediction](#predictions.get) created with this model.

The `latest_version` object is the model’s most recently pushed [version](#models.versions.get).

### [](#models.get-parameters)URL Parameters

*   [model\_owner](#models.get-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.get-parameters-modelname)stringRequired
    
    The name of the model.
    

[](#models.list)List public models
----------------------------------

### [](#models.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/models
```

### [](#models.list-description)Description

Get a paginated list of public models.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models
```

The response will be a pagination object containing a list of model objects.

See the [`models.get`](#models.get) docs for more details about the model object.

[](#models.search)Search public models
--------------------------------------

### [](#models.search-endpoint)Endpoint

Copy

```plaintext
QUERY https://api.replicate.com/v1/models
```

### [](#models.search-description)Description

Get a list of public models matching a search query.

Example cURL request:

Copy

```shell
curl -s -X QUERY \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: text/plain" \
  -d "hello" \
  https://api.replicate.com/v1/models
```

The response will be a paginated JSON object containing an array of model objects.

See the [`models.get`](#models.get) docs for more details about the model object.

[](#models.delete)Delete a model
--------------------------------

### [](#models.delete-endpoint)Endpoint

Copy

```plaintext
DELETE https://api.replicate.com/v1/models/{model_owner}/{model_name}
```

### [](#models.delete-description)Description

Delete a model

Model deletion has some restrictions:

*   You can only delete models you own.
*   You can only delete private models.
*   You can only delete models that have no versions associated with them. Currently you’ll need to [delete the model’s versions](#models.versions.delete) before you can delete the model itself.

Example cURL request:

Copy

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world
```

The response will be an empty 204, indicating the model has been deleted.

### [](#models.delete-parameters)URL Parameters

*   [model\_owner](#models.delete-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.delete-parameters-modelname)stringRequired
    
    The name of the model.
    

[](#models.examples.list)List examples for a model
--------------------------------------------------

### [](#models.examples.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/models/{model_owner}/{model_name}/examples
```

### [](#models.examples.list-description)Description

List [example predictions](https://replicate.com/docs/topics/models/publish-a-model#what-are-examples) made using the model. These are predictions that were saved by the model author as illustrative examples of the model’s capabilities.

If you want all the examples for a model, use this operation.

If you just want the model’s default example, you can use the [`models.get`](#models.get) operation instead, which includes a `default_example` object.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/examples
```

The response will be a pagination object containing a list of example predictions:

Copy

```json
{
  "next": "https://api.replicate.com/v1/models/replicate/hello-world/examples?cursor=...",
  "previous": "https://api.replicate.com/v1/models/replicate/hello-world/examples?cursor=...",
  "results": [...]
}
```

Each item in the `results` list is a [prediction object](#predictions.get).

### [](#models.examples.list-parameters)URL Parameters

*   [model\_owner](#models.examples.list-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.examples.list-parameters-modelname)stringRequired
    
    The name of the model.
    

[](#models.predictions.create)Create a prediction using an official model
-------------------------------------------------------------------------

### [](#models.predictions.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/models/{model_owner}/{model_name}/predictions
```

### [](#models.predictions.create-description)Description

Create a prediction using an [official model](https://replicate.com/changelog/2025-01-29-official-models).

If you’re _not_ running an official model, use the [`predictions.create`](#predictions.create) operation instead.

Example cURL request:

Copy

```shell
curl -s -X POST -H 'Prefer: wait' \
  -d '{"input": {"prompt": "Write a short poem about the weather."}}' \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions
```

The request will wait up to 60 seconds for the model to run. If this time is exceeded the prediction will be returned in a `"starting"` state and need to be retrieved using the `predictions.get` endpiont.

For a complete overview of the `deployments.predictions.create` API check out our documentation on [creating a prediction](https://replicate.com/docs/topics/predictions/create-a-prediction) which covers a variety of use cases.

### [](#models.predictions.create-parameters)URL Parameters

*   [model\_owner](#models.predictions.create-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.predictions.create-parameters-modelname)stringRequired
    
    The name of the model.
    

### [](#models.predictions.create-headers)Headers

*   [Prefer](#models.predictions.create-headers-prefer)string
    
    Leave the request open and wait for the model to finish generating output. Set to `wait=n` where n is a number of seconds between 1 and 60.
    
    See https://replicate.com/docs/topics/predictions/create-a-prediction#sync-mode for more information.
    

### [](#models.predictions.create-request-body)Request Body

*   [input](#models.predictions.create-request-body-input)objectRequired
    
    The model's input as a JSON object. The input schema depends on what model you are running. To see the available inputs, click the "API" tab on the model you are running or [get the model version](#models.versions.get) and look at its `openapi_schema` property. For example, [stability-ai/sdxl](https://replicate.com/stability-ai/sdxl) takes `prompt` as an input.
    
    Files should be passed as HTTP URLs or data URLs.
    
    Use an HTTP URL when:
    
    *   you have a large file > 256kb
    *   you want to be able to use the file multiple times
    *   you want your prediction metadata to be associable with your input files
    
    Use a data URL when:
    
    *   you have a small file <= 256kb
    *   you don't want to upload and host the file somewhere
    *   you don't need to use the file again (Replicate will not store it)
    
*   [stream](#models.predictions.create-request-body-stream)boolean
    
    **This field is deprecated.**
    
    Request a URL to receive streaming output using [server-sent events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).
    
    This field is no longer needed as the returned prediction will always have a `stream` entry in its `url` property if the model supports streaming.
    
*   [webhook](#models.predictions.create-request-body-webhook)string
    
    An HTTPS URL for receiving a webhook when the prediction has new output. The webhook will be a POST request where the request body is the same as the response body of the [get prediction](#predictions.get) operation. If there are network problems, we will retry the webhook a few times, so make sure it can be safely called more than once. Replicate will not follow redirects when sending webhook requests to your service, so be sure to specify a URL that will resolve without redirecting.
    
*   [webhook\_events\_filter](#models.predictions.create-request-body-webhookeventsfilter)array
    
    By default, we will send requests to your webhook URL whenever there are new outputs or the prediction has finished. You can change which events trigger webhook requests by specifying `webhook_events_filter` in the prediction request:
    
    *   `start`: immediately on prediction start
    *   `output`: each time a prediction generates an output (note that predictions can generate multiple outputs)
    *   `logs`: each time log output is generated by a prediction
    *   `completed`: when the prediction reaches a terminal state (succeeded/canceled/failed)
    
    For example, if you only wanted requests to be sent at the start and end of the prediction, you would provide:
    
    {
      "input": {
        "text": "Alice"
      },
      "webhook": "https://example.com/my-webhook",
      "webhook_events_filter": ["start", "completed"]
    }
    
    Requests for event types `output` and `logs` will be sent at most once every 500ms. If you request `start` and `completed` webhooks, then they'll always be sent regardless of throttling.
    

[](#models.readme.get)Get a model’s README
------------------------------------------

### [](#models.readme.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/models/{model_owner}/{model_name}/readme
```

### [](#models.readme.get-description)Description

Get the README content for a model.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/readme
```

The response will be the README content as plain text in Markdown format:

Copy

```plaintext
# Hello World Model
This is an example model that...
```

### [](#models.readme.get-parameters)URL Parameters

*   [model\_owner](#models.readme.get-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.readme.get-parameters-modelname)stringRequired
    
    The name of the model.
    

[](#models.versions.get)Get a model version
-------------------------------------------

### [](#models.versions.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/models/{model_owner}/{model_name}/versions/{version_id}
```

### [](#models.versions.get-description)Description

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/versions/5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa
```

The response will be the version object:

Copy

```json
{
  "id": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "created_at": "2022-04-26T19:29:04.418669Z",
  "cog_version": "0.3.0",
  "openapi_schema": {...}
}
```

Every model describes its inputs and outputs with [OpenAPI Schema Objects](https://spec.openapis.org/oas/latest.html#schemaObject) in the `openapi_schema` property.

The `openapi_schema.components.schemas.Input` property for the [replicate/hello-world](https://replicate.com/replicate/hello-world) model looks like this:

Copy

```json
{
  "type": "object",
  "title": "Input",
  "required": [
    "text"
  ],
  "properties": {
    "text": {
      "x-order": 0,
      "type": "string",
      "title": "Text",
      "description": "Text to prefix with 'hello '"
    }
  }
}
```

The `openapi_schema.components.schemas.Output` property for the [replicate/hello-world](https://replicate.com/replicate/hello-world) model looks like this:

Copy

```json
{
  "type": "string",
  "title": "Output"
}
```

For more details, see the docs on [Cog’s supported input and output types](https://github.com/replicate/cog/blob/75b7802219e7cd4cee845e34c4c22139558615d4/docs/python.md#input-and-output-types)

### [](#models.versions.get-parameters)URL Parameters

*   [model\_owner](#models.versions.get-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.versions.get-parameters-modelname)stringRequired
    
    The name of the model.
    
*   [version\_id](#models.versions.get-parameters-versionid)stringRequired
    
    The ID of the version.
    

[](#models.versions.list)List model versions
--------------------------------------------

### [](#models.versions.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/models/{model_owner}/{model_name}/versions
```

### [](#models.versions.list-description)Description

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/versions
```

The response will be a JSON array of model version objects, sorted with the most recent version first:

Copy

```json
{
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
      "created_at": "2022-04-26T19:29:04.418669Z",
      "cog_version": "0.3.0",
      "openapi_schema": {...}
    }
  ]
}
```

### [](#models.versions.list-parameters)URL Parameters

*   [model\_owner](#models.versions.list-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.versions.list-parameters-modelname)stringRequired
    
    The name of the model.
    

[](#models.versions.delete)Delete a model version
-------------------------------------------------

### [](#models.versions.delete-endpoint)Endpoint

Copy

```plaintext
DELETE https://api.replicate.com/v1/models/{model_owner}/{model_name}/versions/{version_id}
```

### [](#models.versions.delete-description)Description

Delete a model version and all associated predictions, including all output files.

Model version deletion has some restrictions:

*   You can only delete versions from models you own.
*   You can only delete versions from private models.
*   You cannot delete a version if someone other than you has run predictions with it.
*   You cannot delete a version if it is being used as the base model for a fine tune/training.
*   You cannot delete a version if it has an associated deployment.
*   You cannot delete a version if another model version is overridden to use it.

Example cURL request:

Copy

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/versions/5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa
```

The response will be an empty 202, indicating the deletion request has been accepted. It might take a few minutes to be processed.

### [](#models.versions.delete-parameters)URL Parameters

*   [model\_owner](#models.versions.delete-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#models.versions.delete-parameters-modelname)stringRequired
    
    The name of the model.
    
*   [version\_id](#models.versions.delete-parameters-versionid)stringRequired
    
    The ID of the version.
    

[](#collections.get)Get a collection of models
----------------------------------------------

### [](#collections.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/collections/{collection_slug}
```

### [](#collections.get-description)Description

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/collections/super-resolution
```

The response will be a collection object with a nested list of the models in that collection:

Copy

```json
{
  "name": "Super resolution",
  "slug": "super-resolution",
  "description": "Upscaling models that create high-quality images from low-quality images.",
  "models": [...]
}
```

### [](#collections.get-parameters)URL Parameters

*   [collection\_slug](#collections.get-parameters-collectionslug)stringRequired
    
    The slug of the collection, like `super-resolution` or `image-restoration`. See [replicate.com/collections](https://replicate.com/collections).
    

[](#collections.list)List collections of models
-----------------------------------------------

### [](#collections.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/collections
```

### [](#collections.list-description)Description

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/collections
```

The response will be a paginated JSON list of collection objects:

Copy

```json
{
  "next": "null",
  "previous": null,
  "results": [
    {
      "name": "Super resolution",
      "slug": "super-resolution",
      "description": "Upscaling models that create high-quality images from low-quality images."
    }
  ]
}
```

[](#deployments.create)Create a deployment
------------------------------------------

### [](#deployments.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/deployments
```

### [](#deployments.create-description)Description

Create a new deployment:

Example cURL request:

Copy

```shell
curl -s \
  -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "my-app-image-generator",
        "model": "stability-ai/sdxl",
        "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        "hardware": "gpu-t4",
        "min_instances": 0,
        "max_instances": 3
      }' \
  https://api.replicate.com/v1/deployments
```

The response will be a JSON object describing the deployment:

Copy

```json
{
  "owner": "acme",
  "name": "my-app-image-generator",
  "current_release": {
    "number": 1,
    "model": "stability-ai/sdxl",
    "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
    "created_at": "2024-02-15T16:32:57.018467Z",
    "created_by": {
      "type": "organization",
      "username": "acme",
      "name": "Acme Corp, Inc.",
      "avatar_url": "https://cdn.replicate.com/avatars/acme.png",
      "github_url": "https://github.com/acme"
    },
    "configuration": {
      "hardware": "gpu-t4",
      "min_instances": 1,
      "max_instances": 5
    }
  }
}
```

### [](#deployments.create-request-body)Request Body

*   [hardware](#deployments.create-request-body-hardware)stringRequired
    
    The SKU for the hardware used to run the model. Possible values can be retrieved from the `hardware.list` endpoint.
    
*   [max\_instances](#deployments.create-request-body-maxinstances)integerRequired
    
    The maximum number of instances for scaling.
    
*   [min\_instances](#deployments.create-request-body-mininstances)integerRequired
    
    The minimum number of instances for scaling.
    
*   [model](#deployments.create-request-body-model)stringRequired
    
    The full name of the model that you want to deploy e.g. stability-ai/sdxl.
    
*   [name](#deployments.create-request-body-name)stringRequired
    
    The name of the deployment.
    
*   [version](#deployments.create-request-body-version)stringRequired
    
    The 64-character string ID of the model version that you want to deploy.
    

[](#deployments.get)Get a deployment
------------------------------------

### [](#deployments.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/deployments/{deployment_owner}/{deployment_name}
```

### [](#deployments.get-description)Description

Get information about a deployment by name including the current release.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/deployments/replicate/my-app-image-generator
```

The response will be a JSON object describing the deployment:

Copy

```json
{
  "owner": "acme",
  "name": "my-app-image-generator",
  "current_release": {
    "number": 1,
    "model": "stability-ai/sdxl",
    "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
    "created_at": "2024-02-15T16:32:57.018467Z",
    "created_by": {
      "type": "organization",
      "username": "acme",
      "name": "Acme Corp, Inc.",
      "avatar_url": "https://cdn.replicate.com/avatars/acme.png",
      "github_url": "https://github.com/acme"
    },
    "configuration": {
      "hardware": "gpu-t4",
      "min_instances": 1,
      "max_instances": 5
    }
  }
}
```

### [](#deployments.get-parameters)URL Parameters

*   [deployment\_owner](#deployments.get-parameters-deploymentowner)stringRequired
    
    The name of the user or organization that owns the deployment.
    
*   [deployment\_name](#deployments.get-parameters-deploymentname)stringRequired
    
    The name of the deployment.
    

[](#deployments.list)List deployments
-------------------------------------

### [](#deployments.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/deployments
```

### [](#deployments.list-description)Description

Get a list of deployments associated with the current account, including the latest release configuration for each deployment.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/deployments
```

The response will be a paginated JSON array of deployment objects, sorted with the most recent deployment first:

Copy

```json
{
  "next": "http://api.replicate.com/v1/deployments?cursor=cD0yMDIzLTA2LTA2KzIzJTNBNDAlM0EwOC45NjMwMDAlMkIwMCUzQTAw",
  "previous": null,
  "results": [
    {
      "owner": "replicate",
      "name": "my-app-image-generator",
      "current_release": {
        "number": 1,
        "model": "stability-ai/sdxl",
        "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        "created_at": "2024-02-15T16:32:57.018467Z",
        "created_by": {
          "type": "organization",
          "username": "acme",
          "name": "Acme Corp, Inc.",
          "avatar_url": "https://cdn.replicate.com/avatars/acme.png",
          "github_url": "https://github.com/acme"
        },
        "configuration": {
          "hardware": "gpu-t4",
          "min_instances": 1,
          "max_instances": 5
        }
      }
    }
  ]
}
```

[](#deployments.update)Update a deployment
------------------------------------------

### [](#deployments.update-endpoint)Endpoint

Copy

```plaintext
PATCH https://api.replicate.com/v1/deployments/{deployment_owner}/{deployment_name}
```

### [](#deployments.update-description)Description

Update properties of an existing deployment, including hardware, min/max instances, and the deployment’s underlying model [version](https://replicate.com/docs/how-does-replicate-work#versions).

Example cURL request:

Copy

```shell
curl -s \
  -X PATCH \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"min_instances": 3, "max_instances": 10}' \
  https://api.replicate.com/v1/deployments/acme/my-app-image-generator
```

The response will be a JSON object describing the deployment:

Copy

```json
{
  "owner": "acme",
  "name": "my-app-image-generator",
  "current_release": {
    "number": 2,
    "model": "stability-ai/sdxl",
    "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
    "created_at": "2024-02-15T16:32:57.018467Z",
    "created_by": {
      "type": "organization",
      "username": "acme",
      "name": "Acme Corp, Inc.",
      "avatar_url": "https://cdn.replicate.com/avatars/acme.png",
      "github_url": "https://github.com/acme"
    },
    "configuration": {
      "hardware": "gpu-t4",
      "min_instances": 3,
      "max_instances": 10
    }
  }
}
```

Updating any deployment properties will increment the `number` field of the `current_release`.

### [](#deployments.update-parameters)URL Parameters

*   [deployment\_owner](#deployments.update-parameters-deploymentowner)stringRequired
    
    The name of the user or organization that owns the deployment.
    
*   [deployment\_name](#deployments.update-parameters-deploymentname)stringRequired
    
    The name of the deployment.
    

### [](#deployments.update-request-body)Request Body

*   [hardware](#deployments.update-request-body-hardware)string
    
    The SKU for the hardware used to run the model. Possible values can be retrieved from the `hardware.list` endpoint.
    
*   [max\_instances](#deployments.update-request-body-maxinstances)integer
    
    The maximum number of instances for scaling.
    
*   [min\_instances](#deployments.update-request-body-mininstances)integer
    
    The minimum number of instances for scaling.
    
*   [version](#deployments.update-request-body-version)string
    
    The ID of the model version that you want to deploy
    

[](#deployments.delete)Delete a deployment
------------------------------------------

### [](#deployments.delete-endpoint)Endpoint

Copy

```plaintext
DELETE https://api.replicate.com/v1/deployments/{deployment_owner}/{deployment_name}
```

### [](#deployments.delete-description)Description

Delete a deployment

Deployment deletion has some restrictions:

*   You can only delete deployments that have been offline and unused for at least 15 minutes.

Example cURL request:

Copy

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/deployments/acme/my-app-image-generator
```

The response will be an empty 204, indicating the deployment has been deleted.

### [](#deployments.delete-parameters)URL Parameters

*   [deployment\_owner](#deployments.delete-parameters-deploymentowner)stringRequired
    
    The name of the user or organization that owns the deployment.
    
*   [deployment\_name](#deployments.delete-parameters-deploymentname)stringRequired
    
    The name of the deployment.
    

[](#deployments.predictions.create)Create a prediction using a deployment
-------------------------------------------------------------------------

### [](#deployments.predictions.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/deployments/{deployment_owner}/{deployment_name}/predictions
```

### [](#deployments.predictions.create-description)Description

Create a prediction for the deployment and inputs you provide.

Example cURL request:

Copy

```shell
curl -s -X POST -H 'Prefer: wait' \
  -d '{"input": {"prompt": "A photo of a bear riding a bicycle over the moon"}}' \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  https://api.replicate.com/v1/deployments/acme/my-app-image-generator/predictions
```

The request will wait up to 60 seconds for the model to run. If this time is exceeded the prediction will be returned in a `"starting"` state and need to be retrieved using the `predictions.get` endpiont.

For a complete overview of the `deployments.predictions.create` API check out our documentation on [creating a prediction](https://replicate.com/docs/topics/predictions/create-a-prediction) which covers a variety of use cases.

### [](#deployments.predictions.create-parameters)URL Parameters

*   [deployment\_owner](#deployments.predictions.create-parameters-deploymentowner)stringRequired
    
    The name of the user or organization that owns the deployment.
    
*   [deployment\_name](#deployments.predictions.create-parameters-deploymentname)stringRequired
    
    The name of the deployment.
    

### [](#deployments.predictions.create-headers)Headers

*   [Prefer](#deployments.predictions.create-headers-prefer)string
    
    Leave the request open and wait for the model to finish generating output. Set to `wait=n` where n is a number of seconds between 1 and 60.
    
    See https://replicate.com/docs/topics/predictions/create-a-prediction#sync-mode for more information.
    

### [](#deployments.predictions.create-request-body)Request Body

*   [input](#deployments.predictions.create-request-body-input)objectRequired
    
    The model's input as a JSON object. The input schema depends on what model you are running. To see the available inputs, click the "API" tab on the model you are running or [get the model version](#models.versions.get) and look at its `openapi_schema` property. For example, [stability-ai/sdxl](https://replicate.com/stability-ai/sdxl) takes `prompt` as an input.
    
    Files should be passed as HTTP URLs or data URLs.
    
    Use an HTTP URL when:
    
    *   you have a large file > 256kb
    *   you want to be able to use the file multiple times
    *   you want your prediction metadata to be associable with your input files
    
    Use a data URL when:
    
    *   you have a small file <= 256kb
    *   you don't want to upload and host the file somewhere
    *   you don't need to use the file again (Replicate will not store it)
    
*   [stream](#deployments.predictions.create-request-body-stream)boolean
    
    **This field is deprecated.**
    
    Request a URL to receive streaming output using [server-sent events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).
    
    This field is no longer needed as the returned prediction will always have a `stream` entry in its `url` property if the model supports streaming.
    
*   [webhook](#deployments.predictions.create-request-body-webhook)string
    
    An HTTPS URL for receiving a webhook when the prediction has new output. The webhook will be a POST request where the request body is the same as the response body of the [get prediction](#predictions.get) operation. If there are network problems, we will retry the webhook a few times, so make sure it can be safely called more than once. Replicate will not follow redirects when sending webhook requests to your service, so be sure to specify a URL that will resolve without redirecting.
    
*   [webhook\_events\_filter](#deployments.predictions.create-request-body-webhookeventsfilter)array
    
    By default, we will send requests to your webhook URL whenever there are new outputs or the prediction has finished. You can change which events trigger webhook requests by specifying `webhook_events_filter` in the prediction request:
    
    *   `start`: immediately on prediction start
    *   `output`: each time a prediction generates an output (note that predictions can generate multiple outputs)
    *   `logs`: each time log output is generated by a prediction
    *   `completed`: when the prediction reaches a terminal state (succeeded/canceled/failed)
    
    For example, if you only wanted requests to be sent at the start and end of the prediction, you would provide:
    
    {
      "input": {
        "text": "Alice"
      },
      "webhook": "https://example.com/my-webhook",
      "webhook_events_filter": ["start", "completed"]
    }
    
    Requests for event types `output` and `logs` will be sent at most once every 500ms. If you request `start` and `completed` webhooks, then they'll always be sent regardless of throttling.
    

[](#files.list)List files
-------------------------

### [](#files.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/files
```

### [](#files.list-description)Description

Get a paginated list of all files created by the user or organization associated with the provided API token.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/files
```

The response will be a paginated JSON array of file objects, sorted with the most recent file first.

[](#files.create)Create a file
------------------------------

### [](#files.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/files
```

### [](#files.create-description)Description

Create a file by uploading its content and optional metadata.

Example cURL request:

Copy

```shell
curl -X POST https://api.replicate.com/v1/files \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H 'Content-Type: multipart/form-data' \
  -F 'content=@/path/to/archive.zip;type=application/zip;filename=example.zip' \
  -F 'metadata={"customer_reference_id": 123};type=application/json'
```

The request must include:

*   `content`: The file content (required)
*   `type`: The content / MIME type for the file (defaults to `application/octet-stream`)
*   `filename`: The filename (required, ≤ 255 bytes, valid UTF-8)
*   `metadata`: User-provided metadata associated with the file (defaults to `{}`, must be valid JSON)

[](#files.delete)Delete a file
------------------------------

### [](#files.delete-endpoint)Endpoint

Copy

```plaintext
DELETE https://api.replicate.com/v1/files/{file_id}
```

### [](#files.delete-description)Description

Delete a file. Once a file has been deleted, subsequent requests to the file resource return 404 Not found.

Example cURL request:

Copy

```shell
curl -X DELETE \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/files/cneqzikepnug6xezperrr4z55o
```

### [](#files.delete-parameters)URL Parameters

*   [file\_id](#files.delete-parameters-fileid)stringRequired
    
    The ID of the file to delete
    

[](#files.get)Get a file
------------------------

### [](#files.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/files/{file_id}
```

### [](#files.get-description)Description

Get the details of a file.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/files/cneqzikepnug6xezperrr4z55o
```

### [](#files.get-parameters)URL Parameters

*   [file\_id](#files.get-parameters-fileid)stringRequired
    
    The ID of the file to get
    

[](#files.download)Download a file
----------------------------------

### [](#files.download-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/files/{file_id}/download
```

### [](#files.download-description)Description

Download a file by providing the file owner, access expiry, and a valid signature.

Example cURL request:

Copy

```shell
curl -X GET "https://api.replicate.com/v1/files/cneqzikepnug6xezperrr4z55o/download?expiry=1708515345&owner=mattt&signature=zuoghqlrcnw8YHywkpaXQlHsVhWen%2FDZ4aal76dLiOo%3D"
```

### [](#files.download-parameters)URL Parameters

*   [file\_id](#files.download-parameters-fileid)stringRequired
    
    The ID of the file to download
    

### [](#files.download-query-parameters)Query Parameters

*   [owner](#files.download-query-parameters-owner)stringRequired
    
    The username of the user or organization that uploaded the file
    
*   [expiry](#files.download-query-parameters-expiry)integerRequired
    
    A Unix timestamp with expiration date of this download URL
    
*   [signature](#files.download-query-parameters-signature)stringRequired
    
    A base64-encoded HMAC-SHA256 checksum of the string '{owner} {id} {expiry}' generated with the Files API signing secret
    

[](#trainings.create)Create a training
--------------------------------------

### [](#trainings.create-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/models/{model_owner}/{model_name}/versions/{version_id}/trainings
```

### [](#trainings.create-description)Description

Start a new training of the model version you specify.

Example request body:

Copy

```json
{
  "destination": "{new_owner}/{new_name}",
  "input": {
    "train_data": "https://example.com/my-input-images.zip",
  },
  "webhook": "https://example.com/my-webhook",
}
```

Example cURL request:

Copy

```shell
curl -s -X POST \
  -d '{"destination": "{new_owner}/{new_name}", "input": {"input_images": "https://example.com/my-input-images.zip"}}' \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  https://api.replicate.com/v1/models/stability-ai/sdxl/versions/da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf/trainings
```

The response will be the training object:

Copy

```json
{
  "id": "zz4ibbonubfz7carwiefibzgga",
  "model": "stability-ai/sdxl",
  "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
  "input": {
    "input_images": "https://example.com/my-input-images.zip"
  },
  "logs": "",
  "error": null,
  "status": "starting",
  "created_at": "2023-09-08T16:32:56.990893084Z",
  "urls": {
    "web": "https://replicate.com/p/zz4ibbonubfz7carwiefibzgga",
     "get": "https://api.replicate.com/v1/predictions/zz4ibbonubfz7carwiefibzgga",
     "cancel": "https://api.replicate.com/v1/predictions/zz4ibbonubfz7carwiefibzgga/cancel"
  }
}
```

As models can take several minutes or more to train, the result will not be available immediately. To get the final result of the training you should either provide a `webhook` HTTPS URL for us to call when the results are ready, or poll the [get a training](#trainings.get) endpoint until it has finished.

When a training completes, it creates a new [version](https://replicate.com/docs/how-does-replicate-work#terminology) of the model at the specified destination.

To find some models to train on, check out the [trainable language models collection](https://replicate.com/collections/trainable-language-models).

### [](#trainings.create-parameters)URL Parameters

*   [model\_owner](#trainings.create-parameters-modelowner)stringRequired
    
    The name of the user or organization that owns the model.
    
*   [model\_name](#trainings.create-parameters-modelname)stringRequired
    
    The name of the model.
    
*   [version\_id](#trainings.create-parameters-versionid)stringRequired
    
    The ID of the version.
    

### [](#trainings.create-request-body)Request Body

*   [destination](#trainings.create-request-body-destination)stringRequired
    
    A string representing the desired model to push to in the format `{destination_model_owner}/{destination_model_name}`. This should be an existing model owned by the user or organization making the API request. If the destination is invalid, the server will return an appropriate 4XX response.
    
*   [input](#trainings.create-request-body-input)objectRequired
    
    An object containing inputs to the Cog model's `train()` function.
    
*   [webhook](#trainings.create-request-body-webhook)string
    
    An HTTPS URL for receiving a webhook when the training completes. The webhook will be a POST request where the request body is the same as the response body of the [get training](#trainings.get) operation. If there are network problems, we will retry the webhook a few times, so make sure it can be safely called more than once. Replicate will not follow redirects when sending webhook requests to your service, so be sure to specify a URL that will resolve without redirecting.
    
*   [webhook\_events\_filter](#trainings.create-request-body-webhookeventsfilter)array
    
    By default, we will send requests to your webhook URL whenever there are new outputs or the training has finished. You can change which events trigger webhook requests by specifying `webhook_events_filter` in the training request:
    
    *   `start`: immediately on training start
    *   `output`: each time a training generates an output (note that trainings can generate multiple outputs)
    *   `logs`: each time log output is generated by a training
    *   `completed`: when the training reaches a terminal state (succeeded/canceled/failed)
    
    For example, if you only wanted requests to be sent at the start and end of the training, you would provide:
    
    {
      "destination": "my-organization/my-model",
      "input": {
        "text": "Alice"
      },
      "webhook": "https://example.com/my-webhook",
      "webhook_events_filter": ["start", "completed"]
    }
    
    Requests for event types `output` and `logs` will be sent at most once every 500ms. If you request `start` and `completed` webhooks, then they'll always be sent regardless of throttling.
    

[](#trainings.get)Get a training
--------------------------------

### [](#trainings.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/trainings/{training_id}
```

### [](#trainings.get-description)Description

Get the current state of a training.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/trainings/zz4ibbonubfz7carwiefibzgga
```

The response will be the training object:

Copy

```json
{
  "completed_at": "2023-09-08T16:41:19.826523Z",
  "created_at": "2023-09-08T16:32:57.018467Z",
  "error": null,
  "id": "zz4ibbonubfz7carwiefibzgga",
  "input": {
    "input_images": "https://example.com/my-input-images.zip"
  },
  "logs": "...",
  "metrics": {
    "predict_time": 502.713876
  },
  "output": {
    "version": "...",
    "weights": "..."
  },
  "started_at": "2023-09-08T16:32:57.112647Z",
  "status": "succeeded",
  "urls": {
    "web": "https://replicate.com/p/zz4ibbonubfz7carwiefibzgga",
    "get": "https://api.replicate.com/v1/trainings/zz4ibbonubfz7carwiefibzgga",
    "cancel": "https://api.replicate.com/v1/trainings/zz4ibbonubfz7carwiefibzgga/cancel"
  },
  "model": "stability-ai/sdxl",
  "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
}
```

`status` will be one of:

*   `starting`: the training is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the training.
*   `processing`: the `train()` method of the model is currently running.
*   `succeeded`: the training completed successfully.
*   `failed`: the training encountered an error during processing.
*   `canceled`: the training was canceled by its creator.

In the case of success, `output` will be an object containing the output of the model. Any files will be represented as HTTPS URLs. You’ll need to pass the `Authorization` header to request them.

In the case of failure, `error` will contain the error encountered during the training.

Terminated trainings (with a status of `succeeded`, `failed`, or `canceled`) will include a `metrics` object with a `predict_time` property showing the amount of CPU or GPU time, in seconds, that the training used while running. It won’t include time waiting for the training to start.

### [](#trainings.get-parameters)URL Parameters

*   [training\_id](#trainings.get-parameters-trainingid)stringRequired
    
    The ID of the training to get.
    

[](#trainings.list)List trainings
---------------------------------

### [](#trainings.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/trainings
```

### [](#trainings.list-description)Description

Get a paginated list of all trainings created by the user or organization associated with the provided API token.

This will include trainings created from the API and the website. It will return 100 records per page.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/trainings
```

The response will be a paginated JSON array of training objects, sorted with the most recent training first:

Copy

```json
{
  "next": null,
  "previous": null,
  "results": [
    {
      "completed_at": "2023-09-08T16:41:19.826523Z",
      "created_at": "2023-09-08T16:32:57.018467Z",
      "error": null,
      "id": "zz4ibbonubfz7carwiefibzgga",
      "input": {
        "input_images": "https://example.com/my-input-images.zip"
      },
      "metrics": {
        "predict_time": 502.713876
      },
      "output": {
        "version": "...",
        "weights": "..."
      },
      "started_at": "2023-09-08T16:32:57.112647Z",
      "source": "api",
      "status": "succeeded",
      "urls": {
        "web": "https://replicate.com/p/zz4ibbonubfz7carwiefibzgga",
        "get": "https://api.replicate.com/v1/trainings/zz4ibbonubfz7carwiefibzgga",
        "cancel": "https://api.replicate.com/v1/trainings/zz4ibbonubfz7carwiefibzgga/cancel"
      },
      "model": "stability-ai/sdxl",
      "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
    }
  ]
}
```

`id` will be the unique ID of the training.

`source` will indicate how the training was created. Possible values are `web` or `api`.

`status` will be the status of the training. Refer to [get a single training](#trainings.get) for possible values.

`urls` will be a convenience object that can be used to construct new API requests for the given training.

`version` will be the unique ID of model version used to create the training.

[](#trainings.cancel)Cancel a training
--------------------------------------

### [](#trainings.cancel-endpoint)Endpoint

Copy

```plaintext
POST https://api.replicate.com/v1/trainings/{training_id}/cancel
```

### [](#trainings.cancel-parameters)URL Parameters

*   [training\_id](#trainings.cancel-parameters-trainingid)stringRequired
    
    The ID of the training you want to cancel.
    

[](#hardware.list)List available hardware for models
----------------------------------------------------

### [](#hardware.list-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/hardware
```

### [](#hardware.list-description)Description

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/hardware
```

The response will be a JSON array of hardware objects:

Copy

```json
[
    {"name": "CPU", "sku": "cpu"},
    {"name": "Nvidia T4 GPU", "sku": "gpu-t4"},
    {"name": "Nvidia A40 GPU", "sku": "gpu-a40-small"},
    {"name": "Nvidia A40 (Large) GPU", "sku": "gpu-a40-large"},
]
```

[](#account.get)Get the authenticated account
---------------------------------------------

### [](#account.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/account
```

### [](#account.get-description)Description

Returns information about the user or organization associated with the provided API token.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/account
```

The response will be a JSON object describing the account:

Copy

```json
{
  "type": "organization",
  "username": "acme",
  "name": "Acme Corp, Inc.",
  "github_url": "https://github.com/acme",
}
```

[](#webhooks.default.secret.get)Get the signing secret for the default webhook
------------------------------------------------------------------------------

### [](#webhooks.default.secret.get-endpoint)Endpoint

Copy

```plaintext
GET https://api.replicate.com/v1/webhooks/default/secret
```

### [](#webhooks.default.secret.get-description)Description

Get the signing secret for the default webhook endpoint. This is used to verify that webhook requests are coming from Replicate.

Example cURL request:

Copy

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/webhooks/default/secret
```

The response will be a JSON object with a `key` property:

Copy

```json
{
  "key": "..."
}
```

[](#rate-limits)Rate limits
---------------------------

We limit the number of API requests that can be made to Replicate:

*   You can call [create prediction](#create-a-prediction) at 600 requests per minute.
*   All other endpoints you can call at 3000 requests per minute.

If you hit a limit, you will receive a response with status `429` with a body like:

```json
{"detail":"Request was throttled. Expected available in 1 second."}
```

If you want higher limits, [contact us](https://replicate.com/support).

[](#openapi-schema)OpenAPI schema
---------------------------------

Replicate’s public HTTP API documentation is available as a machine-readable OpenAPI schema in JSON format.

See [OpenAPI schema](/docs/reference/openapi) to learn more and download the schema.

--- END OF http.md ---


# FILE: openapi.md

Replicate’s public HTTP API documentation is available as a machine-readable OpenAPI schema in JSON format.

Download the schema at [**api.replicate.com/openapi.json**](https://api.replicate.com/openapi.json)

[](#what-is-openapi)What is OpenAPI?
------------------------------------

OpenAPI (formerly known as Swagger) is a specification for describing the structure of HTTP APIs, including all their endpoints, HTTP methods, input parameters, request and response formats, and other metadata.

OpenAPI schemas are useful as raw reference material when learning about an API, but they’re also great for dynamically generating client libraries, [reference documentation](/docs/reference/http), tests, and tools for interacting with HTTP APIs.

OpenAPI is also the industry-standard format for AI [function calling](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) (also called “tool use”), which enables products like [Anthropic Claude](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/extracting_structured_json.ipynb) and [OpenAI GPT Actions](https://platform.openai.com/docs/actions/actions-library) to auto-discover the structure of HTTP APIs and interact with them dynamically.

[](#exploring-the-schema)Exploring the schema
---------------------------------------------

Here’s an example using cURL and [jq](https://jqlang.github.io/jq/) to print all the API paths in your terminal:

```shell
curl -s https://api.replicate.com/openapi.json | jq -r '.paths | keys[]'
/account
/collections
/collections/{collection_slug}
/deployments
/deployments/{deployment_owner}/{deployment_name}
/deployments/{deployment_owner}/{deployment_name}/predictions
/hardware
/models
/models/{model_owner}/{model_name}
/models/{model_owner}/{model_name}/predictions
/models/{model_owner}/{model_name}/versions
/models/{model_owner}/{model_name}/versions/{version_id}
/models/{model_owner}/{model_name}/versions/{version_id}/trainings
/predictions
/predictions/{prediction_id}
/predictions/{prediction_id}/cancel
/trainings
/trainings/{training_id}
/trainings/{training_id}/cancel
/webhooks/default/secret
```

[](#dereferencing)Dereferencing
-------------------------------

OpenAPI schemas are written in [JSON Schema](https://json-schema.org/), a format which allows you to have multiple references to the same object (see [`$ref`](https://json-schema.org/understanding-json-schema/structuring#dollarref)). References are great for keeping the schema DRY (Don’t Repeat Yourself), but they can make the schema a bit harder to read and use as a consumer.

To make the schema easier to work with, it’s helpful to “dereference” it. This means replacing all the references with the actual objects.

Here’s an example of how `$ref`s appear in the schema:

```json
{
  "parameters": [
    {
      "$ref": "#/components/parameters/prefer_header"
    }
  ],
}
```

And here’s what that same object looks like after dereferencing:

```json
{
  "parameters": [
    {
      "prefer_header": {
        "description": "Leave the request open and wait for the model to finish generating output.",
        "in": "header",
        "name": "Prefer",
        "schema": {
          "example": "wait=5",
          "pattern": "^wait(=([1-9]|[1-9][0-9]|60))?$",
          "type": "string"
        }
      }
    }
  ]
}
```

There are many open-source libraries for dereferencing OpenAPI schemas.

Here’s some example code showing how to dereference Replicate’s OpenAPI schema using Node.js and the popular and well-maintained [@apidevtools/json-schema-ref-parser](https://www.npmjs.com/package/@apidevtools/json-schema-ref-parser) npm package:

```js
import $RefParser from "@apidevtools/json-schema-ref-parser";
const res = await fetch("https://api.replicate.com/openapi.json");
const rawSchema = await res.json();
const dereferencedSchema = await $RefParser.dereference(rawSchema);
console.log(dereferencedSchema);
```

That will print the entire dereferenced schema to the console:

```js
{
  externalDocs: {
    description: 'Replicate HTTP API',
    url: 'https://replicate.com/docs/reference/http'
  },
  openapi: '3.1.0',
  paths: {
    '/account': { get: [Object] },
    '/collections': { get: [Object] },
    '/collections/{collection_slug}': { get: [Object] },
    '/deployments': { get: [Object], post: [Object] },
    '/deployments/{deployment_owner}/{deployment_name}': { delete: [Object], get: [Object], patch: [Object] },
    '/deployments/{deployment_owner}/{deployment_name}/predictions': { post: [Object] },
    '/hardware': { get: [Object] },
    '/models': { get: [Object], post: [Object], query: [Object] },
    '/models/{model_owner}/{model_name}': { delete: [Object], get: [Object] },
    '/models/{model_owner}/{model_name}/predictions': { post: [Object] },
    '/models/{model_owner}/{model_name}/versions': { get: [Object] },
    '/models/{model_owner}/{model_name}/versions/{version_id}': { delete: [Object], get: [Object] },
    '/models/{model_owner}/{model_name}/versions/{version_id}/trainings': { post: [Object] },
    '/predictions': { get: [Object], post: [Object] },
    '/predictions/{prediction_id}': { get: [Object] },
    '/predictions/{prediction_id}/cancel': { post: [Object] },
    '/trainings': { get: [Object] },
    '/trainings/{training_id}': { get: [Object] },
    '/trainings/{training_id}/cancel': { post: [Object] },
    '/webhooks/default/secret': { get: [Object] }
  },
  security: [ { bearerAuth: [] } ],
  servers: [ { url: 'https://api.replicate.com/v1' } ]
}
```

[](#model-schemas)Model schemas
-------------------------------

Every model on Replicate also has its own API schema.

You can programmatically fetch the full input and output schema for any Replicate model using the [`models.get`](/docs/reference/http#operation/models.get) API endpoint.

Here’s an example using cURL and [jq](https://jqlang.github.io/jq/) to print the input schema for the [black-forest-labs/flux-schnell](https://replicate.com/black-forest-labs/flux-schnell) model:

```shell
curl -s \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models/black-forest-labs/flux-schnell \
  | jq .latest_version.openapi_schema.components.schemas.Input.properties
```

And here’s the output:

```json
{
  "seed": {
    "type": "integer",
    "title": "Seed",
    "x-order": 3,
    "description": "Random seed. Set for reproducible generation"
  },
  "prompt": {
    "type": "string",
    "title": "Prompt",
    "x-order": 0,
    "description": "Prompt for generated image"
  },
  "go_fast": {
    "type": "boolean",
    "title": "Go Fast",
    "default": true,
    "x-order": 7,
    "description": "Run faster predictions with model optimized for speed (currently fp8 quantized); disable to run in original bf16"
  },
  "megapixels": {
    "allOf": [
      {
        "$ref": "#/components/schemas/megapixels"
      }
    ],
    "default": "1",
    "x-order": 8,
    "description": "Approximate number of megapixels for generated image"
  },
  "num_outputs": {
    "type": "integer",
    "title": "Num Outputs",
    "default": 1,
    "maximum": 4,
    "minimum": 1,
    "x-order": 2,
    "description": "Number of outputs to generate"
  },
  "aspect_ratio": {
    "allOf": [
      {
        "$ref": "#/components/schemas/aspect_ratio"
      }
    ],
    "default": "1:1",
    "x-order": 1,
    "description": "Aspect ratio for the generated image"
  },
  "output_format": {
    "allOf": [
      {
        "$ref": "#/components/schemas/output_format"
      }
    ],
    "default": "webp",
    "x-order": 4,
    "description": "Format of the output images"
  },
  "output_quality": {
    "type": "integer",
    "title": "Output Quality",
    "default": 80,
    "maximum": 100,
    "minimum": 0,
    "x-order": 5,
    "description": "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs"
  },
  "disable_safety_checker": {
    "type": "boolean",
    "title": "Disable Safety Checker",
    "default": false,
    "x-order": 6,
    "description": "Disable safety checker for generated images."
  }
}
```

To learn more about how Replicate model interfaces are defined, see the [Cog documentation](https://cog.run/python).

--- END OF openapi.md ---


# FILE: mcp.md

[](#what-is-mcp)What is MCP?
----------------------------

The Model Context Protocol (MCP) is an open standard developed by Anthropic that defines how applications share context with large language models (LLMs).

MCP extends the capabilities of apps like [Claude Desktop](https://claude.ai/download), [Cursor](https://www.cursor.com/), or [GitHub Copilot](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp) by feeding them [OpenAPI schemas](/docs/reference/openapi) that describe tools or services, like Replicate’s HTTP API.

MCP lets you give natural language instructions to a language model, and it can discover and run APIs automatically on your behalf.

Here are some examples of the kinds of prompts you can use:

> Search Replicate for upscaler models and compare them

> Show me the latest Replicate models created by @fofr

> Generate an image using black-forest-labs/flux-schnell

> Upscale that image using the best upscaler model

[](#replicates-mcp-server)Replicate’s MCP server
------------------------------------------------

Replicate’s MCP server is published as an [npm package](https://www.npmjs.com/package/replicate-mcp) that is automatically updated whenever we add new features to Replicate’s HTTP API:

[npm.im/replicate-mcp](https://www.npmjs.com/package/replicate-mcp)

The server supports all of the operations in Replicate’s HTTP API. Once you’ve got it wired up you can use natural language chat to do things like:

*   Search for models (using [`models.search`](/docs/reference/http#models.search) under the hood)
*   Compare models (using [`models.list`](/docs/reference/http#models.list) under the hood)
*   Fetch model metadata (using [`models.get`](/docs/reference/http#models.get) under the hood)
*   Run models (using [`predictions.create`](/docs/reference/http#predictions.create) under the hood)
*   Fetch predictions (using [`predictions.get`](/docs/reference/http#predictions.get) under the hood)
*   [etc…](/docs/reference/http)

[](#running-the-mcp-server)Running the MCP server
-------------------------------------------------

The `replicate-mcp` npm package is a self-contained HTTP server that you can run using the Node.js `npx` command, which downloads and executes npm packages by name without you having to install them first.

Use this command to start the MCP server:

```plaintext
npx -y replicate-mcp
```

☝️ This command will fire up a local HTTP server, but in practice you won’t usually run it this way. Instead, you’ll add some JSON configuration to your Claude, Cursor, or VS Code settings that will quietly and automatically run these local MCP servers on your machine.

Stop your server by pressing `Ctrl+c` in the terminal:

```plaintext
^c
```

Then read on to learn how to configure your apps to run the MCP server automatically.

[](#using-replicate-mcp-with-claude-desktop)Using Replicate MCP with Claude Desktop
-----------------------------------------------------------------------------------

[Claude Desktop](https://claude.ai/download) supports local MCP servers out of the box. Note that this only works with the Claude desktop app, not the web app.

Here’s how to set it up:

1.  Create a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=replicate-mcp-claude) and copy it.
    
2.  Open Claude Desktop.
    
3.  Click the Claude menu and select **Settings…** (not the in-app account settings).
    
4.  In the Settings window, click **Developer** in the sidebar, then click **Edit Config**. This will open (or create) a `claude_desktop_config.json` file.
    
5.  Add the following JSON to the file, substituting your Replicate API token for `your-token-here`:
    
    ```json
    {
      "mcpServers": {
        "replicate": {
          "command": "npx",
          "args": ["-y", "replicate-mcp"],
          "env": {
            "REPLICATE_API_TOKEN": "your-token-here"
          }
        }
      }
    }
    ```
6.  Restart Claude Desktop. Click the **Search and Tools** icon in the input box. You should see `replicate` listed as a tool:
    

![Claude Tools](/_content/assets/mcp-claude-tools.CutSK3Lq_ZRke3J.webp)

Now that you’ve got the MCP server running, you can use it to search for models, run predictions, and fetch model metadata.

Try these prompts in Claude Desktop:

> Search Replicate for upscaler models and compare them

> Show me the latest Replicate models created by @fofr

> Generate an image using black-forest-labs/flux-schnell

> Upscale that image using the best upscaler model

![Claude Chat](/_content/assets/mcp-claude-chat.CfCmb2p4_Z1gnLo0.webp)

[](#using-replicate-mcp-with-cursor)Using Replicate MCP with Cursor
-------------------------------------------------------------------

[Cursor](https://www.cursor.com/) supports the Model Context Protocol (MCP), allowing you to connect external tools and data sources—like Replicate’s HTTP API—directly to your code editor. With Replicate’s MCP server, you can search for models, run predictions, and fetch model metadata from within Cursor using natural language.

Start by creating a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=replicate-mcp-cursor) and copy it.

### [](#quick-setup)Quick setup

As of version 1.0, Cursor lets you install MCP servers using a link. Click the button below to install the MCP server in Cursor:

[![Add replicate MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=replicate&config=eyJjb21tYW5kIjoibnB4IC15IHJlcGxpY2F0ZS1tY3AiLCJlbnYiOnsiUkVQTElDQVRFX0FQSV9UT0tFTiI6InlvdXItdG9rZW4taGVyZSJ9fQ%3D%3D)

### [](#manual-setup)Manual setup

If you’d prefer to set up Cursor manually, here’s how:

1.  In your project, create a `.cursor/mcp.json` file with the following content:
    
    ```json
    {
      "mcpServers": {
        "replicate": {
          "command": "npx",
          "args": ["-y", "replicate-mcp"],
          "env": {
            "REPLICATE_API_TOKEN": "your-token-here"
          }
        }
      }
    }
    ```
    
    Replace `your-token-here` with your Replicate API token.
    
2.  Open Cursor. The MCP server will be started automatically when you use a tool that requires it, or you can start it manually from the MCP settings page.
    
3.  In Cursor, open the **MCP settings** (search for “MCP” in the command palette or find it in the settings sidebar). You should see `replicate` listed as an available tool.
    

![Cursor MCP](/_content/assets/mcp-cursor.B2H2azRC_1L58Lp.webp)

Now you can use Replicate tools in Cursor’s Composer Agent:

> Search Replicate for upscaler models and compare them

> Generate an image using black-forest-labs/flux-schnell

> Upscale that image using the best upscaler model

You can also configure MCP servers globally by creating a `~/.cursor/mcp.json` file, making Replicate’s tools available in all your Cursor workspaces.

For more details, see the [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

[](#using-replicate-mcp-with-github-copilot-in-vs-code)Using Replicate MCP with GitHub Copilot in VS Code
---------------------------------------------------------------------------------------------------------

You can use Replicate’s MCP server with GitHub Copilot Chat in Visual Studio Code to access Replicate’s API tools directly from chat. To set it up:

1.  Install [Visual Studio Code](https://code.visualstudio.com/) version 1.99 or later and make sure you have access to Copilot Chat.
    
2.  Create a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=replicate-mcp-copilot) and copy it.
    
3.  In your project, create a `.vscode/mcp.json` file with the following content:
    
    ```json
    {
      "servers": {
        "replicate": {
          "command": "npx",
          "args": ["-y", "replicate-mcp"],
          "env": {
            "REPLICATE_API_TOKEN": "your-token-here"
          }
        }
      }
    }
    ```
    
    Replace `your-token-here` with your Replicate API token.
    
4.  Open the `.vscode/mcp.json` file in VS Code and click the **Start** button that appears to launch the MCP server.
    
5.  Open Copilot Chat, select **Agent** from the chat menu, and use Replicate tools in natural language (e.g., “Search Replicate for upscaler models”).
    

You can also configure the MCP server to run globally in VS Code by adding the configuration to your user `settings.json`. For instructions, see the [GitHub Copilot documentation on using existing MCP configurations](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp#using-existing-mcp-configurations).

For more details and advanced configuration, see the [official GitHub Copilot documentation](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp).

--- END OF mcp.md ---


# FILE: open-source.md

![So many packages...](/_content/assets/open-source.DPD6bhkU_ZcFpPt.webp)

Open-source is a big deal at Replicate.

One of our goals as a team has always been to help unlock the power of machine learning by building flexible and well-designed open-source tools. We’re motivated by the experimentation and innovation that happens when ideas can grow beyond the confines of academic papers and take life as reproducible, open-source code.

This page highlights some of the open-source projects and tools we maintain. For the full list, see the [@replicate](https://github.com/replicate) organization on GitHub.

[](#api-client-libraries)API client libraries
---------------------------------------------

SDKs for working with Replicate’s [HTTP API](/docs/reference/http).

[replicate/replicate-javascript](https://github.com/replicate/replicate-javascript) -  Node.js client for the Replicate API with ESM and CommonJS support. Works on multiple runtimes like Node.js, Bun, and Deno, and serverless platforms like CloudFlare Workers, Vercel functions, and AWS Lambda.

[replicate/replicate-python](https://github.com/replicate/replicate-python) -  Python client for the Replicate API that lets you run models from your Python code, Jupyter notebooks, and Google Colab.

[replicate/replicate-go](https://github.com/replicate/replicate-go) -  Go client. It lets you run models from your Golang code, and everything else you can do with Replicate's HTTP API.

[replicate/replicate-swift](https://github.com/replicate/replicate-swift) -  Swift client. Use it to build apps for iOS, macOS, visionOS, tvOS, and watchOS.

[](#building-models)Building models
-----------------------------------

The tools we use to define, package, and continuously deploy models on Replicate.

[replicate/cog](https://github.com/replicate/cog) -  Containers for machine learning. Cog provides a Go CLI and Python API for defining and packaging machine learning models in standard, production-ready Docker containers. Every model you run on Replicate is packaged with Cog.

[replicate/cog-safe-push](https://github.com/replicate/cog-safe-push) -  Safely push new versions of your Cog model by making sure it works and is backwards-compatible with previous versions.

[replicate/setup-cog](https://github.com/replicate/setup-cog) -  A GitHub Action for Cog so you can run, test, and push models as part of your CI/CD pipeline.

[andreasjansson/autocog](https://github.com/andreasjansson/autocog) -  Simplify the process of creating Cog models by using GPT-4 to generate predict.py and cog.yaml automatically.

[replicate/pget](https://github.com/replicate/pget) -  High-performance concurrent file downloader built in Go. Useful for parallelized downloads of huge weights files.

[replicate/cli](https://github.com/replicate/cli) -  The official command-line interface for Replicate.

[](#running-models)Running models
---------------------------------

Open-source tools created and maintained by Replicate staff.

[zeke/all-the-public-replicate-models](https://github.com/zeke/all-the-public-replicate-models) -  A daily-updated npm package containing metadata for all public Replicate models.

[ai-prompts/prompt-lists](https://github.com/ai-prompts/prompt-lists) -  Lists to generate prompts.

[fofr/prompter.fofr.ai](https://github.com/fofr/prompter.fofr.ai) -  An app for generating text prompts.

[fofr/replicate-predict](https://github.com/fofr/replicate-predict) -  A JavaScript wrapper to run and save batches of API calls on Replicate.

[pwntus/replicate-webhook-proxy](https://github.com/pwntus/replicate-webhook-proxy) -  Receive Replicate webhook events through a websocket connection, right in your browser or Node.js code.

[zeke/aimg](https://github.com/zeke/aimg) -  Generate AI images with Replicate and save them to disk.

[zeke/ml-ipsum](https://github.com/zeke/ml-ipsum) -  Lorem ipsum meets machine learning. False positive rate velit elit prediction aute id. Serving officia excepteur hyperplane.

[zeke/promptmaker](https://github.com/zeke/promptmaker) -  Generate random artistic text prompts for generative models.

[zeke/yolox](https://github.com/zeke/yolox) -  Use language models to write one-line shell commands.

[](#boilerplates)Boilerplates
-----------------------------

Starter projects and templates to help you quickly begin developing apps using Replicate.

[replicate/cog-examples](https://github.com/replicate/cog-examples) -  Example models built with Cog.

[replicate/create-replicate](https://github.com/replicate/create-replicate) -  A Node.js CLI that works with npx to quickly spin up projects for running models with Replicate's API.

[replicate/getting-started-nextjs](https://github.com/replicate/getting-started-nextjs) -  Example app that demonstrates how to use Replicate's API with Next.js. Uses Next.js App Router, React Server Components, and illustrates how to use webhooks with Replicate.

[replicate/llama-chat](https://github.com/replicate/llama-chat) -  Example app that demonstrates how to use Replicate's API with Next.js.

[](#demo-apps)Demo apps
-----------------------

Example apps showing common patterns for using Replicate’s API.

[replicate/ideogram-inpainting-example-js](https://github.com/replicate/ideogram-inpainting-example-js) -  Node.js demo app for inpainting images using Ideogram.

[replicate/green-screen-creator](https://github.com/replicate/green-screen-creator) -  Track an object in a video and add a green screen to the background.

[replicate/reflux](https://github.com/replicate/reflux) -  Image editor for combining multiple LoRA fine-tunes.

[fofr/waveformer](https://github.com/fofr/waveformer) -  Text to music using MusicGen.

[replicate/quirky](https://github.com/replicate/quirky) -  Make really cool QR codes with AI.

[replicate/inpainter](https://github.com/replicate/inpainter) -  Remove objects from images.

[replicate/outpainter](https://github.com/replicate/outpainter) -  Expand the contents of an image using generative fill.

[replicate/zoo](https://github.com/replicate/zoo) -  Compare image models like SDXL, Stable Diffusion, and DALL-E.

[replicate/scribble-diffusion](https://github.com/replicate/scribble-diffusion) -  Turn your sketch into a refined image using AI.

[replicate/tilemaker](https://github.com/replicate/tilemaker) -  Make your next wallpaper with tiled stable diffusion.

[replicate/paint-by-text](https://github.com/replicate/paint-by-text) -  Edit your photos using written instructions, with the help of an AI.

[replicate/replicate-support-bot](https://github.com/replicate/replicate-support-bot) -  A Discord bot that answers questions about Replicate.

[](#flux)Flux
-------------

Tools for working with [Flux](https://replicate.com/black-forest-labs), the state-of-the-art open-source image generation model from Black Forest Labs.

[replicate/cog-flux](https://github.com/replicate/cog-flux) -  Inference code for Flux Schnell and Flux Dev.

[replicate/flux-fine-tuner](https://github.com/replicate/flux-fine-tuner) -  Fine-tuning code for Flux.

[zeke/flux-fine-tune-action](https://github.com/zeke/flux-fine-tune-action) -  GitHub Actions workflow for fine-tuning Flux. Store your training data in a GitHub repo and train a custom version of Flux.

[replicate/reflux](https://github.com/replicate/reflux) -  Flux LoRA image editor built on Nuxt

--- END OF open-source.md ---

