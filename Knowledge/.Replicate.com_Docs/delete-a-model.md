This guide covers how to delete a model you’ve created, as well as how to delete [model versions](/docs/topics/models/versions).

[](#delete-a-model)Delete a model
---------------------------------

You can delete a model directly from the web on the model settings page or programmatically using the `models.delete` HTTP API.

There are some restrictions on which models you can delete:

*   You can only delete models you own.
*   You can only delete private models.
*   You can only delete models that have no versions associated with them. You’ll need to [delete any versions first](/docs/topics/models/delete-a-model#delete-a-model-version) before deleting the model.

### [](#delete-a-model-on-the-web)Delete a model on the web

Go to your model page, navigate to **Settings**, then select **Delete model**.

### [](#delete-a-model-via-api)Delete a model via API

Use the [`models.delete` endpoint](https://replicate.com/docs/reference/http#delete-a-model):

```http
DELETE https://api.replicate.com/v1/models/{model_owner}/{model_name}
```

Here’s an example cURL request:

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world
```

Note

Currently, the JavaScript and Python client libraries do not offer a way to delete models (only the HTTP API does).

[](#delete-a-model-version)Delete a model version
-------------------------------------------------

You can delete model versions on the web from the UI on the version page, or via the API using the `versions.delete` endpoint.

The following restrictions apply to deleting versions:

*   You can only delete versions from models you own.
*   You can only delete versions from private models.
*   You cannot delete a version if someone other than you has run predictions with it.
*   You cannot delete a version if it is being used as the base model for a fine tune.
*   You cannot delete a version if it has an associated [deployment](/docs/topics/deployments).

### [](#delete-a-model-version-on-the-web)Delete a model version on the web

Go to your model page, navigate to the **Versions** tab, select a version, then select **Delete**.

### [](#delete-a-model-version-via-api)Delete a model version via API

Use the [`versions.delete` endpoint](https://replicate.com/docs/reference/http#delete-a-model-version):

```http
DELETE https://api.replicate.com/v1/models/{model_owner}/{model_name}/versions/{version_id}
```

Here’s an example cURL request:

```shell
curl -s -X DELETE \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.replicate.com/v1/models/replicate/hello-world/versions/v1
```

Note

Currently, the JavaScript and Python client libraries do not offer a way to delete model versions (only the HTTP API does).