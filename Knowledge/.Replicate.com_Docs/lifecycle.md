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