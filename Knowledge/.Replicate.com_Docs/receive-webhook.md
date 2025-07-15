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