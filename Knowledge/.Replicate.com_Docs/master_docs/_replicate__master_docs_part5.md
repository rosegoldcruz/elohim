
# FILE: safety-checking.md

Image generation models like [Stability AI’s SDXL](https://replicate.com/stability-ai/sdxl) and [Black Forest Labs’ Flux](https://replicate.com/black-forest-labs/flux-dev) include a safety checker to prevent the model from generating images that portray nudity, violence, and other unsafe content.

To protect users from generating unsafe content, we enable the safety checker for web predictions on the [SDXL base model](https://replicate.com/stability-ai/sdxl), the [Flux base model](https://replicate.com/black-forest-labs/flux-dev), and all derivative fine-tunes of both SDXL and Flux.

The safety checker is intended to protect users, but it can sometimes be too restrictive or generate false positives, incorrectly flagging safe content as unsafe. For those cases, you can disable the safety checker when running the model with the API. This gives you the flexibility to use a [custom safety-checking model](https://replicate.com/zsxkib/stable-diffusion-safety-checker) or a third-party service as part of your workflow.

For more details on allowed use, see the [terms of service](https://replicate.com/terms).

--- END OF safety-checking.md ---


# FILE: data-retention.md

When you run models on Replicate, some data you provide is deleted automatically after a period of time, and other data you can delete yourself manually. Data retention also differs depending on whether you run a model via the API or on the web.

[](#automatic-data-clean-up)Automatic data clean up
---------------------------------------------------

For predictions created through the API, all input parameters, output values, output files, and logs are automatically removed after an hour, by default. If you’d like to continue using the prediction input and output data, you must save your own copies before it is removed. For tips on how to store prediction data, refer to the [webhooks docs](/docs/topics/webhooks).

Data for predictions created through the web interface is kept for 90 days, unless they are shared or used as an example. Data for shared and example predictions is kept indefinitely.

[](#deleting-predictions-manually)Deleting predictions manually
---------------------------------------------------------------

To manually delete a prediction on the website, go to your dashboard, find the prediction, and look for a **Delete** button on the prediction page. Clicking this button completely removes the prediction from the site, including any output data and output files associated with it.

--- END OF data-retention.md ---


# FILE: streaming.md

Replicate’s API supports server-sent event streams (SSEs) for models. This guide will show you how to consume streaming output.

[](#what-is-streaming-output)What is streaming output?
------------------------------------------------------

Streaming output allows you to receive real-time progressive updates while a model processes your input. Instead of waiting for the entire prediction to complete, you can access results as they are generated, making it ideal for applications like chat bots that require immediate responses.

At a high level, streaming output works like this:

1.  You create a prediction with the `stream` option.
2.  Replicate returns a prediction with a URL to receive streaming output.
3.  You connect to the URL and receive a stream of updates.

[](#which-models-support-streaming-output)Which models support streaming output?
--------------------------------------------------------------------------------

Streaming output is [supported by lots of language models](https://replicate.com/collections/streaming-language-models), including several variations of Llama 3:

*   **[meta/meta-llama-3.1-405b-instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct)**: 405 billion parameter model fine-tuned on chat completions. If you want to build a chat bot with the best accuracy, this is the one to use.
*   **[meta/meta-llama-3-70b-instruct](https://replicate.com/meta/meta-llama-3-70b-instruct)**: 70 billion parameter model fine-tuned on chat completions. A good balance of accuracy and cost.
*   **[meta/meta-llama-3-70b](https://replicate.com/meta/meta-llama-3-70b)**: 70 billion parameter base model. Use this if you want to do other kinds of language completions, like completing a user’s writing.
*   **[meta/meta/meta-llama-3-8b-instruct](https://replicate.com/meta/meta-llama-3-8b-instruct)**: 8 billion parameter model fine-tuned on chat completions. Use this if you’re building a chat bot and would prefer it to be faster and cheaper at the expense of accuracy.
*   **[meta/meta/meta-llama-3-8b](https://replicate.com/meta/meta-llama-3-8b)**: 8 billion parameter base model. Base models can be used for a variety of natural language generation tasks.

For a full list of models that support streaming output, see the [streaming language models collection](https://replicate.com/collections/streaming-language-models).

[](#requesting-streaming-output)Requesting streaming output
-----------------------------------------------------------

When you create a prediction, specify the `stream` option to request a URL to receive streaming output using [server-sent events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

If the requested model version supports streaming, then the returned prediction will have a `stream` entry in its `urls` property with a URL that you can use to construct an `EventSource`.

[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) is a standard web browser API for receiving server-sent events. It allows the server to push real-time updates to the browser without needing a full two-way connection like WebSockets.

HTTP

```shell
curl -X POST -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
      -d '{"input": {"prompt": "Tell me a story"}, "stream": true}' \
      "https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions"
# See https://replicate.com/meta/llama-3-70b-instruct
```

JavaScript

```js
const stream = replicate.stream("meta/meta-llama-3-70b-instruct", {
  prompt: "Tell me a story",
});
```

You can then process events from this stream.

[](#receiving-streaming-output)Receiving streaming output
---------------------------------------------------------

HTTP

```shell
curl -X GET -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
      -H "Accept: text/event-stream" \
      "https://streaming.api.replicate.com/v1/predictions/fuwwvjtbdmroc4xifxdcwqtdfq"
``````text
event: output
id: 1690212292:0
data: Once upon a time...
```

JavaScript

To receive streaming output, construct an `EventSource` using the `stream` URL from the prediction:

```js
const output = [];
for await (const { event, data } of stream) {
  if (event === "output") {
    output.push(data);
  }
}
console.log(output.join(""));
```

A prediction’s event stream consists of the following event types:

event

format

description

`output`

plain text

Emitted when the prediction returns new output

`error`

JSON

Emitted when the prediction returns an error

`done`

JSON

Emitted when the prediction finishes

A `done` event is emitted when a prediction finishes successfully, is cancelled, or produces an error.

If a prediction completes successfully, it receives a `done` event with an empty JSON payload.

```text
event: output
id: 1690212292:0
data: Once upon a time...
event: output
id: 1690212293:0
data: The End.
event: done
data: {}
```

If a prediction is cancelled, it receives a `done` event with a JSON payload `{"reason": "canceled"}`.

```text
event: output
id: 1690212292:0
data: Once upon a time...
event: done
data: {"reason": "canceled"}
```

If a prediction produces an error, it receives an `error` event with a JSON payload for the error followed by a `done` event with a JSON payload `{"reason": "error"}`.

```text
event: output
id: 1690212292:0
data: Once upon a time...
event: error
data: {"detail": "Something went wrong"}
event: done
data: {"reason": "error"}
```

[](#408-request-timeout)408 Request timeout
-------------------------------------------

There is a 30 second timeout on the event stream endpoint, which when reached will result in an empty event being sent down the stream with the text “408: 408 Request Timeout”.

```plaintext
:408: 408 Request Timeout
```

This will usually occur if you try to connect to the stream after the prediction has been deleted (API predictions expire after 1 hour) or if the client has failed to process the `done` event and close the connection.

[](#further-reading)Further reading
-----------------------------------

*   Check out [llama.replicate.dev](https://llama.replicate.dev/) to see an example of streaming output in a Next.js app.
*   Read the [Replicate Node.js client API docs](https://github.com/replicate/replicate-javascript#streaming) for usage details for Node.js and browsers.
*   Compare streaming models using [Vercel’s AI playground](https://sdk.vercel.ai).
*   Learn how to use [Vercel’s AI SDK](https://sdk.vercel.ai/docs/guides/providers/replicate) to stream models on Replicate in JavaScript apps.

--- END OF streaming.md ---


# FILE: deployments.md

Replicate makes it easy to run machine learning models. You can run the best open-source models with just one line of code, or deploy your own custom models. But sometimes you need more control. That’s where deployments come in.

[](#what-are-deployments)What are deployments?
----------------------------------------------

Deployments give you more control over how your models run. With deployments you can:

*   Roll out new versions of your model without having to edit your code.
*   Auto-scale your models to handle extra load and scale to zero when they’re not being used.
*   Keep instances always on to avoid cold boots.
*   Customize what hardware your models run on.
*   Monitor whether instances are setting up, idle, or processing predictions.
*   Monitor the predictions that are flowing through your model.

Deployments work with both open-source models and your own custom models.

[](#autoscaling)Autoscaling
---------------------------

Deployments auto-scale according to demand. If you send a lot of traffic, they scale up to handle it, and when things are quiet they scale back down, so you only pay for what you need. You can also limit the maximum number of instances the deployment can use to limit your maximum spend, or set a minimum to keep some instances warm and ready for predictions.

--- END OF deployments.md ---


# FILE: create-a-deployment.md

To create a new deployment, go to [replicate.com/deployments](https://replicate.com/deployments) and select **Create a new deployment**. (You can also navigate to any model _version_ on the website and click the **Deploy** button on the top right of the view.)

Here you will be able to give the deployment a name and confirm the model and version that you wish to deploy. You can update the version at any time. Once your deployment is created, you’ll be able to start running predictions against your new model instance.

To further configure the deployment, navigate to the **Settings** tab on the deployment page. Here you can customize the hardware as well as the autoscaling characteristics of the deployment. We also give you an indicator of how much the deployment will cost to operate.

[](#manage-deployments-using-the-api)Manage deployments using the API
---------------------------------------------------------------------

You can also create and manage deployments using the API.

Example cURL request:

```shell
curl -s \
  -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "my-app-image-generator",
        "model": "some-org/some-model",
        "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        "hardware": "gpu-t4",
        "min_instances": 1,
        "max_instances": 5
      }' \
  https://api.replicate.com/v1/deployments
```

The response will be a JSON object describing the deployment:

```json
{
  "owner": "acme",
  "name": "my-app-image-generator",
  "current_release": {
    "number": 1,
    "model": "some-org/some-model",
    "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
    "created_at": "2024-02-15T16:32:57.018467Z",
    "created_by": {
      "type": "organization",
      "username": "acme",
      "name": "Acme Corp, Inc.",
      "github_url": "https://github.com/acme",
    },
    "configuration": {
      "hardware": "gpu-t4",
      "min_instances": 1,
      "max_instances": 5
    }
  }
}
```

See the API docs for more details:

*   [Create a deployment](https://replicate.com/docs/reference/http#deployments.create)
*   [Get a deployment](https://replicate.com/docs/reference/http#deployments.get)
*   [Update a deployment](https://replicate.com/docs/reference/http#deployments.update)
*   [Delete a deployment](https://replicate.com/docs/reference/http#deployments.delete)
*   [List deployments](https://replicate.com/docs/reference/http#deployments.list)
*   [Create a prediction using a deployment](https://replicate.com/docs/reference/http#deployments.predictions.create)

--- END OF create-a-deployment.md ---


# FILE: view-deployments.md

All existing deployments can be found under your account dashboard in the [**Deployments** tab](https://replicate.com/deployments). From here you can navigate to a specific deployment to see its current status, usage metrics and predictions.

To temporarily disable a deployment, you can set the minimum and maximum instances under the autoscaling settings to zero, or select **Disable deployment** under **Settings**. This will cancel any in-flight predictions, prevent further predictions from running, and halt billing for the instance.

To permanently delete a deployment, see [Delete a deployment](/docs/topics/deployments/delete-a-deployment).

--- END OF view-deployments.md ---


# FILE: delete-a-deployment.md

You can delete a deployment you own on the settings page on the web or programmatically via the `deployments.delete` HTTP API.

Note

You can only delete deployments that have been offline and unused for at least 15 minutes.

[](#delete-a-deployment-on-the-web)Delete a deployment on the web
-----------------------------------------------------------------

Go to [Deployments](https://replicate.com/deployments) and select the deployment, navigate to **Settings**, then select **Delete deployment**.

[](#delete-a-deployment-via-api)Delete a deployment via API
-----------------------------------------------------------

Use the [`deployments.delete` endpoint](https://replicate.com/docs/reference/http#delete-a-deployment):

```http
DELETE https://api.replicate.com/v1/deployments/{deployment_id}
```

Here’s an example cURL request:

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.replicate.com/v1/deployments/deployment-id
```

Note

Currently, the JavaScript and Python client libraries do not offer a way to delete deployments (only the HTTP API does).

--- END OF delete-a-deployment.md ---


# FILE: webhooks.md

Webhooks provide real-time updates about your prediction. Specify an endpoint when you [create a prediction](/docs/reference/http#predictions.create), and Replicate will send HTTP POST requests to that URL when the prediction is created, updated, and finished.

Here are some example scenarios where webhooks are useful:

*   **Persisting prediction data and files.** Input and output (including any files) are _automatically deleted after an hour_ for any predictions created through the API. Webhooks give you a way to receive all the metadata for a completed prediction, so you can store it in a database or save the output files to persistent storage before they’re gone.
*   **Sending notifications when long-running predictions finish.** Some predictions like training jobs can take several minutes to run. You can use a webhook handler to send a notification like an email or a Slack message when a prediction completes.
*   **Creating model pipelines**. You can use webhooks to capture the output of one long-running prediction and pipe it into another model as input.

Note: Webhooks are handy, but they’re not strictly necessary to use Replicate, and there are other ways to receive updates. You can also [poll the predictions API](/docs/reference/http#predictions.get) or use [server-sent events (SSEs)](/docs/streaming) to check the status of a prediction over time.

Note

Watch: Learn more about how to use webhooks → [YouTube (14 minutes)](https://youtu.be/ae3c_0sc9Rg).

--- END OF webhooks.md ---


# FILE: setup-webhook.md

To receive webhook events, specify a `webhook` URL in the request body when creating a prediction or a training.

Here’s an example using the Replicate client to create a prediction and request a webhook event when the prediction is completed:

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();

JavascriptPython

```js
await replicate.predictions.create({
  version: "d55b9f2d...",
  input: { prompt: "call me later maybe" },
  webhook: "https://example.com/replicate-webhook",
  webhook_events_filter: ["completed"], // optional
});
```

```python
import replicate
prediction = replicate.predictions.create(
    version="d55b9f2d...",
    input={"prompt": "call me later maybe"},
    webhook="https://example.com/replicate-webhook",
    webhook_events_filter=["completed"],  # optional
)
```

[](#webhook-events-filter)Webhook events filter
-----------------------------------------------

By default, we will send requests to your webhook URL whenever there are new outputs or the prediction has finished. You can change which events trigger webhook requests by specifying `webhook_events_filter` in the prediction request:

*   `start`: immediately on prediction start
*   `output`: each time a prediction generates an output (note that predictions can generate multiple outputs)
*   `logs`: each time log output is generated by a prediction
*   `completed`: when the prediction reaches a terminal state (succeeded/canceled/failed)

For example, if you only wanted requests to be sent at the start and end of the prediction, you would provide:

```json
{
  "input": {
    "text": "Alice"
  },
  "webhook": "https://example.com/my-webhook",
  "webhook_events_filter": ["start", "completed"]
}
```

Requests for event types `output` and `logs` will be sent at most once every 500ms.

If you request `start` and `completed` webhooks, then they’ll always be sent regardless of throttling.

[](#webhooks-for-trainings)Webhooks for trainings
-------------------------------------------------

In addition to predictions, you can also receive webhooks when [fine-tuning models with the training API](/docs/get-started/fine-tune-with-flux):

JavascriptPython

```js
await replicate.trainings.create({
  version: "d55b9f2d...",
  destination: "my-username/my-model",
  input: { training_data: "..." },
  webhook: "https://example.com/replicate-webhook",
});
```

```python
import replicate
training = replicate.trainings.create(
    version="d55b9f2d...",
    destination="my-username/my-model",
    input={"training_data": "..."},
    webhook="https://example.com/replicate-webhook",
)
```

Tip

**Add query params to your webhook URL** to pass along extra metadata, like an internal ID you’re using for a prediction. For example: `https://example.com/replicate-webhook?customId=123`

[](#example-resources)Example resources
---------------------------------------

*   See the [Node.js client](https://github.com/replicate/replicate-javascript#replicatepredictionscreate) webhook docs.
*   See the [Python client](https://github.com/replicate/replicate-python#run-a-model-in-the-background-and-get-a-webhook) webhook docs.
*   See [predictions.create](https://replicate.com/docs/reference/http#predictions.create) and [trainings.create](https://replicate.com/docs/reference/http#trainings.create) API docs.
*   See [Scribble Diffusion’s codebase](https://github.com/replicate/scribble-diffusion/pull/27/commits/627c872c78aad89cadd02798d37d4696e3278a12) for a reference implementation in JavaScript.
*   Read our [streaming guide](/docs/streaming) to learn how to consume server-sent events (SSEs) from language models.

--- END OF setup-webhook.md ---


# FILE: receive-webhook.md

Replicate can send an HTTP POST request to the URL you specified whenever the prediction is created, has new logs, new output, or is completed.

Note

To get started building your first webhook handler, check out this guide: [Build a webhook notifier with Val Town](/docs/guides/build-a-webhook-notifier-with-val-town).

The request body is a prediction object in JSON format. This object has the same structure as the object returned by the [get a prediction](https://replicate.com/docs/reference/http#get-a-prediction) API. Here’s an example of an unfinished prediction:

```json
{
  "id": "ufawqhfynnddngldkgtslldrkq",
  "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "created_at": "2022-04-26T22:13:06.224088Z",
  "started_at": null,
  "completed_at": null,
  "status": "starting",
  "input": {
    "text": "Alice"
  },
  "output": null,
  "error": null,
  "logs": null,
  "metrics": {}
}
```

Refer to [Prediction status](/docs/topics/predictions/lifecycle) for the list of possible `status` values.

Here’s an example of a webhook handler:

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();

JavascriptPython

```js
// pages/api/replicate-webhook.js
export default async function handler(req, res) {
  console.log(" incoming webhook!", req.body.id);
  const prediction = req.body;
  await saveToMyDatabase(prediction);
  await sendSlackNotification(prediction);
  res.end();
}
```

```python
# app.py
from flask import Flask, request, jsonify
import logging
app = Flask(__name__)
@app.route('/replicate-webhook', methods=['POST'])
def replicate_webhook():
    prediction = request.json
    logging.info(f" incoming webhook! {prediction['id']}")
    
    # Example functions to save data and send notifications
    save_to_my_database(prediction)
    send_slack_notification(prediction)
    
    return "", 200  # Return empty response with 200 status code
def save_to_my_database(prediction):
    # Your database storage logic here
    pass
def send_slack_notification(prediction):
    # Your Slack notification logic here
    pass
if __name__ == '__main__':
    app.run(debug=True)
```

Your endpoint should respond with a 2xx status code within a few seconds; otherwise, the webhook might be retried.

[](#filtering-webhook-events)Filtering webhook events
-----------------------------------------------------

By default, Replicate sends requests to your webhook URL whenever there are new outputs or the prediction has finished. You can change which events trigger webhook requests by specifying a `webhook_events_filter` array in the JSON body of the prediction request.

*   `start`: immediately on prediction start
*   `output`: each time a prediction generates an output (note that predictions can generate multiple outputs)
*   `logs`: each time log output is generated by a prediction
*   `completed`: when the prediction reaches a terminal state (succeeded/canceled/failed)

For example, if you only wanted requests to be sent at the start and end of the prediction, you would provide:

```json
{
  "input": {
    "text": "Alice"
  },
  "webhook": "https://example.com/my-webhook",
  "webhook_events_filter": ["start", "completed"]
}
```

Requests for event types `output` and `logs` will be sent at most once every 500ms. If you request `start` and `completed` webhooks, then they’ll always be sent regardless of throttling.

[](#retries)Retries
-------------------

When Replicate sends the terminal webhook for a prediction (where the status is `succeeded`, `failed` or `canceled`), we check the response status we get. If we can’t make the request at all, or if we get a 4xx or 5xx response, we’ll retry the webhook. We retry several times on an exponential backoff. The final retry is sent about 1 minute after the prediction completed.

We do not retry any webhooks for intermediate states.

[](#idempotency)Idempotency
---------------------------

**Make webhook handlers idempotent**. Identical webhooks can be sent more than once, so you’ll need handle potentially duplicate information.

[](#ordering)Ordering
---------------------

In rare cases, webhooks for a single prediction may arrive out of order. We recommend you include logic in your application to ignore all webhooks for a prediction after the terminal webhook (where the status is `succeeded`, `failed` or `canceled`). If you are using `output` or `logs` events, you may also want to ignore webhooks that regress the status of the prediction (for example, by emitting less output or fewer logs).

--- END OF receive-webhook.md ---


# FILE: verify-webhook.md

To prevent unauthorized requests, Replicate signs every webhook and its metadata with a unique key for each user or organization. You can use this signature to verify the webhook indeed comes from Replicate before you process it.

[](#why-verify-webhooks)Why verify webhooks?
--------------------------------------------

A webhook is an HTTP POST from an unknown source. Attackers can impersonate services by simply sending a fake webhook to an endpoint.

Another potential security hole is a [replay attack](https://en.wikipedia.org/wiki/Replay_attack), wherein an attacker intercepts a valid webhook payload (including the signature) and re-transmits it to your endpoint. This payload will pass signature validation, and will therefore be acted upon. To mitigate replay attacks, Replicate includes a timestamp indicating when the webhook attempt occurred.

[](#manually-validating-webhook-data)Manually validating webhook data
---------------------------------------------------------------------

Each webhook delivery includes three HTTP headers with additional information that you can use to verify the authenticity of the request:

*   `webhook-id`: The unique message identifier for the webhook messages. This identifier is unique across all messages but will be the same when a webhook is being resent (e.g. retried).
*   `webhook-timestamp`: timestamp in [seconds since epoch](https://en.wikipedia.org/wiki/Unix_time).
*   `webhook-signature`: the [Base64](https://en.wikipedia.org/wiki/Base64) encoded list of signatures (space delimited).

[](#constructing-the-signed-content)Constructing the signed content
-------------------------------------------------------------------

As a webhook receiver, you are responsible for constructing this signed content and performing the validation steps. To validate a webhook, the signed data must be constructed into a well-defined structure from the payload data (body), `webhook-id`, and `webhook-timestamp` headers.

The content to sign is composed by concatenating the `id`, `timestamp`, and `data`, separated by the full-stop character (`.`).

In code it will look something like:

```js
const signedContent = `${webhook_id}.${webhook_timestamp}.${body}`
```

In the example above, `body` is the raw body of the request. The signature is sensitive to any changes, so even a small change in the body will cause the signature to be completely different. This means that you should not change the body in any way before verifying.

[](#retrieving-the-webhook-signing-key)Retrieving the webhook signing key
-------------------------------------------------------------------------

Replicate provides an [API endpoint you can use to retrieve the signing key](https://replicate.com/docs/reference/http#get-the-signing-secret-for-the-default-webhook). The signing key is unique to your user or organization. The endpoint will return only the signing key associated with the API token and its corresponding user or organization.

For optimal performance of the webhook receiver, it is advised to locally cache the signing key. By doing so, you eliminate the need for the receiver to make a request to the Replicate API for validation every time a webhook is received.

```plaintext
GET https://api.replicate.com/v1/webhooks/default/secret
```

Example cURL request:

```bash
curl -s -X GET -H "Authorization: Bearer <paste-your-token-here>" \
https://api.replicate.com/v1/webhooks/default/secret
```

The response will be a JSON object with a single `key` field:

```json
{
    "key": "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD"
}
```

[](#determining-the-expected-signature)Determining the expected signature
-------------------------------------------------------------------------

Replicate uses an [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) with [SHA-256](https://en.wikipedia.org/wiki/SHA-2) to sign its webhooks.

To calculate the expected signature, you should HMAC the `signed_content` from above using the base64 portion of the signing secret (this is the part after the `whsec_` prefix) as the key. For example, given a secret `whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD`, you will want to use `C2FVsBQIhrscChlQIMV+b5sSYspob7oD`.

Here’s an example of how you can calculate the signature:

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();

JavascriptPython

```js
const crypto = require('crypto');
const signedContent = `${webhook_id}.${webhook_timestamp}.${body}`
const secret = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD";
// Base64 decode the secret
const secretBytes = new Buffer(secret.split('_')[1], "base64");
const signature = crypto
  .createHmac('sha256', secretBytes)
  .update(signedContent)
  .digest('base64');
console.log(signature);
```

```python
import hmac
import hashlib
import base64
# Construct the signed content
signed_content = f"{webhook_id}.{webhook_timestamp}.{body}"
secret = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD"
# Get the secret key (remove 'whsec_' prefix)
secret_key = secret.split('_')[1]
secret_bytes = base64.b64decode(secret_key)
# Calculate the HMAC signature
signature = base64.b64encode(
    hmac.new(
        secret_bytes,
        signed_content.encode('utf-8'),
        hashlib.sha256
    ).digest()
).decode('utf-8')
print(signature)
```

This generated signature should match one of the ones sent in the `webhook-signature` header.

The `webhook-signature` header is composed of a list of space-delimited signatures and their corresponding version identifiers. The signature list is most commonly of length one, though there could be any number of signatures. For example:

```plaintext
v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE= v1,bm9ldHUjKzFob2VudXRob2VodWUzMjRvdWVvdW9ldQo= v2,MzJsNDk4MzI0K2VvdSMjMTEjQEBAQDEyMzMzMzEyMwo=
```

Make sure to remove the version prefix and delimiter (e.g. `v1,`) before verifying the signature.

Please note that to compute the signatures it’s recommended to use a constant-time string comparison method in order to prevent timing attacks.

An example of how to do the signature verification:

JavascriptPython

```js
const expectedSignatures = webhookSignatures.split(' ').map(sig => sig.split(',')[1]);
const isValid = expectedSignatures.some(expectedSignature => expectedSignature === computedSignature);
console.log(isValid);
```

```python
import hmac
# Parse the webhook signatures from the header
expected_signatures = [sig.split(',')[1] for sig in webhook_signatures.split(' ')]
# Use constant-time comparison to prevent timing attacks
def constant_time_compare(val1, val2):
    """
    Returns True if the two strings are equal, False otherwise.
    The time taken is independent of the number of characters that match.
    """
    return hmac.compare_digest(val1, val2)
# Check if any of the provided signatures match our computed signature
is_valid = any(constant_time_compare(expected_sig, computed_signature) for expected_sig in expected_signatures)
print(is_valid)
```

[](#verify-timestamp)Verify timestamp
-------------------------------------

As mentioned above, Replicate also sends the timestamp of the attempt in the `webhook-timestamp` header. You should compare the timestamp against your system timestamp and make sure it’s within your tolerance in order to prevent replay attacks.

JavascriptPython

```js
// Example of timestamp validation (5 minute tolerance)
const MAX_DIFF_IN_SECONDS = 5 * 60; // 5 minutes
const timestamp = parseInt(webhook_timestamp);
const now = Math.floor(Date.now() / 1000);
const diff = Math.abs(now - timestamp);
if (diff > MAX_DIFF_IN_SECONDS) {
  console.error(`Webhook timestamp is too old: ${diff} seconds`);
  return false;
}
```

```python
import time
# Example of timestamp validation (5 minute tolerance)
MAX_DIFF_IN_SECONDS = 5 * 60  # 5 minutes
timestamp = int(webhook_timestamp)
now = int(time.time())
diff = abs(now - timestamp)
if diff > MAX_DIFF_IN_SECONDS:
    print(f"Webhook timestamp is too old: {diff} seconds")
    is_valid = False
```

[](#complete-verification-example)Complete verification example
---------------------------------------------------------------

JavascriptPythonHTTP

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();
// Your webhook secret from Replicate
const WEBHOOK_SECRET = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD";
// Maximum age of webhook to accept (5 minutes)
const MAX_DIFF_IN_SECONDS = 5 * 60;
app.use(express.raw({ type: '*/*' }));
app.post('/replicate-webhook', (req, res) => {
    try {
        // Get webhook headers
        const webhookId = req.headers['webhook-id'];
        const webhookTimestamp = req.headers['webhook-timestamp'];
        const webhookSignatures = req.headers['webhook-signature'];
        // Validate required headers
        if (!webhookId || !webhookTimestamp || !webhookSignatures) {
            return res.status(400).json({ error: "Missing required headers" });
        }
        // Validate timestamp
        const timestamp = parseInt(webhookTimestamp);
        const now = Math.floor(Date.now() / 1000);
        const diff = Math.abs(now - timestamp);
        if (diff > MAX_DIFF_IN_SECONDS) {
            return res.status(400).json({
                error: `Webhook timestamp is too old: ${diff} seconds`
            });
        }
        // Get raw request body as string
        const body = req.body.toString();
        // Construct the signed content
        const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;
        // Get the secret key (remove 'whsec_' prefix)
        const secretKey = WEBHOOK_SECRET.split('_')[1];
        const secretBytes = Buffer.from(secretKey, 'base64');
        // Calculate the HMAC signature
        const computedSignature = crypto
            .createHmac('sha256', secretBytes)
            .update(signedContent)
            .digest('base64');
        // Parse the webhook signatures
        const expectedSignatures = webhookSignatures
            .split(' ')
            .map(sig => sig.split(',')[1]);
        // Use constant-time comparison to prevent timing attacks
        const isValid = expectedSignatures.some(expectedSig => 
            crypto.timingSafeEqual(
                Buffer.from(expectedSig),
                Buffer.from(computedSignature)
            )
        );
        if (!isValid) {
            return res.status(403).json({ error: "Invalid webhook signature" });
        }
        // Parse and process the webhook
        const prediction = JSON.parse(body);
        console.log(`Processing webhook for prediction: ${prediction.id}`);
        res.status(200).send();
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(400).json({ error: error.message });
    }
});
app.listen(3000, () => {
    console.log('Webhook server listening on port 3000');
});
```

```python
import hmac
import hashlib
import base64
import time
from flask import Flask, request, jsonify
app = Flask(__name__)
# Your webhook secret from Replicate
WEBHOOK_SECRET = "whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD"
# Maximum age of webhook to accept (5 minutes)
MAX_DIFF_IN_SECONDS = 5 * 60
@app.route('/replicate-webhook', methods=['POST'])
def replicate_webhook():
    # Get webhook headers
    webhook_id = request.headers.get('webhook-id')
    webhook_timestamp = request.headers.get('webhook-timestamp')
    webhook_signatures = request.headers.get('webhook-signature')
    
    # Validate required headers
    if not all([webhook_id, webhook_timestamp, webhook_signatures]):
        return jsonify({"error": "Missing required headers"}), 400
        
    try:
        # Validate timestamp
        timestamp = int(webhook_timestamp)
        now = int(time.time())
        diff = abs(now - timestamp)
        
        if diff > MAX_DIFF_IN_SECONDS:
            return jsonify({"error": f"Webhook timestamp is too old: {diff} seconds"}), 400
        
        # Get request body as raw string
        body = request.data.decode('utf-8')
        
        # Construct the signed content
        signed_content = f"{webhook_id}.{webhook_timestamp}.{body}"
        
        # Get the secret key (remove 'whsec_' prefix)
        secret_key = WEBHOOK_SECRET.split('_')[1]
        secret_bytes = secret_key.encode('utf-8')
        
        # Calculate the HMAC signature
        computed_signature = base64.b64encode(
            hmac.new(
                secret_bytes,
                signed_content.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')
        
        # Parse the webhook signatures
        expected_signatures = [sig.split(',')[1] for sig in webhook_signatures.split(' ')]
        
        # Use constant-time comparison to prevent timing attacks
        is_valid = any(hmac.compare_digest(expected_sig, computed_signature) 
                      for expected_sig in expected_signatures)
        
        if not is_valid:
            return jsonify({"error": "Invalid webhook signature"}), 403
            
        # Get prediction data
        prediction = request.json
        if not prediction:
            return jsonify({"error": "Missing request body"}), 400
            
        # Process the webhook
        print(f"Processing webhook for prediction: {prediction['id']}")
        
        return "", 200
        
    except ValueError:
        return jsonify({"error": "Invalid timestamp format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400
if __name__ == "__main__":
    app.run(port=5000)
```

```bash
# Example for testing your webhook endpoint with cURL
# Your webhook details
WEBHOOK_ID="test-webhook-123"
TIMESTAMP=$(date +%s)
PAYLOAD='{"id":"test-prediction-456","status":"succeeded"}'
# Your webhook secret (from Replicate)
SECRET="whsec_C2FVsBQIhrscChlQIMV+b5sSYspob7oD"
SECRET_KEY="${SECRET#whsec_}"
# Create the signed content
SIGNED_CONTENT="${WEBHOOK_ID}.${TIMESTAMP}.${PAYLOAD}"
# Generate the signature
# Note: This requires base64 and OpenSSL
SIGNATURE=$(echo -n "$SIGNED_CONTENT" | openssl dgst -sha256 -hmac "$SECRET_KEY" -binary | base64)
# Send the webhook request
curl -X POST "http://localhost:3000/replicate-webhook" \
  -H "Content-Type: application/json" \
  -H "webhook-id: $WEBHOOK_ID" \
  -H "webhook-timestamp: $TIMESTAMP" \
  -H "webhook-signature: v1,$SIGNATURE" \
  -d "$PAYLOAD" \
  -v
```

--- END OF verify-webhook.md ---

