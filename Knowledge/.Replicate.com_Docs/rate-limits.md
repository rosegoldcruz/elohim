We limit the number of API requests that can be made to Replicate:

*   You can [create predictions](/docs/reference/http#create-a-prediction) at 600 requests per minute.
*   All other endpoints you can call at 3000 requests per minute.

If you hit a limit, you will receive a response with status `429` with a body like:

```json
{"detail":"Request was throttled. Expected available in 1 second."}
```

If you want higher limits, [contact us](https://replicate.com/support).