You can delete a deployment you own on the settings page on the web or programmatically via the `deployments.delete` HTTP API.

Note

You can only delete deployments that have been offline and unused for at least 15 minutes.

[](#delete-a-deployment-on-the-web)Delete a deployment on the web
-----------------------------------------------------------------

Go to [Deployments](https://replicate.com/deployments) and select the deployment, navigate to **Settings**, then select **Delete deployment**.

[](#delete-a-deployment-via-api)Delete a deployment via API
-----------------------------------------------------------

Use the [`deployments.delete` endpoint](https://replicate.com/docs/reference/http#delete-a-deployment):

```http
DELETE https://api.replicate.com/v1/deployments/{deployment_id}
```

Here’s an example cURL request:

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.replicate.com/v1/deployments/deployment-id
```

Note

Currently, the JavaScript and Python client libraries do not offer a way to delete deployments (only the HTTP API does).