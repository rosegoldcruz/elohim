To create a new deployment, go to [replicate.com/deployments](https://replicate.com/deployments) and select **Create a new deployment**. (You can also navigate to any model _version_ on the website and click the **Deploy** button on the top right of the view.)

Here you will be able to give the deployment a name and confirm the model and version that you wish to deploy. You can update the version at any time. Once your deployment is created, you’ll be able to start running predictions against your new model instance.

To further configure the deployment, navigate to the **Settings** tab on the deployment page. Here you can customize the hardware as well as the autoscaling characteristics of the deployment. We also give you an indicator of how much the deployment will cost to operate.

[](#manage-deployments-using-the-api)Manage deployments using the API
---------------------------------------------------------------------

You can also create and manage deployments using the API.

Example cURL request:

```shell
curl -s \
  -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "my-app-image-generator",
        "model": "some-org/some-model",
        "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        "hardware": "gpu-t4",
        "min_instances": 1,
        "max_instances": 5
      }' \
  https://api.replicate.com/v1/deployments
```

The response will be a JSON object describing the deployment:

```json
{
  "owner": "acme",
  "name": "my-app-image-generator",
  "current_release": {
    "number": 1,
    "model": "some-org/some-model",
    "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
    "created_at": "2024-02-15T16:32:57.018467Z",
    "created_by": {
      "type": "organization",
      "username": "acme",
      "name": "Acme Corp, Inc.",
      "github_url": "https://github.com/acme",
    },
    "configuration": {
      "hardware": "gpu-t4",
      "min_instances": 1,
      "max_instances": 5
    }
  }
}
```

See the API docs for more details:

*   [Create a deployment](https://replicate.com/docs/reference/http#deployments.create)
*   [Get a deployment](https://replicate.com/docs/reference/http#deployments.get)
*   [Update a deployment](https://replicate.com/docs/reference/http#deployments.update)
*   [Delete a deployment](https://replicate.com/docs/reference/http#deployments.delete)
*   [List deployments](https://replicate.com/docs/reference/http#deployments.list)
*   [Create a prediction using a deployment](https://replicate.com/docs/reference/http#deployments.predictions.create)