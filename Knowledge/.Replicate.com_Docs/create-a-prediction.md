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