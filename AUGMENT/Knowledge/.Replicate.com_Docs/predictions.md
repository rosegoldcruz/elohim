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