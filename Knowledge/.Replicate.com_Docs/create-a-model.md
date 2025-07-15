You can create your own model on Replicate, and then either push a custom model to it or use it as a destination for fine-tunes.

You can create a new model on the web or via the API.

[](#create-a-model-on-the-web)Create a model on the web
-------------------------------------------------------

Visit [replicate.com/create](https://replicate.com/create) to choose a name for your model, and specify whether it should be public or private.

*   **Public** - Anyone can run this model and see its source code.
*   **Private** - Only you and collaborators (such as organization members) can see this model.

You must also choose the model hardware. This will affect how the model performs and how much it costs to run. [Take a look at the pricing docs](https://replicate.com/pricing) to see the specifications of the different hardware and how much it costs.

[](#create-a-model-with-the-api)Create a model with the API
-----------------------------------------------------------

There’s also an [API endpoint for creating models](https://replicate.com/docs/reference/http#models.create). You can use it to automate the creation of models, including fine-tunes of other models.

Note that there is a limit of 1,000 models per account. For most purposes, we recommend using a single model and pushing new [versions](/docs/topics/models/versions) of the model as you make changes to it.

Check out the [HTTP API reference](https://replicate.com/docs/reference/http#models.create) for more detailed documentation about the model creation endpoint.

### [](#example-curl-usage)Example cURL usage

Here’s an example that uses cURL to create a model with a given owner, name, visibility, and hardware:

```shell
curl -s -X POST -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -d '{"owner": "my-username", "name": "my-new-model", "visibility": "public", "hardware": "gpu-a40-large"}' \
  https://api.replicate.com/v1/models
```

The response is a JSON object of the created model:

```json
{
  "url": "https://replicate.com/my-username/my-new-model",
  "owner": "my-username",
  "name": "my-new-model",
  "description": null,
  "visibility": "public",
  "github_url": null,
  "paper_url": null,
  "license_url": null,
  "run_count": 0,
  "cover_image_url": null,
  "default_example": null,
  "latest_version": null
}
```

To see all the hardware available for your model to run, consult our [endpoint for listing hardware](/docs/reference/http#hardware.list).

```shell
curl -s -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/hardware
``````json
[
  { "name": "CPU", "sku": "cpu" },
  { "name": "Nvidia T4 GPU", "sku": "gpu-t4" },
  { "name": "Nvidia A40 GPU", "sku": "gpu-a40-small" },
  { "name": "Nvidia A40 (Large) GPU", "sku": "gpu-a40-large" }
]
```

To compare the price and specifications of these hardware types, check out the [pricing page](https://replicate.com/pricing).

Tip

You can also create models using Replicate’s [JavaScript](https://github.com/replicate/replicate-javascript#replicatemodelscreate) and [Python](https://github.com/replicate/replicate-python) clients.

[](#next-push-your-model)Next: push your model
----------------------------------------------

Once you’ve created a model on Replicate, you can [push to it with Cog](/docs/guides/push-a-model) or [use it as a training destination for fine-tunes](/docs/topics/models/models-as-training-destinations).