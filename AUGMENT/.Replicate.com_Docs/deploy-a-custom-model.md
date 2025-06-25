Replicate makes it easy to run [thousands of open-source models](https://replicate.com/explore) in the cloud with just a few lines of code. Using existing public models is a good way to start, but you can also build and deploy your own custom models.

Using custom models and [deployments](https://replicate.com/docs/deployments), you can:

*   build private models with your team or on your own
*   only pay for what you use
*   scale automatically depending on traffic
*   monitor model activity and performance

In this guide you’ll learn to build, deploy, and scale your own custom model on Replicate.

Note

This guide will show you how to build a custom model from scratch using Cog. If you’re looking to create a fine-tuned image generation model using your own training data, check out the [guide to fine-tuning image models](/docs/guides/fine-tune-an-image-model).

[](#what-is-a-custom-model)What is a custom model?
--------------------------------------------------

In the world of machine learning, the word “model” can mean many different things depending on context. It can be the source code, trained weights, architecture, or some combination thereof. At Replicate, when we say “model” we’re referring to a trained, packaged, and published software program that accepts inputs and returns outputs.

Models on Replicate are built with [Cog](https://cog.run/), an open-source tool that lets you package machine learning models in a standard, production-ready container. Using Cog, you can deploy your packaged model to Replicate, or your own infrastructure.

> If you just want to run an existing public model with customized hardware and scaling settings, you may not even need a custom model. Check out [deployments](https://replicate.com/docs/deployments).

[](#step-1-create-a-model)Step 1: Create a model
------------------------------------------------

Click “Create model” in the account menu or go to [replicate.com/create](https://replicate.com/create) to create your new model.

### [](#choose-a-name)Choose a name

Pick a short and memorable name, like `hotdog-detector`. You can use lower case characters and dashes.

### [](#choose-an-owner)Choose an owner

If you’re working with a team, you should **create your model under an organization** so you and your team can share access and billing. To create an organization, click “Join or create organization” from the account menu or go to [replicate.com/organizations/create](https://replicate.com/organizations/create).

If you’re creating a model for your own individual use, you don’t need an organization. Create it under your user account.

### [](#choose-model-visibility)Choose model visibility

Next, choose whether to make your model public or private. There are two important factors to consider here:

*   **Visibility:** Public models can be discovered and used by anyone. Private models can only be seen by the user or organization that owns them.
*   **Cost:** When running public models, you only pay for the time it takes to process your request. When running private models, you also pay for setup and idle time. Take a look at [how billing works on Replicate](https://replicate.com/docs/billing) for a full explanation.

### [](#choose-hardware)Choose hardware

Choose the type of hardware you want your model to run on. This will affect how the model performs and how much it costs to run. [The billing docs](https://replicate.com/docs/billing) show the specifications of the different hardware available and how much each costs.

If your model requires a GPU to run, choose a lower-price GPU model to start, like the **Nvidia T4 GPU**. Later in this guide, you’ll learn how to use [deployments](https://replicate.com/docs/deployments) so you can customize the hardware on the fly.

Once you’ve created your new model, you should see a page that looks something like this:

![new-model-page](https://github.com/replicate/cog/assets/2289/e36e6405-356f-4158-afdd-a61d22e248e6)

> If you prefer to work from the command line, you can use the [Replicate CLI](https://github.com/replicate/cli) to create models, or [create models programmatically using the API](https://replicate.com/changelog/2023-11-06-api-for-creating-models).

[](#step-2-build-your-model)Step 2: Build your model
----------------------------------------------------

Now that you’ve created your model on Replicate, it’s time to actually write the code for it, build it, and push it to Replicate.

You’ll use [Cog](https://cog.run) to build and push your model. Cog is an open-source tool that makes it easy to put a machine learning model in a Docker container.

Follow this guide to learn how to install Cog, write the code for your model, and push it to Replicate:

⚙️ [Guide: Push your own model with Cog](/docs/guides/push-a-model)

Once you’ve pushed your custom model, return to this guide to learn how to run it, deploy it, and scale it.

[](#step-3-run-the-model)Step 3: Run the model
----------------------------------------------

When you push a model to Replicate, we automatically generate an API server for it and deploy it on a big cluster of GPUs. We also generate a web form that you can use to run the model right from your browser.

Click the “Run” tab, fill out the inputs form, and hit “Run”:

![prompt-input](https://github.com/replicate/cog/assets/2289/521a59d8-8a2e-4a5a-853b-fa78341b2ecc)

Once it finishes, you’ll see the outputs on the page. You’ll also see tabs that show code snippets for running the model with those same inputs using different programming languages and tools like Node.js, Python, cURL, etc:

![model-snippet](https://github.com/replicate/cog/assets/2289/e5c3a3b3-3b29-44d1-b62e-7e62d8471b86)

[](#step-4-deploy-and-scale)Step 4: Deploy and scale
----------------------------------------------------

Your newly published model is now up and running in the cloud. [You can run it as-is using the web form and the API as described in the previous step](#step-3-run-the-model), but if you’re planning to use it in production for Something Real™, you should set up a [deployment](https://replicate.com/docs/deployments) for it.

Deployments let you to control the configuration of a model and provide a private, fixed API endpoint.

With deployments you can:

*   Roll out new versions of your model without having to edit your code.
*   Auto-scale your models to handle extra load and scale to zero when they’re not being used.
*   Keep instances always on to avoid cold boots.
*   Customize what hardware your models run on.
*   Monitor whether instances are setting up, idle, or processing predictions.
*   Monitor the predictions that are flowing through your model.

To create a deployment, go to your model page and click the “Deploy” button.

You’ll see a form that lets you choose a name for your deployment, as well as the hardware it runs on and the minimum and maximum number of instances to run. You can change the hardware type and number of instances to see a live-updating estimate of the cost on the right-hand side of the page.

Once you’re sasified with your choices, click “Create a deployment”.

![deployment-form](https://github.com/replicate/cog/assets/2289/8fd72cc5-0a8b-4e7b-b7f3-3b23aabff96f)

> **Keep your model warm.** If you’re giving a demo or putting your model in the hands of users, you’ll want it to respond quickly, without a [cold boot](/docs/topics/models/run-a-model#warm-models). Set the minimum number of instances to 1 to make sure that at least one instance is always running. You can reduce this to 0 later if you don’t need the model to be instantaneously responsive to new requests.

After creating the deployment, you’ll see new example code for how to run your model using your deployment. Note that this client library code is slightly different from the API call you made earlier. It’s a different method and references the deployment (`you/your-deployment`) rather than the model itself (`you/your-model`):

![deployment-snippet](https://github.com/replicate/cog/assets/2289/d2adde0e-4281-4a0d-914c-73fef5a42ec3)

Once your deployment starts receiving traffic, you can view its recent activity and performance metrics:

![deployment-metrics](https://github.com/replicate/cog/assets/2289/214e1a90-62f5-4577-a556-3736c340a4c1)

[](#step-5-iterate-on-your-model)Step 5: Iterate on your model
--------------------------------------------------------------

At this point you’ve created a working model with a single version. Maybe it’s already perfect at this point, but in all likelihood you’ll want to make some improvements to it.

Just like normal software, machine learning models change and improve over time, and those changes are released as new versions. Whenever you retrain a model with new data, fix a bug in the source code, or update a dependency, those changes can influence the behavior of the model. As you make these changes, you’ll **publish them as new versions**, so you can use those improvements without disrupting the experience for existing uses of the model. Versioning is essential to making machine learning reproducible; it helps guarantee that a model will behave consistently regardless of when or where it’s being run.

If you built your model using Cog, you can release new versions of your model by running `cog push`. [You can integrate this into your existing software development release process on GitHub using a GitHub Actions workflow.](https://github.com/replicate/setup-cog)

If you trained an existing model on your data using Replicate’s [training API](https://replicate.com/docs/reference/http#trainings.create), you can release new versions by running the training API again with new training data, or against a newer version of the base model.

Once you’ve updated your model and confirmed it behaves how you expected, **don’t forget to update your deployment** to use the new version you’ve just published.

[](#next-steps)Next steps
-------------------------

Now that you’ve built and deployed your own custom model, it’s time to start using it in your app or product.

*   Learn how to [continuously deploy your model using GitHub Actions](https://github.com/replicate/setup-cog).
*   Check out the [client libraries](/docs/reference/client-libraries) you can use to run your model.
*   Check out the [deployments guide](https://replicate.com/docs/deployments) to learn more about model performance and scaling.