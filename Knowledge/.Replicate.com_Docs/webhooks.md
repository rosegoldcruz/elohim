Webhooks provide real-time updates about your prediction. Specify an endpoint when you [create a prediction](/docs/reference/http#predictions.create), and Replicate will send HTTP POST requests to that URL when the prediction is created, updated, and finished.

Here are some example scenarios where webhooks are useful:

*   **Persisting prediction data and files.** Input and output (including any files) are _automatically deleted after an hour_ for any predictions created through the API. Webhooks give you a way to receive all the metadata for a completed prediction, so you can store it in a database or save the output files to persistent storage before they’re gone.
*   **Sending notifications when long-running predictions finish.** Some predictions like training jobs can take several minutes to run. You can use a webhook handler to send a notification like an email or a Slack message when a prediction completes.
*   **Creating model pipelines**. You can use webhooks to capture the output of one long-running prediction and pipe it into another model as input.

Note: Webhooks are handy, but they’re not strictly necessary to use Replicate, and there are other ways to receive updates. You can also [poll the predictions API](/docs/reference/http#predictions.get) or use [server-sent events (SSEs)](/docs/streaming) to check the status of a prediction over time.

Note

Watch: Learn more about how to use webhooks → [YouTube (14 minutes)](https://youtu.be/ae3c_0sc9Rg).