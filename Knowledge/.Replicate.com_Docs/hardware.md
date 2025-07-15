Whether your model is [public or private](/docs/topics/models/private-models), or running as a [deployment](/docs/topics/deployments), you can change the hardware it runs on.

To compare hardware pricing and performance, see the [pricing page](https://replicate.com/pricing).

[](#edit-model-hardware-on-the-web)Edit model hardware on the web
-----------------------------------------------------------------

To change the hardware for a public or private model on the web, do the following:

1.  Go to your model page
2.  Click the **Settings** tab
3.  Scroll down to the **Hardware** section and chooose your desired hardware
4.  Click the **Save** button

[](#edit-model-hardware-using-the-api)Edit model hardware using the API
-----------------------------------------------------------------------

There is not currently an API to change the hardware for public or private models.

If this feature is important to you, please let us know by contacting [support@replicate.com](mailto:support@replicate.com).

[](#edit-deployment-hardware-on-the-web)Edit deployment hardware on the web
---------------------------------------------------------------------------

If you’re running a [deployment](/docs/topics/deployments), you can change its hardware configuration using the web or the API.

To change the hardware for a deployment on the web, do the following:

1.  Go to [replicate.com/deployments](https://replicate.com/deployments)
2.  Click the deployment you want to edit
3.  Click the **Settings** tab
4.  Choose your desired hardware
5.  Click the **Save** button

[](#edit-deployment-hardware-using-the-api)Edit deployment hardware using the API
---------------------------------------------------------------------------------

To change the hardware for a deployment using the API, use the [Update a deployment](https://replicate.com/docs/reference/http#deployments.update) endpoint:

```bash
curl -s \
  -X PATCH \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"min_instances": 3, "max_instances": 10, "hardware": "gpu-t4"}' \
  https://api.replicate.com/v1/deployments/acme/my-app-image-generator
```

Tip

If your model is public, keep in mind that other people may be using it, and changing the hardware it runs on may affect the performance and price of the model for them. If your public model is very popular, consider leaving it running on the existing hardware and [creating a deployment](/docs/topics/deployments) for your own private use.

[](#hardware-for-fine-tunes)Hardware for fine-tunes
---------------------------------------------------

Fine-tuned models based on SDXL or Flux with [fast booting](https://replicate.com/docs/billing#fast-booting-fine-tunes) use the hardware set by the base model they were trained from.

If you would like to change the hardware for a fine-tuned version with fast booting, you can [make a deployment](https://replicate.com/deployments/create).