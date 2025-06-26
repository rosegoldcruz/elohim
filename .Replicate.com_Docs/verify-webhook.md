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