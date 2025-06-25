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