In the world of machine learning, the word “model” can mean many different things depending on context. It can be the source code, the trained weights, the architecture, or some combination thereof. At Replicate, when we say “model” we’re generally referring to a trained, packaged, and published software program that accepts inputs and returns outputs.

[](#which-models-can-you-run)Which models can you run?
------------------------------------------------------

You can [use the API or the web interface](/docs/topics/models/run-a-model) to run any public model on Replicate from your own code. It can be an open-source model created by someone else, like [meta/meta-llama-3.1-405b-instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct) or [black-forest-labs/flux-schnell](https://replicate.com/black-forest-labs/flux-schnell), or you can publish and run your own models.

Refer to [Run a model](/docs/topics/models/run-a-model) to learn more.

[](#finding-models)Finding models
---------------------------------

You can find models to run by [exploring popular and featured models](https://replicate.com/explore) or [searching for something specific](https://replicate.com/search?query=flux).

The search returns models that meet the following criteria:

*   The model is public.
*   The model has at least one published version.
*   The model has at least one example prediction. To add an example, create a prediction using the web interface then click the **Add to examples** button below the prediction output.

If you’re pushing your own models and want others to be able to discover them, make sure they meet the above criteria.

### [](#collections)Collections

You can also find models by exploring [collections](https://replicate.com/explore#collections).

Model collections are oriented around tasks, like upscaling images, generating embeddings, or getting structured data from language models. This makes it easier to find the right models for the problems you’re trying to solve.

Each collection also includes a more detailed summary of the kinds of tasks you can perform with models in that collection. For example, [vision models](https://replicate.com/collections/vision-models) can be used for all sorts of tasks like captioning images, answering questions about images, or detecting objects.

You can find [all collections here](https://replicate.com/explore#collections).

[](#push-your-own-models)Push your own models
---------------------------------------------

In addition to running other people’s models, you can push your own models to Replicate. You can make your model public so that other people can run it, or you can make it private so that only you can run it.

To learn more, refer to [Push a model to Replicate](/docs/guides/push-a-model).