This guide will show you how to set up a simple email notification system for tracking the status of your predictions.

These notifications are especially useful when you want your team to be aware of any failing predictions, or when your workloads are experiencing elevated error rates.

[![Val Town lets you write serverless functions right in the browser.](https://github.com/user-attachments/assets/dfeb11d4-a72c-4449-98e9-fae0e419a35c)](https://www.val.town/v/zeke/replicateWebhookHandler)

Val Town lets you write serverless functions right in the browser.

[](#what-are-webhooks)What are webhooks?
----------------------------------------

Webhooks are a way to notify you when certain events happen.

When you make an API request to Replicate to run a model, you can optionally include a “webhook URL” in the body of the request. This is the URL of a hosted public HTTP endpoint that you control. Replicate will then make an HTTP POST request to that endpoint at various points in the lifecycle of the prediction.

If webhooks are new to you, read the [webhooks documentation](/docs/topics/webhooks) first.

[](#what-is-val-town)What is Val Town?
--------------------------------------

[Val Town](https://val.town) is a simple but powerful web service that makes it easy to build hosted serverless functions, which are perfect for receiving and processing webhooks.

Val Town lets you write small JavaScript or TypeScript snippets of code directly in the browser and run them on cloud-hosted servers. You can use Val Town to create scheduled functions (like cron jobs), email yourself, and persist small pieces of data.

The spirit of the Val Town product is captured by their old tagline: “If GitHub Gists could run, and AWS Lambda was fun.”

[](#prerequisites)Prerequisites
-------------------------------

*   A [Val Town](https://val.town) account. It’s free to get started.
*   A Replicate account. Also free to get started.
*   Familiarity with [webhooks](/docs/topics/webhooks).
*   [cURL](https://curl.se/). You’ll use this to run a model via Replicate’s API.

[](#step-1-create-a-val-town-project)Step 1: Create a Val Town project
----------------------------------------------------------------------

Much like GitHub repositories, Val Town projects can be forked and modified.

Go to [val.town/v/zeke/replicateWebhookHandler](https://www.val.town/v/zeke/replicateWebhookHandler) and click the “Fork” button.

Alternatively, you can create your own Val from scratch, set the “type” to HTTP, and paste the following code into the editor:

```typescript
import { email } from "https://esm.town/v/std/email";
export default async function(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const jsonBody = await request.json();
    await email({
      to: "zeke@replicate.com",
      subject: "Replicate Webhook Received",
      text: JSON.stringify(jsonBody, null, 2), // Pretty-print the JSON for better readability
      html: `<pre>${JSON.stringify(jsonBody, null, 2)}</pre>`, // HTML version with pre-formatted text
    });
    return new Response("Webhook received and email sent", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 400 });
  }
}
```

Change the `to:` key to your own email address.

The `email()` function is part of Val town’s [standard library](https://www.val.town/u/std), and comes preconfigured. You don’t have to install or configure anything to start sending emails. Note that you can only send emails to yourself if you’re on Val Town Free. If you’re on [Val Town Pro](https://www.val.town/pricing), you can email anyone.

Your new project will have a URL like `https://zeke-replicatewebhookhandler.web.val.run`. This is your webhook URL. Copy it to your clipboard for use in the next step.

[](#step-2-run-a-prediction)Step 2: Run a prediction
----------------------------------------------------

Now that you have a webhook URL, you can use it when you run a model via Replicate’s API.

For this example, we’ll run [zeke/chaos-monkey](https://replicate.com/zeke/chaos-monkey), a tiny test model which can be used to test success and failure modes.

Here is an example API request using cURL. Change the `webhook` URL to your own webhook URL, then run it:

```sh
curl -s -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: wait" \
  -d $'{
    "version": "0098011f5f482d1fcdbbba44ef1d6d22858e439a103b6ebb449ef9dec623a71e",
    "input": {
      "sleep": 0,
      "outcome": "success"
    },
    "webhook": "https://zeke-replicatewebhookhandler.web.val.run",
    "webhook_events_filter": ["completed"]
  }' \
  https://api.replicate.com/v1/predictions
```

Replicate will make an HTTP POST request to your webhook URL when the prediction finishes.

[](#step-3-receive-notifications)Step 3: Receive notifications
--------------------------------------------------------------

Val town keeps logs of the incoming requests for each project. Click the **Requests** tab on your project to see a log of the incoming requests:

![requests tab](https://github.com/user-attachments/assets/bcc811f3-a1c2-40a7-b6a7-ca43e615f788)

You should also have an email awaiting you in your inbox.

Go check your email!

[](#next-steps)Next steps
-------------------------

Now that you’ve got a basic setup for receiving webhooks, you can use it to build more complex systems. Here are some ideas:

*   Validate the incoming webhook. The code above accepts the incoming webhook with verifying its authenticity. For real-world applications, you should validate the webhook to ensure it’s from Replicate and not malicious. See [verifying webhooks](/docs/topics/webhooks/verify-webhook) for more information.
*   Use a more robust notification system. The example above uses email which is great for getting started, but you could also send notifications to Slack, SMS, PagerDuty, or other services.
*   Use state to track recent predictions. Val town’s standard library has a built-in [blob storage system](https://www.val.town/v/std/blob) that you can use to store JSON data (as well as text, images, and other file types). Just like Val town’s email function, blob storage is preconfigured and ready to use. You could extend the example above to store recent predictions in a blob, and then notify yourself or your team when error rates exceed a certain threshold.