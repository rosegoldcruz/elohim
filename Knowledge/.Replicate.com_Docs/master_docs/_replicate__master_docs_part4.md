
# FILE: hardware.md

Whether your model is [public or private](/docs/topics/models/private-models), or running as a [deployment](/docs/topics/deployments), you can change the hardware it runs on.

To compare hardware pricing and performance, see the [pricing page](https://replicate.com/pricing).

[](#edit-model-hardware-on-the-web)Edit model hardware on the web
-----------------------------------------------------------------

To change the hardware for a public or private model on the web, do the following:

1.  Go to your model page
2.  Click the **Settings** tab
3.  Scroll down to the **Hardware** section and chooose your desired hardware
4.  Click the **Save** button

[](#edit-model-hardware-using-the-api)Edit model hardware using the API
-----------------------------------------------------------------------

There is not currently an API to change the hardware for public or private models.

If this feature is important to you, please let us know by contacting [support@replicate.com](mailto:support@replicate.com).

[](#edit-deployment-hardware-on-the-web)Edit deployment hardware on the web
---------------------------------------------------------------------------

If you’re running a [deployment](/docs/topics/deployments), you can change its hardware configuration using the web or the API.

To change the hardware for a deployment on the web, do the following:

1.  Go to [replicate.com/deployments](https://replicate.com/deployments)
2.  Click the deployment you want to edit
3.  Click the **Settings** tab
4.  Choose your desired hardware
5.  Click the **Save** button

[](#edit-deployment-hardware-using-the-api)Edit deployment hardware using the API
---------------------------------------------------------------------------------

To change the hardware for a deployment using the API, use the [Update a deployment](https://replicate.com/docs/reference/http#deployments.update) endpoint:

```bash
curl -s \
  -X PATCH \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"min_instances": 3, "max_instances": 10, "hardware": "gpu-t4"}' \
  https://api.replicate.com/v1/deployments/acme/my-app-image-generator
```

Tip

If your model is public, keep in mind that other people may be using it, and changing the hardware it runs on may affect the performance and price of the model for them. If your public model is very popular, consider leaving it running on the existing hardware and [creating a deployment](/docs/topics/deployments) for your own private use.

[](#hardware-for-fine-tunes)Hardware for fine-tunes
---------------------------------------------------

Fine-tuned models based on SDXL or Flux with [fast booting](https://replicate.com/docs/billing#fast-booting-fine-tunes) use the hardware set by the base model they were trained from.

If you would like to change the hardware for a fine-tuned version with fast booting, you can [make a deployment](https://replicate.com/deployments/create).

--- END OF hardware.md ---


# FILE: private-models.md

When [creating a model on Replicate](/docs/topics/models/create-a-model), you can choose whether to make it public or private.

You can create a private model on your personal account, and it will only be visible to you. You can also create a private model in an [organization](/docs/topics/organizations) to share it with members of your team.

[](#making-a-private-model-public)Making a private model public
---------------------------------------------------------------

You can change a private model to be public in the model’s **Settings** tab. It’s a useful practice to make your new models private at first, test them out, then make them public when you’re ready for others to be able to find and use them.

[](#making-a-public-model-private)Making a public model private
---------------------------------------------------------------

It is possible to make a public model private, but you should be considerate of other users before doing so. If you change your public model to be private, anyone using it will immediately lose access to it. If you’re planning to add private features to an existing model, consider creating a new private model instead and leaving the existing public model public.

--- END OF private-models.md ---


# FILE: models-as-training-destinations.md

Fine-tuning lets you take an existing model and train it with your own data to create a new model that is better suited to a specific task. Whenever you create a new fine-tune, you must specify a `destination` model. This is a model that you create, and it will be updated with the results of your fine-tuning process. The destination model can be a new model, or an existing model that you’ve already fine-tuned.

This guide covers how to create and specify destination models for fine-tuning.

[](#option-1-create-a-model-from-the-train-tab)Option 1: Create a model from the Train tab
------------------------------------------------------------------------------------------

Every trainable model has a “Train” tab with a form that lets you create a new fine-tune of that model. For example, check out the training pages for models like [Flux](https://replicate.com/replicate/fast-flux-trainer) or [LLaVA](https://replicate.com/yorickvp/llava-13b/train):

![Replicate's UI with the Train tab highlighted on the llava-13b model](/_content/assets/train-tab.fzbvZ7uy.png)

The training form asks you to choose a destination model. You can select an existing model as a destination, or create a new model.

[](#option-2-create-a-model-on-the-web)Option 2: Create a model on the web
--------------------------------------------------------------------------

If you want to create a destination model without training it right away, you can create a model manually from the web at [replicate.com/create](https://replicate.com/create).

[](#option-3-create-a-model-with-the-api)Option 3: Create a model with the API
------------------------------------------------------------------------------

You can use the [HTTP API](https://replicate.com/docs/reference/http#models.create) to create a new model programmatically whenever you need a new destination for a training.

Here’s an example using cURL:

```shell
curl -s -X POST \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -d '{"owner": "alice" "name": "my-model", "description": "An example model", "visibility": "public", "hardware": "cpu"}' \
  https://api.replicate.com/v1/models
```

You can also use Replicate’s [JavaScript](https://github.com/replicate/replicate-javascript#replicatemodelscreate) and [Python](https://github.com/replicate/replicate-python?tab=readme-ov-file#create-a-model) clients to create models with the API.

[](#option-4-using-an-existing-model)Option 4: Using an existing model
----------------------------------------------------------------------

You don’t have to create a new model every time you fine-tune. You can instead use the same destination model multiple times, and the resulting fine-tunes will be added to the destination model as different “versions”. You can think of the destination model as a collection of fine-tunes, in the form of model versions.

You only need to create the destination model once. When a new training is created, the resulting fine-tune is automatically pushed as a new version to the destination model.

--- END OF models-as-training-destinations.md ---


# FILE: delete-a-model.md

This guide covers how to delete a model you’ve created, as well as how to delete [model versions](/docs/topics/models/versions).

[](#delete-a-model)Delete a model
---------------------------------

You can delete a model directly from the web on the model settings page or programmatically using the `models.delete` HTTP API.

There are some restrictions on which models you can delete:

*   You can only delete models you own.
*   You can only delete private models.
*   You can only delete models that have no versions associated with them. You’ll need to [delete any versions first](/docs/topics/models/delete-a-model#delete-a-model-version) before deleting the model.

### [](#delete-a-model-on-the-web)Delete a model on the web

Go to your model page, navigate to **Settings**, then select **Delete model**.

### [](#delete-a-model-via-api)Delete a model via API

Use the [`models.delete` endpoint](https://replicate.com/docs/reference/http#delete-a-model):

```http
DELETE https://api.replicate.com/v1/models/{model_owner}/{model_name}
```

Here’s an example cURL request:

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world
```

Note

Currently, the JavaScript and Python client libraries do not offer a way to delete models (only the HTTP API does).

[](#delete-a-model-version)Delete a model version
-------------------------------------------------

You can delete model versions on the web from the UI on the version page, or via the API using the `versions.delete` endpoint.

The following restrictions apply to deleting versions:

*   You can only delete versions from models you own.
*   You can only delete versions from private models.
*   You cannot delete a version if someone other than you has run predictions with it.
*   You cannot delete a version if it is being used as the base model for a fine tune.
*   You cannot delete a version if it has an associated [deployment](/docs/topics/deployments).

### [](#delete-a-model-version-on-the-web)Delete a model version on the web

Go to your model page, navigate to the **Versions** tab, select a version, then select **Delete**.

### [](#delete-a-model-version-via-api)Delete a model version via API

Use the [`versions.delete` endpoint](https://replicate.com/docs/reference/http#delete-a-model-version):

```http
DELETE https://api.replicate.com/v1/models/{model_owner}/{model_name}/versions/{version_id}
```

Here’s an example cURL request:

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/versions/v1
```

Note

Currently, the JavaScript and Python client libraries do not offer a way to delete model versions (only the HTTP API does).

--- END OF delete-a-model.md ---


# FILE: predictions.md

Whenever you [run a model](/docs/topics/models/run-a-model), you’re creating a prediction.

A prediction is an object that represents a single result from running a model, including the inputs that you provided, the outputs that the model returned, as well as [other metadata](https://replicate.com/docs/reference/http#get-a-prediction) like the model version, the user who created it, the status of the prediction, and timestamps.

Here’s an example of a prediction object:

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
    "cancel": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu/cancel",
    "get": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu"
  }
}
```

In the example above, the prediction is generated from running a simple model called [replicate/hello-world](https://replicate.com/replicate/hello-world) that takes a single string input and returns a single string as output.

The prediction object includes the following fields:

*   `id` is a unique identifier for the prediction.
*   `input` is the input that you provided to the model.
*   `output` is the output that the model returned.
*   `status` is the status of the prediction. See [prediction lifecycle](/docs/topics/predictions/lifecycle) for more details.
*   `metrics` includes metrics for the prediction, like the time it took to run.

--- END OF predictions.md ---


# FILE: create-a-prediction.md

Replicate’s API has three different endpoints for creating [predictions](/docs/topics/predictions) depending on the type of model you want to run:

*   Community models - [`predictions.create`](/docs/reference/http#predictions.create)
*   Official models - [`models.predictions.create`](https://replicate.com/docs/reference/http#models.predictions.create)
*   Deployments - [`deployments.predictions.create`](https://replicate.com/docs/reference/http#deployments.predictions.create)

There are two modes for creating predictions with the API: synchronous (sync) and asynchronous (async).

Here’s a brief summary of their differences and use cases:

**Sync mode:**

*   Optimized for quick responses.
*   Returns prediction output directly in the response.
*   Ideal for real-time applications or when immediate results are needed.
*   Best for shorter, faster computations.

**Async mode (default):**

*   Suited for longer-running tasks.
*   Returns immediately with a prediction ID.
*   Allows checking status and retrieving results later.
*   Better for background processing and handling more time-consuming predictions.

Choose sync for speed and simplicity, or async for flexibility and managing more time-consuming predictions.

[](#sync-mode)Sync mode
-----------------------

Sync mode is optimized to return model output as quickly as possible, and is suited for real-time applications or when immediate results are needed. Sync mode is best for models that take just a few seconds to run.

Synchronous predictions hold the request open for a specified duration, which defaults to 60 seconds. If the model finishes running within this time, the response contains the prediction object with the `output` field populated.

Enable sync mode by setting the `Prefer: wait` HTTP header in your API request.

Tip

The examples on this page are written in cURL, but you can also create predictions using Replicate’s [JavaScript](https://github.com/replicate/replicate-javascript#replicatemodelscreate) and [Python](https://github.com/replicate/replicate-python) clients.

Example cURL request:

```bash
curl -s -X POST \
  -H 'Prefer: wait' \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa", "input": {"text": "Alice"}}' \
  https://api.replicate.com/v1/predictions
```

The response will be the prediction object, with the `output` field populated with model results and the status usually in a terminal state:

```json
{
  "id": "gm3qorzdhgbfurvjtvhg6dckhu",
  "model": "replicate/hello-world",
  "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "input": {
    "text": "Alice"
  },
  "output": "Hello Alice",
  "logs": "",
  "error": null,
  "status": "successful",
  "created_at": "2023-09-08T16:19:34.765994657Z",
  "completed_at": "2023-09-08T16:20:34.765994657Z",
  "urls": {
    "cancel": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu/cancel",
    "get": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu"
  }
}
```

### [](#timeout-duration)Timeout duration

The default duration for sync mode is 60 seconds, but you can specify a different timeout duration in the header if needed. For example, `Prefer: wait=5` will wait for 5 seconds.

If the model doesn’t finish within the specified duration, the request will return the incomplete prediction object with status set to `starting` or `processing`. You can then fetch the prediction again via the URL provided in the `Location` header, or the `urls.get` field as with [Async mode](#async-mode-default).

### [](#file-outputs-with-sync-mode)File outputs with sync mode

For models that produce files as output, Replicate will respond with the files as soon as they are all available. In this instance, the `output` field will contain all file outputs but `status` may still be in a `processing` state and `completed_at` and `metrics` may not yet be populated.

Note

If you prefer not to use the blocking API, you can opt for the polling mode. This allows you to handle predictions asynchronously and can be useful if you want to avoid holding a connection open. To use polling mode, pass the appropriate argument to the `run()` method in your language of choice. For more details, see the [Output files documentation](/docs/topics/predictions/output-files).

[](#async-mode-default)Async mode (default)
-------------------------------------------

Async mode is ideal for cases where you don’t need the output immediately, or when the output is large and you want to avoid blocking the request.

To use async mode, you don’t need to set any special headers or parameters. The default behavior of the API is to use async mode.

Async mode returns immediately with a prediction ID and an incomplete prediction object.

Here’s an example async request using [webhooks](/docs/topics/webhooks) to get the prediction results later:

Example request body:

```json
{
  "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "input": { "text": "Alice" },
  "webhook": "https://my.server.com/webhooks/replicate",
  "webhook_events_filter": ["completed"]
}
```

Example cURL request:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa", "input": {"text": "Alice"}, "webhook": "https://my.server.com/webhooks/replicate", "webhook_events_filter": ["completed"]}' \
  https://api.replicate.com/v1/predictions

```

The response will contain a prediction in the starting state:

```json
{
  "id": "gm3qorzdhgbfurvjtvhg6dckhu",
  "model": "replicate/hello-world",
  "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "input": {
    "text": "Alice"
  },
  "output": null,
  "logs": "",
  "error": null,
  "status": "starting",
  "created_at": "2023-09-08T16:19:34.765994657Z",
  "urls": {
    "cancel": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu/cancel",
    "get": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu"
  },
  "webhook": "<https://my.server.com/webhooks/replicate>",
  "webhook_events_filter": ["completed"]
}
```

When the prediction has completed the webhook URL provided will be called with the final prediction data:

```json
{
  "id": "gm3qorzdhgbfurvjtvhg6dckhu",
  "model": "replicate/hello-world",
  "version": "5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
  "input": {
    "text": "Alice"
  },
  "output": "Hello Alice",
  "logs": "",
  "error": null,
  "status": "successful",
  "created_at": "2023-09-08T16:19:34.765994657Z",
  "completed_at": "2023-09-08T16:20:34.765994657Z",
  "urls": {
    "cancel": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu/cancel",
    "get": "https://api.replicate.com/v1/predictions/gm3qorzdhgbfurvjtvhg6dckhu"
  },
  "metrics": {
    "predict_time": 0.582630675
  }
}
```

### [](#polling)Polling

An alternative to using webhooks is polling. Polling involves making repeated API requests to fetch the prediction, until the prediction is in a terminal state (`succeeded` or `failed`). This method is useful if you’re not able to provide a webhook handler.

To poll for updates, you can periodically send GET requests to the prediction URL. The prediction URL is provided in the `urls.get` field of the initial prediction response, as well as in the `Location` header.

Here’s a basic example of how polling might work:

1.  Create a prediction and get the prediction URL.
2.  Send a GET request to the prediction URL.
3.  If the prediction is not complete (status is not “succeeded” or “failed”), wait for a short interval (e.g., 1-2 seconds).
4.  Repeat steps 2-3 until the prediction is complete.

This approach allows you to check the status of your prediction at regular intervals until it’s finished processing.

Check out the documentation for [`predictions.get`](/docs/reference/http#predictions.get) for more information.

--- END OF create-a-prediction.md ---


# FILE: input-files.md

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

--- END OF input-files.md ---


# FILE: output-files.md

Some models generate files as output, like images, audio, or video. With the release of version 1.0.0 of our client libraries, the way you handle these output files has changed.

[](#fileoutput-objects)FileOutput Objects
-----------------------------------------

When a model generates files, `replicate.run()` now returns `FileOutput` objects instead of URLs. These objects provide direct access to the file data, simplifying your code and speeding up your applications.

Here’s how you can work with `FileOutput` objects:

### [](#python)Python

```python
import replicate
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "A majestic lion"}
)
# If the model returns a single output
with open('output.png', 'wb') as f:
    f.write(output[0].read())
# If the model returns multiple outputs
for idx, file_output in enumerate(output):
    with open(f'output_{idx}.png', 'wb') as f:
        f.write(file_output.read())
# You can also stream the file by using its iterator methods:
for chunk in output:
  print(chunk)
```

### [](#javascript)JavaScript

```javascript
import Replicate from "replicate";
const replicate = new Replicate();
const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    { input: { prompt: "A majestic lion" }}
);
// If the model returns a single output
fs.writeFileSync("output.png", output);
// If the model returns multiple outputs
output.forEach((fileOutput, idx) => {
    fs.writeFileSync(`output_${idx}.png`, fileOutput);
});
```

[](#fileoutput-properties-and-methods)FileOutput Properties and Methods
-----------------------------------------------------------------------

The `FileOutput` type mimics a file-like object available on the platform.

Each Python `FileOutput` object implements `Iterator[bytes]` and `AsyncIterator[bytes]` and provides:

*   `read()`: Returns the binary content of the file
*   `url`: The URL of the underlying data source

Each JavaScript `FileOutput` object is a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) that also provides:

*   `blob()`: Reads the binary content of the file
*   `pipe()`: Stream the file data to a `WriteableStream` instance.
*   `url()`: The URL of the underlying data source

### [](#streaming-responses)Streaming Responses

In Python, `FileOutput` implements `Iterator[bytes]` and `AsyncIterator[bytes]` which means you can pass it to any function that takes one as input:

```python
with open("output.png", "wb") as f:
    for chunk in output:
        f.write(chunk)
# Using asyncio
import aiofiles
async with aiofiles.open('output.png', mode='wb') as f:
    async for chunk in output:
        await f.write(chunk)
```

In JavaScript, `FileOutput` implements `ReadableStream` which means you can pass it to any function that takes one as input (such as `Response` and `fs.writeFile`) to stream large files efficiently:

```javascript
const fileStream = fs.createWriteStream("output.png");
output[0].pipe(fileStream);
```

### [](#working-with-urls)Working with URLs

Sometimes you might want to use the file’s URL directly - for example, when displaying images in a web application or passing the URL to another service. Each `FileOutput` object has a `url` property:

```python
# Get the URL of the first output
url = output[0].url
print(f"File available at: {url}")
``````javascript
// Get the URL of the first output
const url = output[0].url;
// Example: Using the URL in an HTML image
const img = document.createElement('img');
img.src = url;  // Works with both HTTP URLs and data URIs
document.body.appendChild(img);
```

Remember: URLs for files will point to `replicate.delivery` and will expire after one hour.

[](#migrating-from-earlier-versions)Migrating from Earlier Versions
-------------------------------------------------------------------

If you’re updating from a version before 1.0.0:

1.  Replace any code that fetches URLs with direct use of the `FileOutput` object
2.  Use `read()` or `pipe()` to access file data instead of downloading from URLs
3.  Remove any URL handling or Authorization header logic
4.  If you need URLs (e.g., for displaying images), use the `url` property of the `FileOutput` object

[](#opting-out-of-the-blocking-api)Opting Out of the Blocking API
-----------------------------------------------------------------

If you prefer not to use the blocking API, you can opt for the polling mode. This allows you to handle predictions asynchronously and can be useful if you want to avoid holding a connection open. To use polling mode, pass the relevant argument to the `run()` method in your favorite language:

### [](#python-1)Python

```python
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "A majestic lion"},
    wait=False
)
```

### [](#javascript-1)JavaScript

```javascript
const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    { input: { prompt: "A majestic lion" }, wait: { type: "poll" } }
);
```

You can also opt out of `FileOutput` objects entirely by configuring the client when you create it:

```javascript
const replicate = new Replicate({ useFileOutput: false });
```

This will make the client return URLs instead of `FileOutput` objects, which can be useful if you’re migrating from an older version or prefer to handle the files yourself.

[](#data-retention)Data Retention
---------------------------------

For predictions created through the API, output files are automatically deleted after an hour. You must save a copy of any files in the output if you’d like to continue using them. For more details on how to store prediction data, see the [webhooks docs](/docs/topics/webhooks).

For predictions created through the web interface, output files are kept indefinitely, unless you delete them manually.

[](#output-file-domains)Output File Domains
-------------------------------------------

Output files are served by `replicate.delivery` and its subdomains.

If you use an allow list of external domains for your assets, add `replicate.delivery` and `*.replicate.delivery` to it.

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

Remember to update your code to work with `FileOutput` objects if you’re using version 1.0.0 or later of our client libraries.

--- END OF output-files.md ---


# FILE: lifecycle.md

Whenever you run a model, you’re creating a [prediction](/docs/topics/predictions).

Some models run very quickly and can return a result within a few milliseconds. Other models can take longer to run, especially generative models, like the kind that produce [images from text prompts](https://replicate.com/collections/text-to-image).

[](#prediction-statuses)Prediction statuses
-------------------------------------------

Predictions can have any of the following statuses:

*   `starting`: the prediction is starting up. If this status lasts longer than a few seconds, then it’s typically because a new worker is being started to run the prediction. Refer to [cold boots](/docs/topics/models/run-a-model#warm-models).
*   `processing`: the `predict()` method of the model is currently running.
*   `succeeded`: the prediction completed successfully.
*   `failed`: the prediction encountered an error during processing.
*   `canceled`: the prediction was canceled by the user.

[](#timeouts)Timeouts
---------------------

Predictions time out after running for 30 minutes. If you require more than 30 minute timeouts for predictions, [contact us](https://replicate.com/support).

[](#monitoring-predictions)Monitoring predictions
-------------------------------------------------

When you’re logged in, you can view a list of your predictions on the [dashboard](https://replicate.com/dashboard), with summaries of status, run time, etc.

For long-running models, you may want to poll the API or use [webhooks](/docs/topics/webhooks) to check the status of a prediction.

To learn more about how long predictions are stored with Replicate, refer to [Data retention](/docs/topics/predictions/data-retention).

--- END OF lifecycle.md ---


# FILE: share-a-prediction.md

Every [prediction](/docs/topics/predictions) that you create is associated with your user account, and only you can see the predictions that you create.

If you’re using the web interface, then you can click the **Share** button to make the prediction public, so that others can view it:

[

![Share button](/_content/assets/share-button.DxrxAP6J.png)

](https://replicate.com/black-forest-labs/flux-schnell/examples)

--- END OF share-a-prediction.md ---


# FILE: rate-limits.md

We limit the number of API requests that can be made to Replicate:

*   You can [create predictions](/docs/reference/http#create-a-prediction) at 600 requests per minute.
*   All other endpoints you can call at 3000 requests per minute.

If you hit a limit, you will receive a response with status `429` with a body like:

```json
{"detail":"Request was throttled. Expected available in 1 second."}
```

If you want higher limits, [contact us](https://replicate.com/support).

--- END OF rate-limits.md ---

