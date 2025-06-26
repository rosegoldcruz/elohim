
# FILE: push-a-diffusers-model.md

Learn how to push a [Diffusers](https://huggingface.co/docs/diffusers) image generation model to Replicate as a scalable API.

[](#intro)Intro
---------------

[Diffusers](https://huggingface.co/docs/diffusers) is an open-source Python library that provides a consistent interface for using diffusion models for image generation, the most popular of which is Stable Diffusion.

There are lots of ways to use Stable Diffusion: You can [run it from your browser](https://replicate.com/stability-ai/stable-diffusion) on Replicate’s website, or [run it from your code](https://replicate.com/stability-ai/stable-diffusion/api) using Replicate’s API. You can even [run it on your own machine](https://replicate.com/blog/run-stable-diffusion-on-m1-mac).

But what if you want to customize the model? There are a lot of things you might want to change:

*   **Use custom/pretrained weights or styles.** There are lots of variants of Stable Diffusion trained on different styles of images, like [OpenJourney](https://huggingface.co/prompthero/openjourney-v2), [Analog Diffusion](https://huggingface.co/wavymulder/Analog-Diffusion), and [Realistic Vision](https://huggingface.co/SG161222/Realistic_Vision_V1.4).
*   **Use a different image format.** Stable Diffusion returns an uncompressed PNG by default, but you might want to also return a compressed JPEG or WebP image.
*   **Generate a batch of outputs.** You could update the prompt input to accept a delimited string of multiple values and generate a batch of 200 images at once to reduce API call overhead.
*   **Remove some inputs you don’t care about.** Many machine learning models have a lot of inputs, but you might only care about a few of them. You could remove the ones you don’t care about, and make the model easier to use. For an example of this, see [lora-training](https://replicate.com/cloneofsimo/lora-training) and [lora-advanced-training](https://replicate.com/cloneofsimo/lora-advanced-training).
*   **Change the scheduler.** Schedulers give you a way to configure a speed-vs-quality tradeoff in your model.

In this guide we’ll walk you through the steps to create your own model, so you can make these kinds of changes and push them to Replicate as your own public or private model with a stable API.

[](#prerequisites)Prerequisites
-------------------------------

To follow this guide, you’ll need:

*   **An account on Replicate.**
*   **Docker.** You’ll be using the Cog command-line tool to build and push your model. Cog uses Docker to create a container for your model. You’ll need to [install and start Docker](https://docs.docker.com/get-docker/) before you can run Cog. You can confirm Docker is running by typing `docker info` in your terminal.

[](#step-1-create-a-model)Step 1: Create a model
------------------------------------------------

First, create a model on Replicate at [replicate.com/create](https://replicate.com/create?purpose=fine-tune-image). If you haven’t used Replicate before, you’ll need to sign in with your GitHub account. You can configure the model to be private so that only you can use it, or public so anyone can use it.

[![](https://user-images.githubusercontent.com/2289/222594676-ecb72c3e-1fb4-4ed5-b368-1a82afc46f3b.png)](https://replicate.com/create?purpose=fine-tune-image)

[](#step-2-clone-the-stable-diffusion-repo)Step 2: Clone the Stable Diffusion repo
----------------------------------------------------------------------------------

Replicate maintains an open-source Stable Diffusion repo on GitHub at [replicate/cog-stable-diffusion](https://github.com/replicate/cog-stable-diffusion).

Create your own fork of the repo on GitHub, or clone the repo directly:

```shell
git clone https://github.com/replicate/cog-stable-diffusion
cd cog-stable-diffusion
```

This repo is fairly small, and contains two noteworthy files:

*   `cog.yaml` - Defines the CUDA and Python versions, and dependencies for the model. This file tells Cog how to package the model.
*   `predict.py` - Defines the inputs and outputs of the model, and the code to run the model. The Stable Diffusion model itself is imported through the Python [`diffusers`](https://pypi.org/project/diffusers/) library.

[](#step-3-install-cog)Step 3: Install Cog
------------------------------------------

[Cog](https://cog.run) is an open source tool that makes it easy to put a machine learning model in a Docker container. Run the following commands to install it and set the correct permissions:

```shell
curl https://replicate.github.io/codespaces/scripts/install-cog.sh | bash
```

Confirm that Cog is installed by running `cog --version`:

```shell
cog --version
# cog version 0.9.25 (built 2024-10-07T15:11:47Z)
```

[](#step-4-customize-your-model)Step 4: Customize your model
------------------------------------------------------------

The repo you cloned is configured to build Stable Diffusion 2.1 by default, but you can customize it to use any [diffusers-compatible model](https://huggingface.co/models?library=fine-tune-image), including trained models like [OpenJourney](https://huggingface.co/prompthero/openjourney-v2), [Analog Diffusion](https://huggingface.co/wavymulder/Analog-Diffusion), and [Realistic Vision](https://huggingface.co/SG161222/Realistic_Vision_V1.4).

To use a different model, open `predict.py` and change the value of `MODEL_ID` to a shorthand `{owner}/{repo}` string that corresponds to a diffusers-compatible model on Hugging Face:

```python
MODEL_ID = "wavymulder/Analog-Diffusion"
```

If you just want to use a different pretrained model, this is the only change that’s needed.

If you want to make other changes to your model’s behavior, take a look at [`predict.py`](https://github.com/replicate/cog-stable-diffusion/blob/38510524cf4f3dc679e5945ebb52feb40d52c1a9/predict.py), which is the Python interface that defines the inputs and outputs for your model.

[](#step-5-download-weights)Step 5: Download weights
----------------------------------------------------

Now that you’ve configured your model, it’s time to download the weights:

```shell
cog run script/download-weights
```

This process will take a few minutes but you’ll only need to run it once, as it will cache the downloaded dependencies on disk. Get up and stretch, grab yourself a snack, or use this opportunity to add metadata to the model page you created on Replicate in Step 1 by adding a title, README, GitHub repository URL, etc.

[](#step-6-run-your-model)Step 6: Run your model
------------------------------------------------

Now that you’ve downloaded the weights, you can run the model locally with Cog:

```shell
cog predict -i prompt="monkey scuba diving" -i width=512  -i height=512
```

This will run the model locally and return the output image. You can change the prompt, width, and height to see how the model responds to different inputs. Note that larger dimensions require more VRAM, so 512x512 is a sensible default.

[](#step-7-push-your-model)Step 7: Push your model
--------------------------------------------------

Now that you’ve customized your model, it’s time to push it to Replicate.

First you’ll need to authenticate:

```shell
cog login
```

Then push your model using the name you specified in Step 1:

```shell
cog push r8.im/<your-username>/<your-model-name>
```

[](#step-8-use-your-model)Step 8: Use your model
------------------------------------------------

Your model is now live!

You can run the model from the website by clicking the “Demo” tab on the model page, or you can use the HTTP API to run the model from your own code.

Click the “API” tab on your model page to see example code for running the model:

![](https://user-images.githubusercontent.com/2289/222592355-ec880478-fa5c-470b-bf90-512cd0b1247f.png)

[](#next-steps)Next steps
-------------------------

Now that you have your own model, see what else you can do with it.

If you need inspiration or guidance, jump into our [Discord](https://discord.gg/replicate).

--- END OF push-a-diffusers-model.md ---


# FILE: push-a-transformers-model.md

[Transformers](https://huggingface.co/docs/transformers/index) is an open-source Python library that provides a consistent interface for using language models. The library contains multiple open-source generative language models like FLAN, GPT-J, GPT Neo, LLaMA, BLOOM, and others, which have been pre-trained on large text corpora and can be fine-tuned for specific tasks with relatively small amounts of training data.

Transformers also contains models like Longformer, BERT, and RoBERTa, which are generally used for more traditional natural language processing tasks like classification, named entity recognition, and so on. The process we’re walking through here will work for both kinds of models; in fact, it should work for every model on Transformers.

In this guide we’ll walk you through the process of taking an existing Transformers model and pushing it to Replicate as your own public or private model with a stable API.

[](#prerequisites)Prerequisites
-------------------------------

To follow this guide, you’ll need:

*   **An account on Replicate.**
*   **Docker.** You’ll be using the Cog command-line tool to build and push your model. Cog uses Docker to create a container for your model. You’ll need to [install and start Docker](https://docs.docker.com/get-docker/) before you can run Cog. You can confirm Docker is running by typing `docker info` in your terminal.

[](#step-1-create-a-model)Step 1: Create a model
------------------------------------------------

First, create a model on Replicate at [replicate.com/create](https://replicate.com/create?purpose=fine-tune-language). If you haven’t used Replicate before, you’ll need to sign in with your GitHub account. You can configure the model to be private so that only you can use it, or public so anyone can use it.

[![](https://user-images.githubusercontent.com/2289/222594676-ecb72c3e-1fb4-4ed5-b368-1a82afc46f3b.png)](https://replicate.com/create?purpose=fine-tune-language)

[](#step-2-install-cog)Step 2: Install Cog
------------------------------------------

Cog is an open source tool that makes it easy to put a machine learning model in a Docker container. Run the following commands to install it and set the correct permissions:

```shell
curl https://replicate.github.io/codespaces/scripts/install-cog.sh | bash
```

Confirm that Cog is installed by running `cog --version`:

```shell
cog --version
# cog version 0.9.25 (built 2024-10-07T15:11:47Z)
```

[](#step-3-initialize-your-project)Step 3: Initialize your project
------------------------------------------------------------------

Create a new directory and initialize a new Cog project:

```shell
mkdir my-cool-model
cd my-cool-model
cog init
```

This will create two files, `cog.yaml` and `predict.py`, which you’ll use to configure your dependencies and define the inputs and outputs of your model.

[](#step-4-configure-dependencies)Step 4: Configure dependencies
----------------------------------------------------------------

[The `cog.yaml` file](https://github.com/replicate/cog/blob/main/docs/yaml.md) defines the CUDA and Python versions, and dependencies for the model. This file tells Cog how to package the model.

Replace the contents of the `cog.yaml` file with the following:

```yaml
build:
  gpu: true
  python_version: "3.10"
  python_packages:
    - "torch==1.12.1"
    - "transformers==4.30.0"
    - "sentencepiece==0.1.97"
    - "accelerate==0.16.0"
predict: "predict.py:Predictor"
```

[](#step-5-customize-your-predictor)Step 5: Customize your predictor
--------------------------------------------------------------------

[The `predict.py` file](https://github.com/replicate/cog/blob/main/docs/python.md) defines the inputs and outputs of the model, and the code to run the model. The language model itself is imported through the Python [`transformers`](https://pypi.org/project/transformers/) library.

Replace the contents of the `predict.py` file with the following:

```python
from typing import List, Optional
from cog import BasePredictor, Input
from transformers import T5ForConditionalGeneration, AutoTokenizer
import torch
CACHE_DIR = 'weights'
# Shorthand identifier for a transformers model.
# See https://huggingface.co/models?library=transformers for a list of models.
MODEL_NAME = 'google/flan-t5-xl'
class Predictor(BasePredictor):
    def setup(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME, cache_dir=CACHE_DIR, local_files_only=True)
        self.model.to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, cache_dir=CACHE_DIR, local_files_only=True)
    def predict(
        self,
        prompt: str = Input(description=f"Text prompt to send to the model."),
        n: int = Input(description="Number of output sequences to generate", default=1, ge=1, le=5),
        max_length: int = Input(
            description="Maximum number of tokens to generate. A word is generally 2-3 tokens",
            ge=1,
            default=50
        ),
        temperature: float = Input(
            description="Adjusts randomness of outputs, greater than 1 is random and 0 is deterministic, 0.75 is a good starting value.",
            ge=0.01,
            le=5,
            default=0.75,
        ),
        top_p: float = Input(
            description="When decoding text, samples from the top p percentage of most likely tokens; lower to ignore less likely tokens",
            ge=0.01,
            le=1.0,
            default=1.0
        ),
        repetition_penalty: float = Input(
            description="Penalty for repeated words in generated text; 1 is no penalty, values greater than 1 discourage repetition, less than 1 encourage it.",
            ge=0.01,
            le=5,
            default=1
        )
        ) -> List[str]:
        input = self.tokenizer(prompt, return_tensors="pt").input_ids.to(self.device)
        outputs = self.model.generate(
            input,
            num_return_sequences=n,
            max_length=max_length,
            do_sample=True,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=repetition_penalty
        )
        out = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)
        return out
```

The [AutoTokenizer](https://huggingface.co/docs/transformers/v4.27.2/en/model_doc/auto#transformers.AutoTokenizer.from_pretrained) used above should work for all Transformers models.

If you want to use a Transformers model other than Flan-T5, you’ll need to specify the `model` class to use. For example, if you’re [using a GPT-J model](https://huggingface.co/EleutherAI/gpt-j-6b#how-to-use), you’ll want to use `AutoModelForCausalLM` instead of `T5ForConditionalGeneration`. See the [Transformers docs](https://huggingface.co/docs/transformers/v4.27.2/en/model_doc/auto#transformers.AutoModel.from_pretrained) for more details.

[](#step-6-download-weights)Step 6: Download weights
----------------------------------------------------

Next you’ll create a script that uses the `transformers` library to download pretrained weights.

Create a file for the script:

```shell
mkdir script
touch script/download_weights
chmod +x script/download_weights # makes the file executable
```

Paste the following code into the `script/download_weights` file:

```python
#!/usr/bin/env python
import os
import shutil
from transformers import T5ForConditionalGeneration, T5Tokenizer
CACHE_DIR = 'weights'
if os.path.exists(CACHE_DIR):
    shutil.rmtree(CACHE_DIR)
os.makedirs(CACHE_DIR)
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-xl", cache_dir=CACHE_DIR)
tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-xl", cache_dir=CACHE_DIR)`
```

Run the script to download the weights:

```shell
cog run script/download_weights
```

This process will take a while to run but you’ll only need to run it once, as it will cache the downloaded dependencies on disk. Get up and stretch, grab yourself a snack, or use this opportunity to add metadata to the model page you created on Replicate in Step 1 by adding a title, README, GitHub repository URL, etc.

[](#step-7-run-your-model)Step 7: Run your model
------------------------------------------------

Now that you’ve downloaded the weights, you can run the model locally with Cog:

```shell
cog predict -i prompt="Q: Answer the following yes/no question by reasoning step-by-step. Can a dog drive a car?"
```

This will run the model locally and return output text.

[](#step-8-push-your-model)Step 8: Push your model
--------------------------------------------------

Now that you’ve created your model, it’s time to push it to Replicate.

First you’ll need to authenticate:

```shell
cog login
```

Then push your model using the name you specified in Step 1:

```shell
cog push r8.im/<your-username>/<your-model-name>
```

[](#step-9-use-your-model)Step 9: Use your model
------------------------------------------------

Your model is now live!

You can run the model from the website by clicking the “Demo” tab on the model page, or you can use the HTTP API to run the model from your own code.

Click the “API” tab on your model page to see example code for running the model:

![](https://user-images.githubusercontent.com/2289/231015658-cac5cceb-3d06-4090-884e-ca6db00321e4.png)

[](#next-steps)Next steps
-------------------------

Now that you have your own model, see what else you can do with it!

To see what models you can use, [check out the Transformers docs on Hugging Face](https://huggingface.co/docs/transformers).

If you need inspiration or guidance, jump into our [Discord](https://discord.gg/replicate).

--- END OF push-a-transformers-model.md ---


# FILE: build-a-webhook-notifier-with-val-town.md

This guide will show you how to set up a simple email notification system for tracking the status of your predictions.

These notifications are especially useful when you want your team to be aware of any failing predictions, or when your workloads are experiencing elevated error rates.

[![Val Town lets you write serverless functions right in the browser.](https://github.com/user-attachments/assets/dfeb11d4-a72c-4449-98e9-fae0e419a35c)](https://www.val.town/v/zeke/replicateWebhookHandler)

Val Town lets you write serverless functions right in the browser.

[](#what-are-webhooks)What are webhooks?
----------------------------------------

Webhooks are a way to notify you when certain events happen.

When you make an API request to Replicate to run a model, you can optionally include a “webhook URL” in the body of the request. This is the URL of a hosted public HTTP endpoint that you control. Replicate will then make an HTTP POST request to that endpoint at various points in the lifecycle of the prediction.

If webhooks are new to you, read the [webhooks documentation](/docs/topics/webhooks) first.

[](#what-is-val-town)What is Val Town?
--------------------------------------

[Val Town](https://val.town) is a simple but powerful web service that makes it easy to build hosted serverless functions, which are perfect for receiving and processing webhooks.

Val Town lets you write small JavaScript or TypeScript snippets of code directly in the browser and run them on cloud-hosted servers. You can use Val Town to create scheduled functions (like cron jobs), email yourself, and persist small pieces of data.

The spirit of the Val Town product is captured by their old tagline: “If GitHub Gists could run, and AWS Lambda was fun.”

[](#prerequisites)Prerequisites
-------------------------------

*   A [Val Town](https://val.town) account. It’s free to get started.
*   A Replicate account. Also free to get started.
*   Familiarity with [webhooks](/docs/topics/webhooks).
*   [cURL](https://curl.se/). You’ll use this to run a model via Replicate’s API.

[](#step-1-create-a-val-town-project)Step 1: Create a Val Town project
----------------------------------------------------------------------

Much like GitHub repositories, Val Town projects can be forked and modified.

Go to [val.town/v/zeke/replicateWebhookHandler](https://www.val.town/v/zeke/replicateWebhookHandler) and click the “Fork” button.

Alternatively, you can create your own Val from scratch, set the “type” to HTTP, and paste the following code into the editor:

```typescript
import { email } from "https://esm.town/v/std/email";
export default async function(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const jsonBody = await request.json();
    await email({
      to: "zeke@replicate.com",
      subject: "Replicate Webhook Received",
      text: JSON.stringify(jsonBody, null, 2), // Pretty-print the JSON for better readability
      html: `<pre>${JSON.stringify(jsonBody, null, 2)}</pre>`, // HTML version with pre-formatted text
    });
    return new Response("Webhook received and email sent", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 400 });
  }
}
```

Change the `to:` key to your own email address.

The `email()` function is part of Val town’s [standard library](https://www.val.town/u/std), and comes preconfigured. You don’t have to install or configure anything to start sending emails. Note that you can only send emails to yourself if you’re on Val Town Free. If you’re on [Val Town Pro](https://www.val.town/pricing), you can email anyone.

Your new project will have a URL like `https://zeke-replicatewebhookhandler.web.val.run`. This is your webhook URL. Copy it to your clipboard for use in the next step.

[](#step-2-run-a-prediction)Step 2: Run a prediction
----------------------------------------------------

Now that you have a webhook URL, you can use it when you run a model via Replicate’s API.

For this example, we’ll run [zeke/chaos-monkey](https://replicate.com/zeke/chaos-monkey), a tiny test model which can be used to test success and failure modes.

Here is an example API request using cURL. Change the `webhook` URL to your own webhook URL, then run it:

```sh
curl -s -X POST \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: wait" \
  -d $'{
    "version": "0098011f5f482d1fcdbbba44ef1d6d22858e439a103b6ebb449ef9dec623a71e",
    "input": {
      "sleep": 0,
      "outcome": "success"
    },
    "webhook": "https://zeke-replicatewebhookhandler.web.val.run",
    "webhook_events_filter": ["completed"]
  }' \
  https://api.replicate.com/v1/predictions
```

Replicate will make an HTTP POST request to your webhook URL when the prediction finishes.

[](#step-3-receive-notifications)Step 3: Receive notifications
--------------------------------------------------------------

Val town keeps logs of the incoming requests for each project. Click the **Requests** tab on your project to see a log of the incoming requests:

![requests tab](https://github.com/user-attachments/assets/bcc811f3-a1c2-40a7-b6a7-ca43e615f788)

You should also have an email awaiting you in your inbox.

Go check your email!

[](#next-steps)Next steps
-------------------------

Now that you’ve got a basic setup for receiving webhooks, you can use it to build more complex systems. Here are some ideas:

*   Validate the incoming webhook. The code above accepts the incoming webhook with verifying its authenticity. For real-world applications, you should validate the webhook to ensure it’s from Replicate and not malicious. See [verifying webhooks](/docs/topics/webhooks/verify-webhook) for more information.
*   Use a more robust notification system. The example above uses email which is great for getting started, but you could also send notifications to Slack, SMS, PagerDuty, or other services.
*   Use state to track recent predictions. Val town’s standard library has a built-in [blob storage system](https://www.val.town/v/std/blob) that you can use to store JSON data (as well as text, images, and other file types). Just like Val town’s email function, blob storage is preconfigured and ready to use. You could extend the example above to store recent predictions in a blob, and then notify yourself or your team when error rates exceed a certain threshold.

--- END OF build-a-webhook-notifier-with-val-town.md ---


# FILE: deploy-a-custom-model.md

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

--- END OF deploy-a-custom-model.md ---


# FILE: push-a-model-using-github-actions.md

GitHub Actions let you to automate your software development workflows directly within your GitHub repository.

In this tutorial, you’ll learn how to use GitHub Actions to build and push your model to Replicate, so you don’t have to manually build and push your model. This setup works equally well for both public and private models.

Note

This guide will get you started using GitHub Actions to push your model, but if you’re looking for a more full-featured approach that includes linting, testing, and more, check out the [guide to setting up a CI/CD pipeline for your model](/docs/guides/continuous-model-deployment).

[](#prerequisites)Prerequisites
-------------------------------

*   **An existing Cog model in a GitHub repository.** This tutorial assumes you already have a working Cog model. If you don’t, you can use one from [replicate/cog-examples](https://github.com/replicate/cog-examples) or check out the [guide to pushing a model](/docs/guides/push-a-model).
*   **A Replicate account.** You’ll need a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=github-actions) to push your model to Replicate.

[](#step-1-create-a-workflow-file)Step 1: Create a workflow file
----------------------------------------------------------------

To use GitHub Actions, you define workflows using YAML files stored in the `.github/workflows` directory of your GitHub repository.

Your new workflow will use an open-source GitHub Action called [replicate/setup-cog](https://github.com/replicate/setup-cog) that takes care of installing Docker buildx, Cog, CUDA drivers (optionally), and other setup steps.

Create a new file in the `.github/workflows` directory of your repository, and name it `push.yml`. Then add the following content:

```yml
name: Push to Replicate
on:
  workflow_dispatch:
    inputs:
      model_name:
        description: 'Enter the model name, like "alice/bunny-detector"'
        required: true
jobs:
  push_to_replicate:
    name: Push to Replicate
    runs-on: ubuntu-latest
    steps:
      - name: Free disk pace
        uses: jlumbroso/free-disk-space@v1.3.1
        with:
          tool-cache: false
          docker-images: false
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Cog
        uses: replicate/setup-cog@v2
        with:
          token: ${{ secrets.REPLICATE_CLI_AUTH_TOKEN }}
      - name: Push to Replicate
        run: cog push r8.im/${{ inputs.model_name }}
```

Note

If you’re creating a new model from scratch, you can use the `cog init` command, which will automatically generate a starter workflow for you.

[](#step-2-get-your-replicate-cli-auth-token)Step 2: Get your Replicate CLI auth token
--------------------------------------------------------------------------------------

The [replicate/setup-cog](https://github.com/replicate/setup-cog) action supports automatically authenticating with your Replicate account so you can push models to Replicate. For this to work, you need to provide it with a Replicate CLI auth token.

Go to [replicate.com/auth/token](https://replicate.com/auth/token) and copy the token to your clipboard.

[](#step-3-add-your-replicate-token-as-a-secret)Step 3: Add your Replicate token as a secret
--------------------------------------------------------------------------------------------

Next you’ll add your Replicate API token as a secret to your repository, so it can be safely accessed by your workflow.

Go to your GitHub repository, click “Settings”, click “Secrets”, click “New repository secret”, and add your token as the secret. Name it `REPLICATE_CLI_AUTH_TOKEN` and paste in the token you copied in the previous step.

[](#step-4-commit-and-push-your-changes-to-github)Step 4: Commit and push your changes to GitHub
------------------------------------------------------------------------------------------------

Next you’ll commit and push your changes to GitHub, so you can run the workflow:

```sh
git add .
git commit -am "Add Actions workflow for pushing to Replicate"
git push
```

[](#step-5-trigger-the-workflow-manually)Step 5: Trigger the workflow manually
------------------------------------------------------------------------------

GitHub Actions workflows can be triggered manually, or on a schedule, or in response to events like creating pull requests or pushing to your default branch.

The workflow you added above is configured to be triggered manually (see the `workflow_dispatch` bit). It’s a good idea to start with a manual trigger so you can test out the workflow explicitly, then switch to a more automated process once you’ve got it working as expected.

1.  Go to your repository page on GitHub
2.  Click **Actions**
3.  Click **Push to Replicate**
4.  Enter the name of your Replicate model
5.  Click “Run workflow”

[](#step-6-trigger-the-workflow-automatically-optional)Step 6: Trigger the workflow automatically (optional)
------------------------------------------------------------------------------------------------------------

Once you’ve run the workflow manually and the process is working as expected, you may want to update your workflow to trigger automatically. Here’s how to update the workflow to trigger whenever you push to your default branch:

First, add a [Repository configuration variable](https://docs.github.com/en/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository) to your repository to store the name of your model.

Then update your workflow to run on pushes to your main branch:

```yml
on:
  push:
    branches:
      - main
```

Then update the `cog push` step in your workflow to fall back to the default model name if the input is empty. This will allow you to manually trigger the workflow with a custom model name, or automatically trigger the workflow with the default model name:

```yml
      - name: Push to Replicate
        run: cog push r8.im/${{ inputs.model_name || vars.DEFAULT_MODEL_NAME }}
```

[](#troubleshooting-disk-space)Troubleshooting: Disk space
----------------------------------------------------------

If your model is large, the default GitHub Actions runner may not have enough disk space. The [jlumbroso/free-disk-space](https://github.com/jlumbroso/free-disk-space) action included in the workflow above saves about 30GB of disk space, but that may not be enough for your model.

If you need even more space, you can can [set up a larger hosted runner on GitHub](https://docs.github.com/en/actions/using-github-hosted-runners/about-larger-runners/managing-larger-runners#adding-a-larger-runner-to-an-organization), then update your workflow to use your new runner:

```yml
jobs:
  push_to_replicate:
    name: Push to Replicate
    runs-on: my-custom-runner-with-lots-of-disk-space
```

Note: You’ll need a GitHub Team or GitHub Enterprise Cloud plan to use larger runners.

[](#next-steps)Next steps
-------------------------

Hooray! You’ve now got a workflow that pushes your model to Replicate. You’re on the path to a more automated future, where you can iterate quickly on AI models and ship them just like normal software.

--- END OF push-a-model-using-github-actions.md ---


# FILE: continuous-model-deployment.md

This guide will show you how to set up continuous integration and deployment for your Cog model, so you can safely and easily publish new versions of your model as part of your GitHub-based development workflow.

![Use GitHub, Anthropic, and Replicate to build a CI/CD pipeline for your Cog model.](/_content/assets/openai-anthropic-replicate.B4ZhQOYb_Z2tNfmX.webp)

Use GitHub, Anthropic, and Replicate to build a CI/CD pipeline for your Cog model.

[](#what-is-cicd)What is CI/CD?
-------------------------------

CI/CD stands for continuous integration and deployment. It’s a well-known process for building, testing, and deploying software. It has been a popular practice in the software industry for a long time, but it’s just as applicable when developing machine learning models. After all, [AI models are just software](https://replicate.com/blog/machine-learning-needs-better-tools#machine-learning-is-just-software).

CI/CD has many benefits:

*   Catch errors early. This helps reduce the risk of breaking things for your users.
*   Test your model in a consistent and repeatable way.
*   Automate the release process so you can ship new versions of your model more frequently.
*   Collaborate with others. CI/CD workflows live as code in your repository, so they’re easy to discover and understand.

[](#what-are-we-building)What are we building?
----------------------------------------------

In this guide, you’ll set up a CI/CD pipeline for your Cog model using GitHub Actions and [github.com/replicate/cog-safe-push](https://github.com/replicate/cog-safe-push), an open-source project we use internally at Replicate to test and deploy our production models.

Your pipeline will:

*   Lint your Python model code.
*   Create a private test model on Replicate.
*   Push your local Cog model to the test model on Replicate.
*   Lint the model schema, making sure all inputs have descriptions, etc.
*   Run predictions against the test model and compare the outputs to the upstream model.
*   “Fuzz” the test model for five minutes by throwing a bunch of different inputs at it and making sure it doesn’t throw any errors.
*   Push your changes to the production model once the test model passes all the tests.

[](#what-is-fuzz-testing)What is fuzz testing?
----------------------------------------------

Fuzz testing is a technique for finding bugs in software by passing invalid, unexpected, or random data as inputs to the software and seeing if it crashes. In this guide, we’ll use Anthropic’s [Claude API](https://docs.anthropic.com/en/api/introduction) to generate random inputs to test your model.

Language models are great for generating plain text, but they can also be used to generate JSON data. We’ll take advantage of that here to generate structured data that matches the input schema of your model.

[](#prerequisites)Prerequisites
-------------------------------

Before starting this guide, you’ll need the following:

*   An existing [Cog](https://cog.run/) model. If you’ve never pushed a Cog model before, check out the [guide to pushing your first model](/docs/guides/push-a-model).
*   A [Replicate](https://replicate.com/) account for publishing your Cog model.
*   A [GitHub](https://github.com/) repository containing the source code for your model.
*   An [Anthropic](https://console.anthropic.com/) account for generating JSON data to test your model.

[](#step-1-create-a-github-actions-workflow)Step 1: Create a GitHub Actions workflow
------------------------------------------------------------------------------------

GitHub Actions is a feature built into GitHub that makes it easy to add scripts to your repository, and run those scripts on GitHub’s servers. You can use GitHub Actions to do all kinds of automation, like running tests, deploying your model, and more.

To use GitHub Actions, you define workflows using YAML files stored in the `.github/workflows` directory of your GitHub repository.

Create a new file in your repository called `.github/workflows/cog-safe-push.yml`.

Then paste the following code into the file:

```yml
name: Cog Safe Push
on:
  workflow_dispatch:
    inputs:
      model:
        description: 'The name of the model to push, in the format owner/model-name'
        type: string
jobs:
  cog-safe-push:
    # Tip: Create custom runners in your GitHub organization for faster builds
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: "3.12"
    - name: Install Cog
      run: |
        sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
        sudo chmod +x /usr/local/bin/cog
    - name: cog login
      run: |
        echo ${{ secrets.COG_TOKEN }} | cog login --token-stdin
    - name: Install cog-safe-push
      run: |
        pip install git+https://github.com/replicate/cog-safe-push.git
    - name: Push selected models
      env:
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}
      run: |
        cog-safe-push ${{ inputs.model }}
```

Commit this file to your Git repository and push it to GitHub.

[](#step-2-set-a-replicate-api-token)Step 2: Set a Replicate API token
----------------------------------------------------------------------

Before you can run your GitHub Actions workflow, you’ll need to set a Replicate API token as a secret in your GitHub repository.

1.  Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens?new-token-name=continuous-deployment)
2.  Create a new token with a name like “GitHub Actions CI/CD workflow for my-username/my-model”.
3.  Copy the token to your clipboard.
4.  In your GitHub repository, go to the **Settings**, click **Secrets and variables**, then click **Actions**.
5.  Click **New repository secret**.
6.  In the **Name** field, enter `REPLICATE_API_TOKEN`.
7.  In the **Value** field, paste the token you copied from Replicate.
8.  Click **Add secret**.

[](#step-3-set-a-cog-api-token)Step 3: Set a Cog API token
----------------------------------------------------------

You’ll also need to set a Cog API token as a secret in your GitHub repository, so the `cog-safe-push` script can push your model to Replicate.

1.  Go to [replicate.com/auth/token](https://replicate.com/auth/token) and copy your CLI auth token.
2.  In your GitHub repository, go to the **Settings**, click **Secrets and variables**, then click **Actions**.
3.  Click **New repository secret**.
4.  In the **Name** field, enter `COG_TOKEN`.
5.  In the **Value** field, paste the token you copied from Replicate.
6.  Click **Add secret**.

[](#step-4-set-an-anthropic-api-key)Step 4: Set an Anthropic API key
--------------------------------------------------------------------

You’ll also need to set an Anthropic API key as a secret in your GitHub repository, so the `cog-safe-push` script can generate structured JSON inputs to test your model.

1.  Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2.  Create a new API key with a name like “fuzz testing with cog-safe-push for my-username/my-model”.
3.  Copy the key to your clipboard.
4.  In your GitHub repository, go to the **Settings**, click **Secrets and variables**, then click **Actions**.
5.  Click **New repository secret**.
6.  In the **Name** field, enter `ANTHROPIC_API_KEY`.
7.  In the **Value** field, paste the key you copied from Anthropic.
8.  Click **Add secret**.

[](#step-5-run-the-workflow)Step 5: Run the workflow
----------------------------------------------------

Now that you’ve created your workflow and configured the necessary secrets, you can run the workflow manually.

If you’ve configured your workflow correctly, you should see a green checkmark next to the workflow run, and output like the following:

1.  In your GitHub repository, go to the **Actions** tab.
2.  Click **Cog Safe Push**.
3.  In the **Model** field, enter the name of your model in the format `owner/model-name`.
4.  Click **Run workflow**.

![Screenshot of the completed GitHub Actions workflow.](/_content/assets/actions.DNJDa6Ua_2cxMxY.webp)

Screenshot of the completed GitHub Actions workflow.

Success! You’ve just run your CI/CD pipeline. If all the steps passed, you’ve now got a newly published [version](https://replicate.com/docs/topics/models/versions) of your model on Replicate.

[](#step-6-optional-customize-cog-safe-push)Step 6 (Optional): Customize cog-safe-push
--------------------------------------------------------------------------------------

The `cog-safe-push` command has sensible defaults and will work without any specific configuration, but you’ll probably want to customize it to your needs.

If you create a file named `cog-safe-push.yaml` in your Cog directory, it will be used automatically.

Here’s an example configuration that specifies a model, a test model, hardware, and a set of test cases:

```yaml
# This is the model that the deployment will use
model: owner/my-model
# A private model to run the test against before pushing
test_model: owner/my-model-test
test_hardware: gpu-l40s
# Define the predict section to run predictions against the test model
predict:
  compare_outputs: false
  predict_timeout: 700
  test_cases:
    - inputs:
        prompt: A formula one car
        seed: 1
    - inputs:
        prompt: A cat
        duration: 4
        negative_prompt: Ginger cat
        frame_image_url: https://tjzk.replicate.delivery/models_models_featured_image/afce5fa4-5f8a-45db-95c0-bf62ec6958e7/output-59.webp
        seed: 2
```

To learn more about the available options, see the [cog-safe-push README](https://github.com/replicate/cog-safe-push/blob/main/README.md).

[](#next-steps)Next steps
-------------------------

Now that you have a CI/CD pipeline for your Cog model, you can use it to publish new versions of your model as part of your GitHub-based development workflow.

The Actions workflow you created is triggered manually. This is a good starting point, as it lets you run the workflow repeatedly until you get everything working the way you want.

Once you’ve got things configured just right, consider updating the workflow to run automatically when you push to a branch of your repository, or whenever you open a pull request.

Remember that CI/CD is an iterative process, and you’ll need to customize the workflow and testing parameters to match your needs. The investment is worth it though: CI/CD will help you ship new versions of your model more frequently, and your team will enjoy faster development velocity and fewer operational headaches. Ship it!

--- END OF continuous-model-deployment.md ---


# FILE: get-a-gpu-on-brev.md

In this guide, you’ll learn how to get your own GPU machine in the cloud using [NVIDIA Brev](https://brev.dev) to build, run, and test your own models.

[](#what-is-brev)What is Brev?
------------------------------

[NVIDIA Brev](https://brev.dev) is a cloud service that offers GPU machines for rent on demand. They come preconfigured with Docker and NVIDIA drivers, which makes them a great fit for working with [Cog](https://cog.run).

Brev connects to multiple cloud providers like GCP, AWS, Lambda Labs, and others to find the right type of GPU for the best price possible.

Brev is a developer-friendly tool with a [command line interface](https://github.com/brevdev/brev-cli) that makes it easy to create and manage your GPU machines.

[](#do-you-even-need-a-gpu)Do you even need a GPU?
--------------------------------------------------

You can build and push most [Cog](https://cog.run) models from machines that don’t have GPUs, like your laptop, or a GitHub Actions runner.

This guide helps when you need to _iterate_ on your model and run it as you make code changes, _before_ you push it to Replicate. For that, you’ll usually need a GPU development environment.

[](#step-1-sign-up-for-brev)Step 1: Sign up for Brev
----------------------------------------------------

To get started, go to [console.brev.dev](https://console.brev.dev/) and sign up for an account.

Creating an account is free, and Brev has [simple pricing](https://www.nvidia.com/en-us/launchables/pricing/): Only pay for what you use.

[](#step-2-install-the-brev-cli)Step 2: Install the Brev CLI
------------------------------------------------------------

Install the Brev CLI using [Homebrew](https://brew.sh/) with the following command:

```bash
brew install brevdev/homebrew-brev/brev
```

.You can create and manage instances using the [Brev website](https://console.brev.dev), but this guide uses the CLI for the sake of “brev”ity. (Sorry. Couldn’t resist.)

[](#step-3-log-in-to-brev)Step 3: Log in to Brev
------------------------------------------------

Use the CLI to log in to Brev:

```plaintext
brev login
```

This will prompt you to open a link in your browser to authenticate with Brev.

[](#step-4-create-an-instance)Step 4: Create an instance
--------------------------------------------------------

Now that you’ve logged in, create an instance and give it a name:

```plaintext
brev create my-dev-box \ 
  --gpu fancy-gpu
```

You should see output like the following:

```plaintext
$ brev create my-dev-box
Creating instance my-dev-box in org bapj27zsc
	name my-dev-box
	GPU instance n1-highmem-4:nvidia-tesla-t4:1
	Cloud GCP
⡿ Creating your instance. Hang tight 
⣟ Instance is deploying 
Your instance is ready!
Connect to the instance:
	brev open my-dev-box	# brev open <NAME> -> open instance in VS Code
	brev shell my-dev-box	# brev shell <NAME> -> ssh into instance (shortcut)
```

[](#step-5-shell-into-your-instance)Step 5: Shell into your instance
--------------------------------------------------------------------

Now that you’ve created your instance, you can access it as a shell:

```plaintext
brev shell my-dev-box
```

This will open a new terminal session that is SSH connected to your GPU instance.

[](#step-6-install-cog)Step 6: Install Cog
------------------------------------------

[Cog](https://cog.run) is Replicate’s open-source tool that makes it easy to put a machine learning model in a Docker container.

Install the Cog CLI on your Brev instance:

```sh
sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
sudo chmod +x /usr/local/bin/cog
```

[](#step-7-run-an-existing-cog-model)Step 7: Run an existing Cog model
----------------------------------------------------------------------

To verify that your new instance is working properly, you can run a prediction on an existing model on Replicate.

Run the following command in the terminal to download the [fofr/sdxl-emoji](https://replicate.com/fofr/sdxl-emoji) model and run it locally on your new instance to generate an emoji of the shaka symbol, AKA the “call me hand”:

```plaintext
cog predict r8.im/fofr/sdxl-emoji@sha256:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e \
  -i 'width=1024' \
  -i 'height=1024' \
  -i 'prompt="A TOK emoji of a hand doing the shaka symbol, AKA call me hand"'
```

If you see successful output from this task, you’ve made great progress!

*   Docker is installed and configured properly
*   NVIDIA CUDA drivers are installed
*   Cog works
*   Your instance is really fast!

[](#step-8-create-a-model)Step 8: Create a model
------------------------------------------------

Now that you know Cog is working, create a new model from scratch:

```plaintext
mkdir my-model && cd my-model
cog init
```

This will output something like the following:

```plaintext
Setting up the current directory for use with Cog...
 Created my-cog-model/cog.yaml
 Created my-cog-model/predict.py
 Created my-cog-model/.dockerignore
 Created my-cog-model/.github/workflows/push.yaml
```

If you’re new to creating models on Replicate, check out the [guide to push your first Cog model](/docs/guides/push-a-model).

[](#step-9-edit-model-code-in-your-ide)Step 9: Edit model code in your IDE
--------------------------------------------------------------------------

Brev can open your cloud instance in [VS Code Remote](https://code.visualstudio.com/docs/remote/remote-overview), Cursor, or your favorite IDE. This lets you search and edit all the files on your Brev instance as if they were on your local machine:

Use `brev open` to open your instance in your editor:

```plaintext
brev open my-dev-box
```

In your editor, overwrite the `predict.py` file with the following code and save it:

```python
from cog import BasePredictor, Input
class Predictor(BasePredictor):
    def setup(self):
        self.prefix = "hello"
    def predict(self, text: str = Input(description="Text to prefix with 'hello '")) -> str:
        return self.prefix + " " + text
```

[](#step-10-run-your-model)Step 10: Run your model
--------------------------------------------------

Now that you’ve made some changes to your model code, run it with Cog using existing `Brev shell` session, or the built-in terminal if you’re using VS Code or Cursor:

```plaintext
cd my-model
cog predict -i text="world"
```

You should see output like the following:

```plaintext
hello world
```

[](#step-11-celebrate)Step 11: Celebrate
----------------------------------------

You’ve just built an AI model on a GPU instance in the cloud!

You also have a fast and flexible cloud environment for iterating on your model and testing it before pushing it to Replicate.

Happy hacking!

[](#tips)Tips
-------------

*   [Install JupyterLab](https://developer.nvidia.com/blog/deploy-gpu-optimized-ai-software-with-one-click-using-brev-dev-and-nvidia-ngc-catalog/) on your instance to view output files and run models interactively.
*   [Increase disk storage](https://replicate.notion.site/Moving-Your-Home-Directory-on-Brev-dev-to-ephemeral-182279e7ce4b80bcb42cdb9fdf73b661) on your Brev instance by moving your home directory to an ephemeral disk.
*   [Update your NVIDIA CUDA drivers](https://replicate.notion.site/updating-nvidia-drivers-to-cuda-12-4-on-a-brev-machine-10d279e7ce4b8078ba52d2f7d597d6e6) to the latest version if it’s needed for your model.
*   [Change the GPU and memory configuration](https://console.brev.dev/) or your existing instance using the Brev web console.
*   Use `brev ls` to list your instances. This is handy if you forget what you named your new instance!
*   Remember to `brev stop` your instance when you’re not using it to avoid incurring charges.

--- END OF get-a-gpu-on-brev.md ---


# FILE: get-a-gpu-on-lambda-labs.md

GPUs are specialized processors that are designed to handle complex mathematical calculations. Many machine learning models will only run on a computer with a GPU. While GPUs are incredibly powerful, setting up a machine that can use them can be challenging. GPUs require specific drivers and software to work properly, which can be difficult to install and configure.

In this guide, you’ll learn how to get your own GPU machine in the cloud, so you can package your model and push it to Replicate.

Note

You probably don’t need to set up your own GPU machine to push a model to Replicate. In most cases, you should be able to package your model with [Cog](https://cog.run) and [push it to Replicate](https://replicate.com/docs/guides/push-a-model) without ever leaving your local machine.

In certain cases, you may need a GPU machine to push a model. If you’re not sure if you need this, you probably don’t. If you get an error message like this:

`RuntimeError: CUDA unknown error - this may be due to an incorrectly set up environment, e.g. changing env variable CUDA_VISIBLE_DEVICES after program start. Setting the available devices to be zero.`

then you may need this guide.

[](#sign-up-for-lambda-labs)Sign up for Lambda Labs
---------------------------------------------------

Lambda Labs is a cloud provider that offers GPU machines that come preconfigured with Docker and NVIDIA drivers, which makes them a great fit for working with [Cog](https://cog.run).

Create an account at [lambdalabs.com/service/gpu-cloud](https://lambdalabs.com/service/gpu-cloud) and enter your billing info. You’ll be able to run GPU machines for [as little as $0.50/hour](https://lambdalabs.com/service/gpu-cloud/pricing).

[](#create-a-gpu-cloud-instance)Create a GPU Cloud instance
-----------------------------------------------------------

Once you’ve got a Lambda account, create a new GPU Cloud instance. You’ll be asked to specify three settings:

*   **Instance type**: This is the type of machine you want to use. For example, `1x A10 (24 GB PCIe)`. Start by choosing the smallest instance type. You can upgrade to a larger instance type later if you need more power.
*   **Region**: This is the geographical location of the machine. For example, “California, USA (`us-west-1`)”. Choose the region closest to you.
*   **Filesystem**: This is not strictly required, as your instance will still have an ephemeral writeable filesystem, but if you want to be able to shut down your instance and come back to it without losing your changes on disk, you’ll need to attach a filesystem.

[](#add-your-public-ssh-key)Add your public SSH key
---------------------------------------------------

Next you’ll be asked to provide your public SSH key so you can easily log into your new instance using SSH. If you’ve already set up your SSH keys for another service like GitHub, you can use your existing public key. Use a command like this to copy your public key to your clipboard:

```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

If you don’t have one already, check out [GitHub’s docs for generating an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

[](#launch-your-instance)Launch your instance
---------------------------------------------

Your GPU Cloud instance will be launched in a few minutes. Once it’s ready, you can access it through SSH or JupyterLab.

To SSH into your instance, copy the “SSH login” command from your Lambda dashboard, then run it:

```bash
ssh ubuntu@[your-instance-ip]
```

To access your instance using JupyterLab, click the “Launch” button beside your new instance in the Lambda dashboard.

[](#install-cog-on-your-instance)Install Cog on your instance
-------------------------------------------------------------

Cog is Replicate’s open-source tool that makes it easy to put a machine learning model in a Docker container. Cog is the tool you use to package your trained model and push it to Replicate.

Using the terminal (either from your SSH sesion or inside JupyterLab), run the following command to install Cog on your instance:

```sh
sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
sudo chmod +x /usr/local/bin/cog
```

[](#run-an-existing-model)Run an existing model
-----------------------------------------------

To verify that your new instance is working properly, you can run a prediction on an existing model on Replicate.

Run the following commmand in the terminal to download the [Stable Diffusion](https://replicate.com/stability-ai/stable-diffusion) model and run it locally on your new instance:

```bash
sudo cog predict r8.im/stability-ai/stable-diffusion@sha256:f178fa7a1ae43a9a9af01b833b9d2ecf97b1bcb0acfd2dc5dd04895e042863f1 -i prompt="a pot of gold"
```

Note: It’s important to use `sudo` here so Cog can work properly with the Docker installation on your instance.

[](#use-jupyterlab-to-view-model-output)Use JupyterLab to view model output
---------------------------------------------------------------------------

JupyterLab is a web-based editor that makes it easy to run models interactively and view the files on your instance. Lambda’s GPU Cloud instances are preconfigured with JupyterLab.

To access JupyterLab, click the “Launch” button beside your new instance in the Lambda dashboard.

You should see your output file in the JupyterLab file browser. Click on it to view the output.

![jupyterlab](https://user-images.githubusercontent.com/2289/214712829-b393d36a-fe90-4da2-974d-735b5ee036fe.png)

[](#push-your-model-to-replicate)Push your model to Replicate
-------------------------------------------------------------

You’ve now got a working GPU machine in the cloud!

Now it’s time to [build your own model and push it to Replicate](https://replicate.com/docs/topics/models/publish-a-model).

[](#terminate-your-instance)Terminate your instance
---------------------------------------------------

Lambda’s GPU Cloud instances remain active until you terminate them, so you’ll be charged for them until you shut them down. To terminate your instance, go to the Lambda dashboard and click “Terminate” on your instance.

--- END OF get-a-gpu-on-lambda-labs.md ---


# FILE: working-with-loras.md

If you’ve ever fine-tuned an image or video model, you may have come across the term “LoRA”.

LoRA stands for “Low-Rank Adaptation” and was [developed at Microsoft](https://github.com/microsoft/LoRA) in September 2021 as a technique for fine-tuning large AI models cheaply and efficiently.

In the last few years, the term “LoRA” has become industry shorthand for “trained weights” in the context of fine-tuning not just language models, but image and video models too. When people refer to “a LoRA”, they mean a set of trained weights that can be added to a base model, like Flux or Wan2.1, to create a fine-tuned version.

[![Combining LoRAs](https://github.com/user-attachments/assets/f85e1cdf-ba24-45a3-a374-dcd5d58893a8)](https://replicate.com/p/yfqxmtmfw9rm40cj1m2v0myfq8)

[”ZIKI the man, illustrated MSMRB style”](https://replicate.com/p/yfqxmtmfw9rm40cj1m2v0myfq8), created by combining the [zeke/ziki-flux](https://replicate.com/zeke/ziki-flux) LoRA with the [jakedahn/flux-midsummer-blues](https://replicate.com/jakedahn/flux-midsummer-blues) LoRA.

[](#how-do-loras-work)How do LoRAs work?
----------------------------------------

Training a massive AI model from scratch takes an enormous amount of data, time, and computing power. Fine-tuning lets you adapt an existing model instead of building a new one, but it still requires updating a huge number of parameters. That’s where LoRA comes in.

LoRA works by keeping the original model frozen and only adding small, trainable layers to the model. Think of it like applying a filter to a camera lens: the base model remains unchanged, but the filter tweaks the output in a specific way. This allows LoRAs to capture new styles or subjects without needing to retrain everything from scratch.

This approach makes fine-tuning more efficient, reducing memory and compute requirements without sacrificing quality. It also means multiple LoRAs can be swapped in and out of a model, allowing for quick customization without permanent changes.

[](#lora-for-image-models)LoRA for image models
-----------------------------------------------

LoRAs were first popularized for fine-tuning Stable Diffusion and SDXL, and [Replicate was one of the first places to support them](https://replicate.com/blog/lora-faster-fine-tuning-of-stable-diffusion). By training a LoRA on a specific style or dataset, users could apply unique aesthetics or subject matter to their generations.

Today, LoRAs are widely used for Flux, the state-of-the-art image generation model from Black Forest Labs, the original creators of Stable Diffusion.

To get started creating your own fine-tuned Flux models, check out our [guide to fine-tuning Flux](/get-started/fine-tune-with-flux).

[](#lora-for-video-models)LoRA for video models
-----------------------------------------------

As video generation models have started to gain popularity, the community has started to develop new ways of fine-tuning them, and LoRAs are a key part of that.

Wan2.1 is a new open-source video generation model that’s topping the the leaderboards, and the community has already started developing tools for creating fine-tuned versions of Wan2.1 with custom LoRAs.

Check out [@fofr](https://replicate.com/fofr)’s [Wan2.1-with-LoRA](https://replicate.com/fofr/wan2.1-with-lora) for an example of a video model that lets your import custom LoRAs from Hugging Face or arbitrary URLs.

[](#combine-loras-when-generating-images-with-flux)Combine LoRAs when generating images with Flux
-------------------------------------------------------------------------------------------------

A little-known feature of Flux fine-tunes on Replicate is that you can combine multiple LoRA styles in a single output image. LoRA stands for “Low-Rank Adaptation”. I won’t go into technical detail about how LoRAs work here, but the important thing to know is that it’s become an industry term for “trained weights” in the context of fine-tuning image models. When you refer to “a LoRA”, you’re talking about a specific set of trained weights that get added to the base Flux model to constitute a “fine-tuned model”.

Combining LoRAs is a really fun way of generating unique images, but you can also use it as a technique to diversify your training data to create better versions of your own fine-tuned Flux models.

At a high level, the process works like this:

1.  Create a fine-tuned model with whatever training data you have available.
2.  [Explore LoRA fine-tunes from the community](https://huggingface.co/models?other=replicate,flux) and pick a few that you like.
3.  Generate images with your fine-tuned model, combining it with the other LoRAs you selected.
4.  Comb through the outputs and select the ones that meet your expectations.
5.  Run a new training job using those outputs as training data.

To find LoRAs to combine with your model, check out the [Flux fine-tunes on Replicate](https://replicate.com/collections/flux-fine-tunes) and [Replicate LoRA fine-tunes on Hugging Face](https://huggingface.co/models?other=replicate,flux).

[](#combine-loras-to-generate-images-using-an-api)Combine LoRAs to generate images using an API
-----------------------------------------------------------------------------------------------

To generate images with combined LoRAs using the Replicate API, set the `extra_lora` and `extra_lora_scale` input parameters, and be sure to the use the [trigger words](https://replicate.com/blog/fine-tune-flux-with-faces#step-2-choose-a-unique-trigger-word) from both models in your prompt.

Here’s an example of how to generate images with combined LoRAs using the [Replicate JavaScript client](https://github.com/replicate/replicate-javascript):

```js
import Replicate from "replicate";
const replicate = new Replicate();
const model = "zeke/ziki-flux:dadc276a9062240e68f110ca06521752f334777a94f031feb0ae78ae3edca58e";
const input = {
  prompt: "ZIKI the man, illustrated MSMRB style",
  lora_scale: 1,
  extra_lora: "jakedahn/flux-midsummer-blues",
  extra_lora_scale: 1.22,
  num_outputs: 4,
  aspect_ratio: "1:1",
  guidance_scale: 3.5,
  output_quality: 80,
  prompt_strength: 0.8,
}
const output = await replicate.run(model, { input });
console.log(output);
```

The key things to keep in mind when combining LoRAs are:

1.  Be sure to use the [trigger words](https://replicate.com/blog/fine-tune-flux-with-faces#step-2-choose-a-unique-trigger-word) from both models in your prompt to ensure that the LoRA styles are applied correctly.
2.  The `extra_lora` parameter should be set to the name of the LoRA you want to combine with your model. You can use the shorthand name of the model, like `jakedahn/flux-midsummer-blues`, or the full URL to a weights file.
3.  The `extra_lora_scale` parameter should be set to a value between -1 and 2. The higher the value, the more pronounced the extra LoRA style will be.
4.  Try balancing your multiple LoRAs by experimenting with their scales between 0.9 and 1.1

[](#models-that-support-loras)Models that support LoRAs
-------------------------------------------------------

Now that you have a sense of what LoRAs are and how they work, here’s a collection of models that support LoRAs.

Video models:

*   [https://replicate.com/fofr/wan2.1-with-lora](https://replicate.com/fofr/wan2.1-with-lora)
*   [https://replicate.com/zsxkib/hunyuan-video-lora](https://replicate.com/zsxkib/hunyuan-video-lora)

Image models:

*   [https://replicate.com/lucataco/flux-dev-multi-lora](https://replicate.com/lucataco/flux-dev-multi-lora)
*   [https://replicate.com/lucataco/flux-schnell-lora](https://replicate.com/lucataco/flux-schnell-lora)
*   [https://replicate.com/fofr/realvisxl-v3-multi-controlnet-lora](https://replicate.com/fofr/realvisxl-v3-multi-controlnet-lora)
*   [https://replicate.com/black-forest-labs/flux-dev-lora](https://replicate.com/black-forest-labs/flux-dev-lora)
*   [https://replicate.com/replicate/fast-flux-trainer](https://replicate.com/replicate/fast-flux-trainer)
*   [https://replicate.com/pnyompen/sd-controlnet-lora](https://replicate.com/pnyompen/sd-controlnet-lora)
*   [https://replicate.com/black-forest-labs/flux-schnell-lora](https://replicate.com/black-forest-labs/flux-schnell-lora)

--- END OF working-with-loras.md ---


# FILE: build-ai-apps-fast-with-hypermedia.md

In the age of generative AI it can feel like everything is moving too fast. There are so many fun generative models to play with, and new ones released every day. It’s hard to keep up.

Especially when combining different models, the workflows get complex and hard to manage. But you don’t want to spin up a new production app with frontend, backend, and GPU every time you try something new.

What if you could quickly glue a few models together to suit your workflow? What if you could do this without leaving your browser? Even… from your phone? We’re not talking about “no-code” interfaces here. What if you could build and deploy a custom AI app with just a few lines of code?

This guide will walk you through the basics of hypermedia and how to use it to build AI powered apps. We’ll combine several models to build a custom AI web app and deploy it to the web as a single serverless function. You can follow along in the browser and fork the app to create your own custom AI workflows.

Our example app is Movie Real, a face swapping app that puts you on the big screen:

[](#who-is-this-guide-for)Who is this guide for?
------------------------------------------------

This guide is for developers who want to rapidly prototype AI powered apps. You’re familiar with HTML, CSS, and JavaScript, and you’ve used AI models before.

Maybe you’ve heard about hypermedia and are curious to test it out. Or maybe you’re a full-stack veteran looking for a way to quickly iterate AI projects. Whatever your background, this guide will help you build AI apps fast. We’ll walk through everything step by step and you can follow along in the browser.

### [](#what-is-hypermedia)What is hypermedia?

Hypermedia is a paradigm for interactive multimedia applications. It specifies that the server should send not just data, but also controls that can operate on that data. The user can then use those controls to navigate and operate on the data. The client doesn’t have to know anything other than how to render the data and controls.

Hypermedia is the original vision of the web. Most of the web is built on top of the HyperText Transfer Protocol (HTTP), which is a hypermedia protocol. The original HTML specification was a hypermedia specification. The web was originally designed to be a hypermedia platform.

But the web has changed a lot since then. Frontend frameworks like React, developed for massively multiplayer apps like Facebook, took over the web, and brought all the complexity of those apps with them. Single page apps, state management, and client side routing are now the norm.

The idealism of hypermedia was replaced by the pragmatism of the SPA. But hypermedia is suddenly relevant again, in large part thanks to one library and its author: [HTMX](https://htmx.org/). HTMX is a small JavaScript library that brings the power of hypermedia to the modern web.

There’s already a hypermedia client on every device: the web browser. With HTMX we’ll be able to leverage the browser’s built-in capabilities for rendering, caching and navigation, so we don’t have to reinvent the wheel. And we’ll be able to build apps that are easy to extend and maintain, without having to write a bunch of boilerplate code.

#### [](#hypermedia-and-ai)Hypermedia and AI

The hypermedia paradigm is a great fit for AI powered apps. Generative models are often slow and resource intensive. You don’t want to run them on the client. You want to run them on a GPU instance in the cloud (with Replicate, for example).

If you’re waiting many seconds for a model to generate text or images, you don’t really care about the much smaller latency introduced by a server round trip. And you don’t want to have to manage the state of the app on the client. You want to be able to quickly prototype and iterate on models, prompts, and parameters, without having to worry about re-configuring the frontend.

#### [](#hypermedia-as-the-engine-of-application-state)Hypermedia as the Engine of Application State

Hypermedia as the Engine of Application State (HATEOAS) is a constraint of the original REST specification. It requires that a client should interact with a network application entirely through hypermedia provided dynamically by application servers.

In the current scenario, most APIs are data APIs, not true REST APIs. They send JSON representations of data, which is then transformed into a document by frontend code. This requires the client to know the API of the web app, what data to expect, and how to transform it into a document.

HATEOAS, on the other hand, suggests sending a representation in hypermedia. This representation would include links to other resources, and controls that can operate on those resources. This powerful idea eliminates the need for the client to know anything about the API of your web app. It can discover the API as it goes along.

#### [](#limitations)Limitations

Note that hypermedia might not be the best choice for applications that require real-time, bidirectional communication like chat apps or games. For these types of applications, technologies like WebSockets are more suitable.

[](#the-tools-well-use)The tools we’ll use
------------------------------------------

The hypermedia paradigm is getting more popular, and there are several tools that make it easier to build hypermedia apps. We’ll use a few of them in this guide.

### [](#htmx)HTMX

We talked about HTMX earlier. It’s a small library you import into your `<head>` tag. It lets you add hypermedia attributes to your HTML. Its mission is to fill the missing capabilities of the web platform, and then get out of the way.

The original hypermedia controls are the `link` and `form` tags. They’re the only tags that are allowed to to navigate and operate on resources. HTMX adds a few more attributes that let you do the same thing with any tag. It also adds a boost of interactivity by making it possible to update the page without a full page reload.

### [](#val-town)Val Town

[Val Town](https://www.val.town/) is a social website to code in the cloud. You can create standalone JavaScript functions, called “vals”, to run scripts, schedule actions, and serve HTTP endpoints. That last feature is what we’ll use in this guide. We’ll create a single stateless function that will serve our app.

We won’t need to worry about setting up a backend, or managing a server. We’ll just write our code and deploy it on the cloud. You can use the Val Town editor in any browser, even on your phone. You can copy and fork vals and call one val from another. It’s a great way to quickly prototype and share code.

### [](#replicate)Replicate

[Replicate](https://replicate.com/) runs machine learning models in the cloud. We have a library of open-source models that you can run with a few lines of code. If you’re building your own machine learning models, Replicate makes it easy to deploy them at scale.

For our example app, we’ll chain together calls to a few different models. We can use the Replicate JavaScript client to call the models from our val.

[](#building-a-face-swapping-app-with-val-town-htmx-and-replicate)Building a face swapping app with Val Town, HTMX, and Replicate
---------------------------------------------------------------------------------------------------------------------------------

Warning

This guide is no longer supported, and includes references to deprecated models. Check out the [docs homepage](/docs) for more up-to-date guides and examples.

Now that we’ve learned about the tools and concepts, let’s build a hypermedia AI app. We’ll use Val Town to create a serverless function, HTMX to add hypermedia controls to the page, and Replicate to call AI models.

### [](#the-concept)The concept

Face-swapping models are increasingly popular. And why not? It’s fun to insert your face into a painting or movie screenshot. But wouldn’t it be cool if you could do it with generated images, so you could star in any movie you can imagine?

Let’s make a face swap app that lets you insert your face into a generated image. We’ll use the popular [lucataco/faceswap](https://replicate.com/lucataco/faceswap) to switch the faces, and the photorealistic model [adirik/realvisxl-v3.0-turbo](https://replicate.com/adirik/realvisxl-v3.0-turbo) to generate the imaginary scenes.

### [](#preparing-your-development-environment)Preparing your development environment

This part is surprisingly easy. You don’t need to install anything. You can follow along in the browser.

Sign up for a free account on [Val Town](https://val.town/). You’ll also need an account on [Replicate](https://replicate.com/).

The only other preparation is to get a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=hypermedia-app) and set it as `REPLICATE_API_TOKEN` in your Val Town [Environment Variables](https://www.val.town/settings/environment-variables). This will let you call Replicate models from your val.

Watch out: this will also let anyone else call Replicate models from your val. Val Town protects the security of your environment variable, but it doesn’t secure your HTTP endpoint or do any authentication. We won’t do that for this demo app, but keep it in mind when building your own tool.

### [](#start-with-a-val)Start with a val

Conveniently, Val Town has an HTMX template we can use:

&#x20;

This is an embedded val, so you can run it here. It’s just a hello world example right now, but it does have a live endpoint. You can click “Browser preview” in the bottom panel of the val (or “Open HTTP endpoint” in the top bar) and observe the dynamic behavior enabled by HTMX. Send a request, get a response and update a separate part of the DOM. All with just a 3kb library and two attributes:

```plaintext
hx-target="#answer" hx-post="/"
```

And all without a full page reload. It’s… oddly refreshing.

#### [](#understanding-htmx-attributes)Understanding HTMX attributes

HTMX adds a few attributes to HTML tags so you can add hypermedia controls to your page. The ones to know here are:

*   **hx-get**: fetch a resource
*   **hx-post**: send a request
*   **hx-trigger**: specify the event that triggers a request
*   **hx-swap**: define how to update the page after a request
*   **hx-target**: specify the element to update after a request

You can read more about the attributes in the [HTMX documentation](https://htmx.org/reference/#attributes).

### [](#integrate-replicate)Integrate Replicate

Before we wire up the hypermedia controls, let’s add the Replicate client to our val to call the models. We’ll use the `replicate` package from npm. This code will run on the Val Town platform, so we don’t need to install anything locally.

We also add the function calls that we use to call the models, with parameters set for a nice image. First we send a text prompt to the image generation model, and then send the generated image to the face swap model, and finally return the result.

&#x20;

Note that we encode the uploaded image into a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs). This is so we can pass it from the client to the val without putting it on a server or in blob storage somewhere.

### [](#building-the-ui)Building the UI

Now we’ll add the controls to the app: a form to upload a face image and a text input to prompt the model.

When you submit the form, it sends a POST request to the Val Town endpoint with the form data, which will call our Replicate models and get the generated image. Finally the val sends back a fragment of HTML with the generated image, and HTMX updates the DOM by putting the new fragment at the target.

&#x20;

### [](#add-styles)Add styles

We have a working app! But it’s not very pretty. We can make it look nicer by adding some CSS.

Let’s use [terminal.css](https://terminalcss.xyz/) to give it a clean retro look. We could import this from npm through Val Town, but it’s just a css file that creates utility classes, so to emphasize the power of hypermedia we’ll just include it with a style tag like HTML of old.

Once we’ve added the style tag, we can include the classes in our HTML. Let’s give it a fun name too.

&#x20;

### [](#add-a-loading-indicator)Add a loading indicator

It would also be nice to load more than one image at once. Since we’re using hypermedia as the engine of application state, we can do that by retargeting the new content. Using `hx-swap` we can target the element _before_ the most recent image, so they’ll be stacked in reverse chronological order.

Finally let’s also add a loading indicator so we know when the app is working. We’ll add an attribute `hx-indicator` to the form, and HTMX will add a class `.htmx-request` to the element while the request is in progress. We can use a small piece of CSS to hide the indicator when not loading.

&#x20;

[](#customizing-and-extending-your-app)Customizing and Extending Your App
-------------------------------------------------------------------------

One of the best things about creating tools with Replicate is the ability to modify and customize them in real time to suit your needs.

### [](#integrating-a-new-ai-model)Integrating a New AI Model

For instance, if the images generated by the app aren’t aesthetically pleasing, you don’t have to keep tweaking the prompt each time. Instead, you can integrate a language model to engineer the prompt for you. A popular open-source choice with instruction following abilities is [mistralai/mistral-7b-instruct-v0.1](https://replicate.com/mistralai/mistral-7b-instruct-v0.1). This model can transform a simple prompt into a more complex one, resulting in a better image.

We can use a metaprompt like the following to transform our short text suggestions into evocative descriptions that the image generation model can use to create a more interesting image.

```plaintext
Take the description that follows and imagine it vividly as a movie scene, describing character, action, setting, composition, lighting, and mood. Write your answer in the form of a brief terse sentence. Include only the text of your answer, no other information or communication.
"""
${textPrompt}
"""
```

And then we just pass the prompt through the language model before sending it to the image generation model.

&#x20;

### [](#considering-real-world-factors)Considering Real-World Factors

While this might not be a full-fledged app, it’s a great balance of simplicity and power for a personal tool. However, in a real-world scenario, you’d want to consider factors like authorization, error handling, security, scalability, performance, and cost. This doesn’t mean you have to change approach — [hypermedia can scale](https://htmx.org/essays/does-hypermedia-scale/).

### [](#forking-the-app-and-further-customization)Forking the App and Further Customization

One of the key advantages of this paradigm is the ease of iteration and customization. You can fork and extend the API to suit your needs.

You can modify models, prompts, and behaviors with Replicate. The input and output from one stateless endpoint can be managed, and with the ability to have multiple vals, import them, and call their HTTP endpoints, you could even build an entire app with just vals.

The modular nature of the code means that if you need to scale up, you can easily move the code to a different platform. And since you’re sending hypermedia, the app will continue to work even if the controls or the data change. The browser will be able to render it, and the user will be able to use it.

[](#wrapping-up)Wrapping Up
---------------------------

We’ve journeyed together through the creation of a hypermedia AI app, getting our hands dirty with practical coding and gaining a solid understanding of the key tools and concepts involved. We’ve seen how these elements can come together to build something that’s not just functional, but also fun and imaginative.

### [](#what-lies-ahead)What Lies Ahead

This guide is your starting point. Experiment with different models, tweak the code, and make it your own. The possibilities are endless, and the power to create is in your hands.

--- END OF build-ai-apps-fast-with-hypermedia.md ---


# FILE: make-art-with-stable-diffusion.md

Stable Diffusion is a collection of open-source models by Stability AI. They are used to generate images, most commonly as text to image models: you give it a text prompt, and it returns an image. But they can also be used for [inpainting and outpainting](/guides/stable-diffusion/inpainting), [image-to-image](/guides/stable-diffusion/image-to-image) (img2img) and a lot more.

In this guide we’ll show you the basics, then dive deeper into using these models to get the best out of them.

[](#try-it-first)Try it first
-----------------------------

If you haven’t used Stable Diffusion before, give it a go now. [Visit Stable Diffusion XL](https://replicate.com/stability-ai/sdxl) and try asking for a painting of a cute cat.

Note

The text prompt is the only required input to generate an image using Stable Diffusion, but there are many other inputs like negative prompt, output image dimensions, and inference steps that can be used to control the output. When you [run Stable Diffusion on Replicate](https://replicate.com/stability-ai/sdxl), you can customize all of these inputs to get a more specific result.

[](#the-models)The models
-------------------------

There are many different versions of Stable Diffusion. Let’s break it down:

1.  [**Stable Diffusion XL (SDXL)**](https://replicate.com/stability-ai/sdxl) is currently the most popular version of Stable Diffusion. It was released in July 2023 and creates fantastic, realistic images around the 1024x1024 resolution, though you can use any aspect ratio.
2.  [**Stable Diffusion 1.5 (SD1.5)**](https://replicate.com/stability-ai/stable-diffusion/versions/b3d14e1cd1f9470bbb0bb68cac48e5f483e5be309551992cc33dc30654a82bb7) is an older version that was open-sourced in August 2022, and its images are best at 512x512. Despite its age, it remains popular because of its speed, low memory usage, and an abundance of community fine-tuned models which use SD1.5 as a base.
3.  [**Stable Diffusion 2.1 (SD2.1)**](https://replicate.com/stability-ai/stable-diffusion/versions/ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4) was released in October 2022, and was “sort of like the awkward second album”. [Good, just… different.](https://replicate.com/blog/painting-with-words-a-history-of-text-to-image-ai) This version introduced improvements like negative prompts, OpenCLIP for a text encoder, larger image outputs, but the migration to OpenClip caused significant changes to the image output and composition, when compared to prior versions of Stable Diffusion. To many, this felt like a “breaking change”. Most notably, this migration caused many artist’s names to be removed from the text encoder, which to this day drives a subset of users to use 1.5 or SDXL over version 2.
4.  **SDXL Turbo** is a version of SDXL that was released in November 2023. It is a non-commercial model that is very fast and can make good images in a single step.
5.  **SD Turbo** is another fast and non-commercial version that was released in November 2023.

[](#sections-in-this-guide)Sections in this guide
-------------------------------------------------

*   [How to use Stable Diffusion](/guides/stable-diffusion/how-to-use)  
    A guide to all the Stable Diffusion parameters
*   [Image to image (img2img)](/guides/stable-diffusion/image-to-image)  
    How to use an image as a reference
*   [Inpainting](/guides/stable-diffusion/inpainting)  
    How to edit parts of an image
*   [Outpainting](/guides/stable-diffusion/outpainting)  
    How to edit beyond the canvas of an existing image
*   [Fine-tuning](/guides/stable-diffusion/fine-tuning)  
    Dreambooth, LoRAs, Textual Inversion and training with an API
*   [Controlnet](/guides/stable-diffusion/controlnet)  
    An explanation of controlnets and their preprocessors
*   [Turbo and LCMs](/guides/stable-diffusion/turbo-and-latent-consistency)  
    An explanation of very fast, few steps, Stable Diffusion
*   [Glossary](/guides/stable-diffusion/glossary)  
    An explanation of common Stable Diffusion terms

[](#how-to-use-stable-diffusion)How to use Stable Diffusion
===========================================================

Let’s cover the basics. These are the parameters you’ll see when using Stable Diffusion:

*   [prompt](#prompt)
*   [negative prompt](#negative-prompt)
*   [width and height](#width-and-height)
*   [steps](#number-of-inference-steps) (or number of inference steps)
*   [guidance scale](#guidance-scale) (classifier-free guidance scale, or CFG scale)
*   [seed](#seed)
*   [scheduler](#scheduler-or-sampler) (or sampler)
*   [batch size](#batch-size)

[](#prompt)Prompt
-----------------

The most important parameter is the prompt. It’s a text prompt that tells the model what image to generate.

Generally you should:

*   use comma separated terms (do not prompt Stable Diffusion like you would talk to ChatGPT)
*   put the most important thing first
*   keep your prompt within 75 tokens (or about 60 words)

Example prompts:

*   a photo of a cat, photography, studio portrait, 50mm lens
*   an oil painting of a cat, abstract, impressionism, 1920s

Input

prompt a photo of a cat, photography, studio portrait, 50mm lens

width 768

height 768

seed 31300

Output

![](https://replicate.delivery/pbxt/QLisWY7Vf93KDqORm2s8bwy3HP1x51AjMP9Lsg2Jpjn5zFAJA/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=2ozzqilb7znwn2th32int47n3y)

[](#negative-prompt)Negative prompt
-----------------------------------

A negative prompt is a list of all the things you don’t want in your image. Write it in the same way you would a normal prompt: comma separated terms, with the most important thing first.

If you’re asking for a ‘photo of a cat’, and you’re getting back results that look like paintings or illustrations instead of a photo, put ‘painting, illustration’ in your negative prompt.

Let’s take our previous cat example and add a negative prompt to see the difference. Imagine that we didn’t want a brown cat, and we didn’t want a cat that looked so serious, so we’ll use the negative prompt: ‘brown cat, serious’:

Input

prompt a photo of a cat, photography, studio portrait, 50mm lens

negative\_prompt brown cat, serious

width 768

height 768

seed 31300

Output

![](https://replicate.delivery/pbxt/qXZsX958q9ZUMp1zenNnsMTTohHpUYuIfA5xuDCb3UGGrLASA/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=5ubk4b3buvwmnngschsecj5hwq)

[](#width-and-height)Width and height
-------------------------------------

For [Stable Diffusion 1.5](https://replicate.com/stability-ai/stable-diffusion/versions/b3d14e1cd1f9470bbb0bb68cac48e5f483e5be309551992cc33dc30654a82bb7), outputs are optimised around 512x512 pixels. Many common fine-tuned versions of SD1.5 are optimised around 768x768.

The best resolutions for common aspect ratios are typically:

*   1:1 (square): 512x512, 768x768
*   3:2 (landscape): 768x512
*   2:3 (portrait): 512x768
*   4:3 (landscape): 768x576
*   3:4 (portrait): 576x768
*   16:9 (widescreen): 912x512
*   9:16 (tall): 512x912

For [SDXL](https://replicate.com/stability-ai/sdxl), outputs are optimised around 1024x1024 pixels. The best resolutions for common aspect ratios are typically:

*   1:1 (square): 1024x1024, 768x768
*   3:2 (landscape): 1152x768
*   2:3 (portrait): 768x1152
*   4:3 (landscape): 1152x864
*   3:4 (portrait): 864x1152
*   16:9 (widescreen): 1360x768
*   9:16 (tall): 768x1360

Width and height must be divisible by 8.

If you want to generate images larger than this, we recommend using an upscaler.  
[View our collection of upscaling models](https://replicate.com/collections/super-resolution).

[](#number-of-inference-steps)Number of inference steps
-------------------------------------------------------

This is the number of steps the model will take to generate your image.

A larger number of steps increases the quality of the output but it takes longer to generate.

For vanilla SDXL and Stable Diffusion 1.5 you should start with a value of about 20 steps. Don’t go too high though, because after a point each step helps less and less. 50 steps is a good maximum.

Recent models like SDXL Turbo and SD Turbo can generate high quality images in just a single step, making them exceptionally fast.

[](#seed)Seed
-------------

A seed is a number used to initialize randomness for the model. By setting a seed, you can get the same output every time.

If you find an image you like but want to tweak it or improve quality, you can use the same seed and change other parameters.

For example, keep the same seed and:

*   increase the number of steps to improve quality
*   tweak the prompt to tweak the image
*   experiment with guidance scale

If you have a fixed seed but change the width or height of the image, then you will not see consistent results.

[](#guidance-scale)Guidance scale
---------------------------------

The guidance scale tells the model how similar the output should be to the prompt. Start with a value of 7 or 7.5.

If your outputs aren’t matching your prompt as much as you’d like, try increasing this number. If you want the AI to be more creative, lower it.

SDXL Turbo and SD Turbo do not use a guidance scale. If the tool you use has an option for it, set it to 0.

[](#scheduler-or-sampler)Scheduler (or sampler)
-----------------------------------------------

Choosing a scheduler is an advanced parameter. They play a critical role in determining how the noise is incrementally reduced (denoising) to form the final output.

Many users will have a favorite scheduler and stick with it. Most schedulers give similar results, but some can sample faster, while others can get good results in fewer steps.

We recommend starting with Euler or Euler ancestral (EULER\_A), a good scheduler for both SD1.5 and SDXL.

DPM++ 2M Karras is a popular choice among users of AUTOMATIC1111, which is a user interface tool for Stable Diffusion.

[](#batch-size)Batch size
-------------------------

This is the number of images that will be generated at once. A larger batch size needs more memory, but time per image is usually reduced.

The number of images you can batch at once is limited by the memory available.

On Replicate, SDXL image generation is limited to batches of 4.

Newer models that produce images in fewer steps also use less memory, and can batch more images at once.

[](#image-to-image-img2img-with-stable-diffusion)Image to image (img2img) with Stable Diffusion
===============================================================================================

Use image-to-image to take the features and structure of a starting image and reimagine them with a prompt. The colors in your original image will be preserved.

Input

\_image https://replicate.delivery/pbxt/JF3foGR90vm9BXSEXNaYkaeVKHYbJPinmpbMFvRtlDpH4MMk/out-0-1.png

prompt A rainbow coloured tiger

prompt\_strength 0.65

Output

![](https://replicate.delivery/pbxt/YhL0f6v0tfhmlEjce0iA2jFLW5vuKDbUh69FYNjnfQEXhMPFB/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=ks4e2jdb6zef4xodz3mz5utuu4)

[](#prompt-strength-or-denoising-strength)Prompt strength (or denoising strength)
---------------------------------------------------------------------------------

This only applies to [image-to-image](/guides/stable-diffusion/image-to-image) and [inpainting](/guides/stable-diffusion/inpainting) generations.

It determines how much of your original image will be changed to match the given prompt.

Higher numbers change more of the image, lower numbers keep the original image intact. Values between 0.5 and 0.75 give a good balance.

When inpainting, setting the prompt strength to 1 will create a completely new output in the inpainted area.

### [](#using-prompt-strength-095)Using prompt strength 0.95

In this example we’ve increased the prompt strength. You can see that the image has changed a lot, it matches the prompt more closely and our original cat is very much a tiger.

Input

\_image https://replicate.delivery/pbxt/JF3foGR90vm9BXSEXNaYkaeVKHYbJPinmpbMFvRtlDpH4MMk/out-0-1.png

prompt A rainbow coloured tiger

prompt\_strength 0.95

Output

![](https://replicate.delivery/pbxt/2Ciq0JPAzsaeByfEf4lCJ1RIVaIzcmUc11YvSCRqNz4eMtAIB/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=bxk3d73bogowdc5weimqfscg5u)

### [](#using-prompt-strength-045)Using prompt strength 0.45

If we do the opposite, and reduce the prompt strength, you can see that much more of the original image is preserved. Our cat has only slightly changed, and it’s showing minor tiger-like features.

Input

\_image https://replicate.delivery/pbxt/JF3foGR90vm9BXSEXNaYkaeVKHYbJPinmpbMFvRtlDpH4MMk/out-0-1.png

prompt A rainbow coloured tiger

prompt\_strength 0.45

Output

![](https://replicate.delivery/pbxt/jbi69TxeLemXTULBy2mPoNmZsu04hTNRGr1ThufjEfex6bBQC/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=l4vbzzlbgqmkal7kj4j6ag3ahe)

[](#inpainting-with-stable-diffusion)Inpainting with Stable Diffusion
=====================================================================

Inpainting is like an AI-powered erasing and painting tool.

It can be used to:

*   remove unwanted objects from an image
*   replace or change existing objects in an image
*   fix ugly or broken parts of a previously generated image
*   expand the canvas of an image ([outpainting](outpainting))

It is similar to [image-to-image](/guides/stable-diffusion/image-to-image).

Input

prompt An orange cat sitting on a bench

prompt\_strength 0.8

image https://replicate.delivery/pbxt/JF3LddQgRiMM9Q4Smyfw7q7BR9Gn0PwkSWvJjKDPxyvr8Ru0/cool-dog.png

mask https://replicate.delivery/pbxt/JF3Ld3yPLVA3JIELHx1uaAV5CQOyr4AoiOfo6mJZn2fofGaT/dog-mask.png

seed 47363

Output

![](https://replicate.delivery/pbxt/p6Pt5qCuQGYGDxzAbB3goyeFguncwZ8EPj8Ncl7JPhCZa5pIA/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=faz67o3bvxmrr5ydw7yhustwfq)

Note

Check out [inpainter.app](https://inpainter.app/) and [outpainter.app](https://outpainter.app) to play around with interactive interfaces for inpainting and outpainting.

[](#prompt-strength-and-inpainting)Prompt strength and inpainting
-----------------------------------------------------------------

You can use the ‘prompt strength’ parameter to change how much the starting image guides the area being inpainted.

A value of 0.65 will keep the same colors and some of the structure that was there before, but will also generate new content based on the prompt.

Setting prompt strength to 1 will completely ignore the original image and only generate new content.

In the example below, you can see the difference – the cat is no longer dependent on the white-ish color of the dog – it is now much more orange as specified in the prompt.

Input

prompt An orange cat sitting on a bench

prompt\_strength 1

image https://replicate.delivery/pbxt/JF3LddQgRiMM9Q4Smyfw7q7BR9Gn0PwkSWvJjKDPxyvr8Ru0/cool-dog.png

mask https://replicate.delivery/pbxt/JF3Ld3yPLVA3JIELHx1uaAV5CQOyr4AoiOfo6mJZn2fofGaT/dog-mask.png

seed 47363

Output

![](https://replicate.delivery/pbxt/J1m8eezhsLgvX0ahVNuPhdu8cGDqeLvf31D3mhPAfHnuf8CgE/out-0.png)

[Tweak it](https://replicate.com/stability-ai/sdxl?prediction=h72xoj3b2iyohtytm5khofvgeu)

In this guide, we’ve covered how to use inpainting to remove unwanted objects from an image, replace or change existing objects in an image, and fix ugly or broken parts of a previously generated image. But you can also use it to expand the canvas of an image. Check out the [outpainting guide](outpainting) to learn more about that process.

[](#inpainting-vs-outpainting)Inpainting vs outpainting
-------------------------------------------------------

Outpainting expands the canvas of an image. Consider a portrait photo where the top of the head is cropped out. Outpainting can be used to generate the missing part of the head.

It’s very similar to inpainting. But instead of generating a region within an existing image, the model generates a region outside of it. [Learn more about outpainting](outpainting).

[](#outpainting-with-stable-diffusion)Outpainting with Stable Diffusion
=======================================================================

Outpainting is the process of using an image generation model like Stable Diffusion to extend beyond the canvas of an existing image. Outpainting is very similar to [inpainting](inpainting), but instead of generating a region _within_ an existing image, the model generates a region _outside_ of it.

Here’s an example of an outpainted image:

Input

Output

![source image](/_content/assets/indigo-input.Bqw0dPC-_3Q0fr.webp)

![output image](/_content/assets/indigo-output.B861-YY0_a3aB2.webp)

In this guide, we’ll walk you through the process of creating your own outpainted images from scratch using Stable Diffusion SDXL.

Note

Check out [outpainter.app](https://outpainter.app) to easily generate your own outpainted images.

[](#the-outpainting-process)The outpainting process
---------------------------------------------------

At a high level, outpainting works like this:

1.  Choose an existing image you’d like to outpaint.
2.  Create a **source image** that places your original image within a larger canvas.
3.  Create a black and white **mask image**.
4.  Use your source image, your mask image, and a **text prompt** as inputs to Stable Diffusion to generate a new image.

[

Watch our inpainting and outpainting guide on YouTube

](https://www.youtube.com/embed/YWSBGP6FR-s)

[](#step-1-find-an-existing-image)Step 1: Find an existing image
----------------------------------------------------------------

The first step is to find an image you’d like to outpaint. This can be any image you want, like a photograph, a painting, or an image generated by an AI model like Stable Diffusion.

Here’s an example of an image to outpaint, an AI-generated armchair in the shape of an avocado:

![source image](/_content/assets/avocado-armchair-original.DI9BstXE_ZyVncz.webp)

The image here has square dimensions, but your image can have any aspect ratio.

[](#step-2-create-a-source-image)Step 2: Create a source image
--------------------------------------------------------------

Once you’ve found an image you want to outpaint, you need to place it within a larger canvas so the image model will have space to paint around it. You can do this with traditional raster image editing software like Photoshop or GIMP, but since you won’t actually be doing any manual bitmap-based editing of the image, you can also use web-based vector drawing tools like [Figma](https://www.figma.com/) or [Canva](https://www.canva.com/) to achieve the same result.

Create a new square image, and place your original image within it. 1024x1024 is ideal if you’re using the [SDXL version of Stable Diffusion](#the-models), as you will in this guide. For more info about image sizing and dimensions, see the docs on [width and height](how-to-use#width-and-height).

In the example image below, there’s a checkboard pattern to indicate the “transparent” parts of the canvas that will be outpainted, but the checkboard is not actually neccessary. You can choose any color you like for the surrounding canvas, but it’s a good idea to choose a color that’s similar to the color of the image you’re outpainting. This will help the model generate a more seamless transition between the original image and the outpainted region.

It should look something like this:

![source image](/_content/assets/avocado-armchair-with-canvas.BAJaLMq5_Z1GCU0l.webp)

☝️ Here the original image is centered in the middle of the canvas, but you can place it anywhere you like depending on which part of the canvas you’d like to outpaint. These are also perfectly valid arrangements:

![source image](/_content/assets/avocado-armchair-alternate-canvases.VBRx2n8Q_JX651.webp)

Save this image as a JPG or PNG file. Give it a name like `outpainting-source.jpg` or `outpainting-source.png` so you can easily identify it later.

[](#step-3-create-a-mask-image)Step 3: Create a mask image
----------------------------------------------------------

Next, you’ll generate a mask image. This is a black and white image that tells the model which parts of the image to preserve, and which parts to generate new content for. Again you can use any image editing tool you like do to do this, as long as it can save JPG or PNG files.

Use the same dimensions for your mask image as you did for your source image: 1024x1024 square. The mask image should be black and white, with the black areas representing the parts of the image you want preserve, and the white areas representing the parts of the image you want to generate new content for.

If you can’t easily remember which parts should be black and which should be white, try asking ChatGPT to [create a mnemonic for you](https://chat.openai.com/share/d49703ef-185b-4d17-91fb-34a2bbde8695). Here’s one:

> Keep the Night, Replace the Light

For our centered avocado armchair, the mask image should look something like this:

![source image](/_content/assets/avocado-armchair-mask.C60o53pg_Z2iotnV.webp)

☝️ **Important!** Be sure to draw your mask slightly smaller than the source image. This will help the model generate a more seamless visual transition between the original image and the outpainted region. It will also prevent an unwanted visible line from being drawn between the original image and the outpainted region.

Save this image as a JPG or PNG file. Give it a name like `outpainting-mask.jpg` or `outpainting-mask.png` so you can easily identify it later.

[](#step-4-generate-the-outpainted-image)Step 4: Generate the outpainted image
------------------------------------------------------------------------------

Now that you’ve generated your source image and mask image, you’re ready to generate the outpainted image. There are many models that support outpainting, but in this guide you’ll use the [SDXL version of Stable Diffusion](#the-models) to generate your outpainted image.

The inputs you’ll provide to stable diffusion are:

*   `prompt`: A short string of text describing the image you’d like to generate. To see what your avocado armchair would look like if it were in a larger room, use a prompt like “an armchair in a room full of plants”.
*   `image`: The source image you created in step 2.
*   `mask`: The mask image you created in step 3.

### [](#use-replicates-web-interface)Use Replicate’s web interface

To generate your outpainted image using Replicate’s web interface, follow [this link](https://replicate.com/stability-ai/sdxl/versions/610dddf033f10431b1b55f24510b6009fcba23017ee551a1b9afbc4eec79e29c?prediction=faz67o3bvxmrr5ydw7yhustwfq), replacing the `image`, `mask`, and `prompt` inputs with your own values. The web UI makes it easy to drag and drop your image and mask files right into the browser window.

### [](#use-replicates-api)Use Replicate’s API

To generate your outpainted image using Replicate’s API, you can use [whatever programming language you prefer](https://replicate.com/docs/reference/client-libraries), but in this guide we’ll use Python.

Start by [setting up the Python client](https://replicate.com/docs/get-started/python), then run this code:

```python
import replicate
output = replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  input={
    "prompt": "an armchair in a room full of plants",
    "image": open("path/to/outpainting-source.jpg", "rb"),
    "mask": open("path/to/outpainting-mask.jpg", "rb")
  }
)
# Save the outpainted image
with open('outpainted.png', 'wb') as f:
    f.write(output[0].read())
```

The resulting image should look something like this:

![source image](/_content/assets/avocado-armchair-outpainted.Yv6wIRJH_SEAzR.webp)

Now that you’ve generated your first outpainted image, it’s time to iterate. Refine the prompt, adjust the mask, and try again. This is where the API really shines, because you can easily write code to run the model multiple times with different inputs to see what works best.

Happy outpainting!

[](#fine-tuning-stable-diffusion)Fine-tuning Stable Diffusion
=============================================================

You can fine-tune Stable Diffusion on your own images to create a new version of the model that is better at generating images of a person, object, or style.

For example, we’ve fine-tuned SDXL on:

*   [Apple Emojis](https://replicate.com/fofr/sdxl-emoji)
*   [the Barbie movie](https://replicate.com/fofr/sdxl-barbie)
*   [Tron: Legacy](https://replicate.com/fofr/sdxl-tron)
*   [Apple Vision Pro](https://replicate.com/fofr/sdxl-vision-pro)

[](#types-of-fine-tune)Types of fine-tune
-----------------------------------------

There are multiple ways to fine-tune Stable Diffusion, such as:

*   Dreambooth
*   LoRAs (Low-Rank Adaptation)
*   Textual inversion

Each of these techniques need just a few images of the subject or style you are training. You can use the same images for all of these techniques. 5 to 10 images is usually enough.

### [](#dreambooth)Dreambooth

Dreambooth is a full model fine-tune that produces checkpoints that can be used as independent models. These checkpoints are typically 2GB or larger.

Read our blog post for a guide on [using Replicate for training Stable Diffusion with Dreambooth](https://replicate.com/blog/dreambooth-api).

Google Research [announced Dreambooth in August 2022](https://dreambooth.github.io/) ([read the paper](https://arxiv.org/pdf/2208.12242.pdf)).

### [](#loras-low-rank-adaptation)LoRAs (Low-Rank Adaptation)

LoRAs are faster to tune and more lightweight than Dreambooth. As small as 1-6MB, they are easy to share and download.

LoRAs are a general technique that accelerate the fine-tuning of models by training smaller matrices. These then get loaded into an unchanged base model to apply their affect. In [February 2023 Simo Ryu published](https://github.com/cloneofsimo/lora) a way to fine-tune diffusion models like Stable Diffusion using LoRAs.

You can also use a `lora_scale` to change the strength of a LoRA.

### [](#textual-inversion)Textual inversion

Textual inversion does not modify any model weights. Instead it focuses on the text embedding space. It trains a new token concept (using a given word) that can be used with existing Stable Diffusion weights ([read the paper](https://arxiv.org/pdf/2208.01618.pdf)).

[](#fine-tuning-sdxl-using-replicate)Fine-tuning SDXL using Replicate
---------------------------------------------------------------------

You can fine-tune SDXL using Replicate – these fine-tunes combine LoRAs and textual inversion to create high quality results.

There are two ways to fine-tune SDXL on Replicate:

1.  Use the [Replicate website](https://replicate.com/stability-ai/sdxl/train) to start a training, you can change the most important training parameters
2.  Use the [Replicate API](https://replicate.com/blog/fine-tune-sdxl) to train with the full range of training parameters

Whichever approach you choose, you’ll need to prepare your training data.

### [](#prepare-your-training-images)Prepare your training images

When running a training you need to provide a zip file containing your training images. Keep the following guidelines in mind when preparing your training images.

Images should contain only the subject itself, without background noise or other objects. They need to be in JPEG or PNG format. Dimensions, file size and filenames don’t matter.

You can use as few as 5 images, but 10-20 images is better. The more images you use, the better the fine-tune will be. Small images will be automatically upscaled. All images will be cropped to square during the training process.

Put your images in a folder and zip it up. The directory structure of the zip file doesn’t matter:

```shell
zip -r data.zip data
```

### [](#watch-the-api-fine-tuning-guide-on-youtube)Watch the API fine-tuning guide on YouTube

[Watch the fine-tuning guide on YouTube](https://www.youtube.com/watch?v=xsa-_ZE9S7I)

### [](#use-the-replicate-cli-to-start-a-training)Use the Replicate CLI to start a training

This guide uses the Replicate CLI to start the training, but if you want to use something else you can use [a client library](/docs/reference/client-libraries) or [call the HTTP API directly](https://replicate.com/docs/reference/http#trainings.create).

Let’s start by installing the [Replicate CLI](https://github.com/replicate/cli):

```shell
brew tap replicate/tap
brew install replicate
```

Grab your API token from replicate.com/account and set the REPLICATE\_API\_TOKEN environment variable.

```plaintext
export REPLICATE_API_TOKEN=...
```

You need to create a model on Replicate – it will be the destination for your trained SDXL version:

```shell
# You can also go to https://replicate.com/create
replicate model create yourname/model --hardware gpu-a40-small
```

Now you can start your training:

```shell
replicate train stability-ai/sdxl \
 --destination yourname/model \
 --web \
 input_images=@data.zip
```

The `input_images` parameter is required. You can pass in a URL to your uploaded zip file, or use the `@` prefix to upload one from your local filesystem.

See the [training inputs on the SDXL model](https://replicate.com/stability-ai/sdxl/train) for a full list of training options.

Visit [replicate.com/trainings](https://replicate.com/trainings) to follow the progress of your training job.

### [](#run-the-model)Run the model

When the model has finished training you can run it using replicate.com/my-name/my-model, or via the API:

```python
output = replicate.run(
    "my-name/my-model:abcde1234...",
    input={"prompt": "a photo of TOK riding a rainbow unicorn"},
)
# Save the generated image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

The trained concept is named `TOK` by default, but you can change that by setting `token_string` and `caption_prefix` inputs during the training process.

### [](#how-we-prepare-data-for-training)How we prepare data for training

Before fine-tuning starts, the input images are preprocessed using multiple models:

*   [SwinIR](https://replicate.com/jingyunliang/swinir) upscales the input images to a higher resolution.
*   [BLIP](https://replicate.com/salesforce/blip) generates text captions for each input image.
*   [CLIPSeg](https://github.com/timojl/clipseg) removes regions of the images that are not interesting or helpful for training.

For most users, the captions that BLIP generates for training work well. However, you can provide your own captions by adding a `caption.csv` file to your zip file of input images. Each image needs a caption. [Here’s an example csv](https://github.com/replicate/cog-sdxl/blob/main/example_datasets/monster/caption.csv).

[](#using-controlnet-with-stable-diffusion)Using ControlNet with Stable Diffusion
=================================================================================

ControlNet is a method for conforming your image generations to a particular structure. It’s easiest explained by an example.

Let’s say you wanted to create an image of a particular pose—a photo like the man below, but we want a boy doing it.

![a man in a suit](/_content/assets/man.Cnx4qr9b_HYhB8.webp)

This is a really hard problem with default stable diffusion. We could try a prompt that describes our desired pose in detail, like this:

`a photo of a boy wearing a blue jacket looking to his right with his left arm slightly above his right`

But this probably isn’t going to work. Our outputs aren’t going to conform to all these instructions, and even if we got lucky and they did, we won’t be able to consistently generate this pose. (why? — my guess is because the decoder can only conform to so much? or maybe this is possible, it’s just a pain?)

Enter ControlNet. ControlNet models accept two inputs:

A text prompt: `a boy wearing a blue jacket`

And a `conditioning image`. There are lots of types, but for now let’s use a stick figure (often called `human pose`):

![stick figure](/_content/assets/stick.CuXy7Ft1_ZwBHlc.webp)

The model then uses our pose to conform/shape/control our image into our desired structure:

![boy](/_content/assets/boy.C0pvqhSl_FeUNJ.webp)

Let’s try changing our prompt, but keep the pose input the same:

“chef in kitchen”

![chef](/_content/assets/chef.CHv0HaWi_1pzu4J.webp)

“Lincoln statue”

![lincoln](/_content/assets/lincoln.CjiRK4uM_vI5w.webp)

Source: [ControlNet paper](https://arxiv.org/abs/2302.05543)

And voila! We can create all kinds of images that are guided by the stick figure pose.

That’s the essence of ControlNet. We always provide two inputs: a `text prompt` (just like normal Stable Diffusion) and a `conditioning image`. The output is guided by our conditioning image.

![diagram](/_content/assets/nutshell.CRiQuHjx_2qyP1p.webp)

Importantly, the conditioning image isn’t restricted to stick figure poses. We can provide all kinds of custom compositions for the ControlNet model to follow, like edges, depths, scribbles, segmentation and many other structures. More on that later.

[](#how-does-controlnet-work)How does ControlNet work?
------------------------------------------------------

ControlNet was created by Stanford researchers and announced in the paper [Adding Conditional Control to Text-to-Image Diffusion Models](https://arxiv.org/pdf/2302.05543.pdf).

It’s trained on top of stable diffusion, so the flexibility and aesthetic of stable diffusion is still there.

I don’t want to go too in depth, but training ControlNet involves using conditioning images to teach the model how to generate images according to specific conditions. These conditioning images act like guidelines or templates. For example, if the model is to learn how to generate images of cats, it might be trained with a variety of images showing cats in different poses or environments. Alongside these images, text prompts are used to describe the scene or the object. This combination of visual and textual input helps the model understand not just what to draw (from the text) but also how to draw it (from the conditioning images).

To learn more, [check out the paper](https://arxiv.org/pdf/2302.05543.pdf). Or do what I did, and upload the paper to ChatGPT and ask it a bunch of questions.

[](#types-of-conditioning-images)Types of conditioning images
-------------------------------------------------------------

Note

Watch this section on [YouTube](https://www.youtube.com/watch?v=GVCZHCLWON8&t=294s)

There are many types of `conditioning_image`’s we can use in ControlNet. We’re not restricted to our human pose. We can guide our images using edge detectors, depth maps, segmentation, sketchs, and more.

![types](/_content/assets/types.BjygEO9l_2hPNyn.webp)

The best way to see how each of these work is by example.

Let’s run a selection of conditioners on the following two images with completely new prompts.

_Cyberpunk Couple_ New prompt:

```plaintext
a portrait photo of a thirtysomething
couple embracing, summer clothes,
color photo, 50mm prime, canon, studio
portrait
```![couple](/_content/assets/couple.Cat8qHS8_Z24B7Cw.webp)

_Tea Room_ New prompt:

```plaintext
a photo of a beautiful cyberpunk
cafe, dawn light, warm tones,
morning scene, windows
```![tea](/_content/assets/tearoom.DI-QL2Dr_URpSI.webp)

Let’s see what happens when we apply different ControlNets on these two images. In other words, let’s go through this process for each type of conditioner:

![process](/_content/assets/process.CNDRe2SS_ZY0cwh.webp)

### [](#canny--edge-detection)Canny — Edge detection

[Canny](https://en.wikipedia.org/wiki/Canny_edge_detector) is a widely used edge detector.

Here’s our tea room after going through the Canny pre-processor:

![tearoom](/_content/assets/tearoom.DI-QL2Dr_URpSI.webp) ![canny](/_content/assets/canny.DiGJ91o__vmTOj.webp)

Remember our prompt from earlier?

```plaintext
"a photo of a beautiful cyberpunk
cafe, dawn light, warm tones,
morning scene, windows"
```

Now, when we generate an image with our new prompt, ControlNet will generate an image based on this prompt, but guided by the Canny edge detection: Result

![result](/_content/assets/canny-room.k7DL88Db_Z1S6CJx.webp)

Here’s that same process applied to our image of the couple, with our new prompt:

![couple1](/_content/assets/canny-couple.BOC3CDei_1xfHRn.webp)

### [](#hed--fuzzy-edge-detection)HED — Fuzzy edge detection

HED is another kind of edge detector. Here’s our pre-processed output:

![tearoom](/_content/assets/tearoom.DI-QL2Dr_URpSI.webp) ![hed-room](/_content/assets/hed-room.wzmsmfJS_1cpt7m.webp)

And here’s our output:

![hed-room output](/_content/assets/hed-room-output.CkdiWQgu_2fuPXB.webp)

The effect of HED is a bit more clear on our cyberpunk couple:

![hed couple](/_content/assets/hed-couple.BXYqIjAo_1U4w7p.webp)

Note that many details that were lost in the Canny version are present in HED detection, like her hand placement, the angle of the overhead light, and her headpiece. Note also where HED struggles—his collar becomes a streak of hair, and her makeup becomes a shadow. HED works really well for painting and art.

### [](#m-lsd--straight-line-detection)M-LSD — Straight line detection

M-LSD is another kind of edge detection that only works on straight lines. Here’s M-LSD on our tea room:

![tea3](/_content/assets/mlsd-room.CKA_-Wpq_Z1N1j0t.webp) ![mlsd](/_content/assets/mlsd-room-output.BHhTX89B_FV0hk.webp)

And on our cyberpunk couple:

![mlsd-couple](/_content/assets/mlsd-couple.1D_YH2IS_4RQ3y.webp)

As you can tell, M-LSD doesn’t work well here—there aren’t many straight lines in the original.

### [](#depth-map)Depth Map

A depth map works by simulating the distance of parts of the image from the camera. Here’s what it looks like:

![tearoom](/_content/assets/tearoom.DI-QL2Dr_URpSI.webp) ![depth room](/_content/assets/depth-room.BBSKFrm1_Z18Qnsd.webp) ![depth room output](/_content/assets/depth-room-output.Df5VLurq_Z2b0V8Q.webp)

This works really well on our tea room. The frames, plants, tables and pillows are all preserved. Let’s try it on our couple:

![depth couple](/_content/assets/depth-couple.C4QsmlhA_UJfUr.webp)

Again, the composition is preserved, but it struggles with the collar and hands.

### [](#open-pose-aka-human-pose)Open pose (aka Human pose)

This one should be familiar to you! Open pose/human pose turns images of people into stick figures. Let’s try it on our couple:

![pose couple](/_content/assets/pose-couple.CFALMcod_1eJ92q.webp)

The colored bars are representations of the body parts of our characters. You can see that the poses are preserved, but the detail and style is lost.

### [](#scribble)Scribble

Scribble is behind the very popular “turn a sketch into a drawing” apps. I’m going to use a different example for scribble, because it works best with a doodle input conditioner. For example, here’s a doodle of a cat alongside my text prompt, “an oil painting of a cat”:

![cat](/_content/assets/scribble-cat.DUfDejLG_ZihFkm.webp)

Here’s the same with an owl:

![owl](/_content/assets/scribble-owl.zTh1lup-_29eXic.webp)

### [](#segmentation)Segmentation

Segmentation breaks our image down into different segments.

![tearoom](/_content/assets/tearoom.DI-QL2Dr_URpSI.webp) ![segment room](/_content/assets/segment-room.z3VArVVw_Z1pQz8z.webp) ![segment room output](/_content/assets/segment-room-output.BjHza-e1_GHTTM.webp)

We’ve maintained the plants, the frames, and the table, but the output is quite different. There’s a bit of a fish eye effect, and we’ve lost the pillars in the cafe. Here’s segmentation on our couple.

![segment couple](/_content/assets/segment-couple.P2-zb5FQ_2qpYA0.webp)

### [](#normal-map)Normal map

A normal map detects the texture of an image.

![tearoom](/_content/assets/tearoom.DI-QL2Dr_URpSI.webp) ![segment room](/_content/assets/map-room.BbOILJfm_Z11mYwT.webp) ![segment room output](/_content/assets/map-room-output.Bb2l6lMB_Z2rutMl.webp)

This is a nice output, but it doesn’t preserve our original input at all. A normal map works much better on our couple:

![segment room output](/_content/assets/map-couple.rfm4SIJu_1xj3bO.webp)

[](#how-to-use-controlnet)How to use ControlNet
-----------------------------------------------

Using ControlNet is easy with Replicate . We have a collection of ControlNet models [here](https://replicate.com/collections/control-net).

![collection](/_content/assets/collection.DJVWSJOB_ZVSqsi.webp)

You can get started by choosing a ControlNet model and playing around with it in our GUI. If you’re a developer and want to integrate ControlNet into your app, click the API tab and you’ll be able to copy and paste the API request into your codebase. Happy hacking!

![gui](/_content/assets/canny-gui.To-wMIbA_1pwzlR.webp)

[](#fast-stable-diffusion-turbo-and-latent-consistency-models-lcms)Fast Stable Diffusion: Turbo and latent consistency models (LCMs)
====================================================================================================================================

You might have noticed that Stable Diffusion is now fast. Very fast. 8 frames per second, then 70fps, now reports of over 100fps, on consumer hardware.

Today you can do realtime image-to-image painting, and write prompts that return images before you’re done typing. There’s a whole new suite of applications for generative imagery. And other models, like text-to-video, will soon apply these techniques too.

In this guide we’ll aim to explain the different models, terms used and some of the techniques that are powering this speed-up.

Let’s start with latent consistency models, or LCMs. They started it all, and they brought about the first realtime painting apps, like Krea AI popularised.

[](#latent-consistency-models-lcm)Latent consistency models (LCM)
-----------------------------------------------------------------

In October 2023, Simian Luo et al. released the first latent consistency model and we [blogged about how to run it on a Mac and make 1 image per second](https://replicate.com/blog/run-latent-consistency-model-on-mac). You can also [run it on Replicate](https://replicate.com/fofr/latent-consistency-model).

What made it so fast is that it needs only 4 to 8 steps to make a good image. This compares with 20 to 30 for regular Stable Diffusion. LCMs can do this because they are designed to directly predict the reverse diffusion outcome in latent space. Essentially, this means they get to the good pictures faster. [Dig into their research paper](https://arxiv.org/abs/2310.04378) if you want to learn more.

The latent consistency model that was released, the one based on a Stable Diffusion 1.5 finetune called Dreamshaper, is very fast. But what about other models? How can we speed them up?

One of the big drawbacks with LCMs is the way these models are made – in a process called distillation. The LCM must be distilled from a pre-trained text to image model. Distillation is a training process that needs ~650K text-image pairs and 32 hours of A100 compute. The authors distillation code also hasn’t been released.

LoRAs to the rescue.

[](#lcm-loras)LCM LoRAs
-----------------------

In November 2023, a new innovation followed – [Huggingface blogged](https://huggingface.co/blog/lcm_lora) about a way to get all the benefits of LCM for any Stable Diffusion model or fine-tune, without needing to train a new distilled model. [Full details are in their paper](https://huggingface.co/latent-consistency/lcm-lora-sdxl/resolve/main/LCM-LoRA-Technical-Report.pdf).

They did this by training an “LCM LoRA”. A much faster training process that can capture the speed-ups of LCM by training just a few LoRA layers.

You can experiment with these LoRAs using models on Replicate:

*   [SDXL + LCM LoRA](https://replicate.com/lucataco/sdxl-lcm)
*   [SDXL + LCM LoRA with controlnet](https://replicate.com/fofr/sdxl-lcm-multi-controlnet-lora)

Suddenly we have very fast 4 step inference for SDXL, SD 1.5, and all the fine tunes that go with them. On a Mac, where a 1024x1024 image would take upwards of 1 minute, it’s now ready in just 6 seconds.

There is a downside though. The images these LCM LoRAs generate are lower quality, and need more specific prompting to get good results.

You also need to use a guidance scale of 0 (ie turning it off) or between 1 and 2. Go outside of these ranges and your images will look terrible.

### [](#wait-arent-loras-used-for-styles-and-object-fine-tuning)Wait, aren’t LoRAs used for styles and object fine-tuning?

Yes. They both use the same LoRA approach, but to achieve different goals. One changes an image style, the other makes images faster.

LoRA (Low-Rank-Adaptation) is a general technique that accelerates the fine-tuning of models by training smaller matrices. These then get loaded into an unchanged base model to apply their affect.

[](#sdxl-turbo-and-sd-turbo)SDXL Turbo and SD Turbo
---------------------------------------------------

On November 28 2023 [Stability AI announced “SDXL Turbo”](https://stability.ai/news/stability-ai-sdxl-turbo) (and more quietly its partner, SD Turbo). Now SDXL images can be made in just 1 step. Down from 50 steps, and also down from LCM LoRA’s 4 steps.

> On an A100, SDXL Turbo generates a 512x512 image in 207ms (prompt encoding + a single denoising step + decoding, fp16), where 67ms are accounted for by a single UNet forward evaluation.

Stability AI achieved this using a new technique called [Adversarial Diffusion Distillation (ADD)](https://static1.squarespace.com/static/6213c340453c3f502425776e/t/65663480a92fba51d0e1023f/1701197769659/adversarial_diffusion_distillation.pdf). The adversarial aspect is worth highlighting. During training the model aims to fool a discriminator into thinking its generations are real images. This forces the model to generate real looking images at every step, without any of the common AI distortions or blurriness you get with early steps in traditional diffusion models.

[Read the full research paper](https://static1.squarespace.com/static/6213c340453c3f502425776e/t/65663480a92fba51d0e1023f/1701197769659/adversarial_diffusion_distillation.pdf), where the distillation process is also explained.

You can download the turbo models from Huggingface:

*   [SDXL Turbo](https://huggingface.co/stabilityai/sdxl-turbo)
*   [SD Turbo](https://huggingface.co/stabilityai/sd-turbo)

They can only be used for research purposes.

[](#community-optimisation)Community optimisation
-------------------------------------------------

The generative AI community is already optimising the LCM and turbo models to achieve phenomenal speeds.

X user [cumulo\_autumn has demonstrated 40fps imagery using LCM](https://twitter.com/cumulo_autumn/status/1728768642052182231). Meanwhile [Dan Wood has achieved 77fps with SD Turbo](https://twitter.com/Dan50412374/status/1731215092728148331) and 167 images per second when using batches of 12. All of these are on consumer 4090 GPUs.

[](#a-to-z-of-stable-diffusion)A to Z of Stable Diffusion
=========================================================

[](#a)A
-------

### [](#automatic1111-or-stable-diffusion-web-ui)AUTOMATIC1111 (or Stable Diffusion web-ui)

An [open-source power user interface for Stable Diffusion](https://github.com/AUTOMATIC1111/stable-diffusion-webui). Sometimes referred to as ‘A1111’.

[](#c)C
-------

### [](#classifier-free-guidance-cfg-scale)Classifier-free guidance (CFG) scale

Often used in generative models, it’s used to control the influence of a prompt (or another guiding signal) on a generated output. Higher values will give outputs closer to the prompt, but at the cost of output diversity and creativity.

### [](#controlnet)ControlNet

A model that guides the generation of a new image based on aspects or features of an input image. The type of guidance depends on the ControlNet used. A preprocessor is often needed to convert an input image into a format that can guide the generation process. Used alongside Stable Diffusion.

Examples include:

*   edge detection (canny)
*   depth map
*   segmentation
*   human pose

[Try out ControlNet with SDXL](https://replicate.com/fofr/sdxl-multi-controlnet-lora)  
[Watch a video guide to ControlNet models](https://www.youtube.com/watch?v=GVCZHCLWON8)

[](#d)D
-------

### [](#decoder)Decoder

A neural network component that reconstructs data from encoded representations.

### [](#denoising)Denoising

The step-by-step process of gradually transforming noise into a coherent output.

### [](#denoising-strength-or-prompt-strength)Denoising strength (or prompt strength)

A parameter controlling image alteration in img2img.

Denoising strength controls how much noise is added to the initial image. More noise means more of the original image will change. This gives more opportunity for the diffusion process to match a given prompt (ie prompt strength).

### [](#depth-to-image)Depth-to-image

A depth map is generated from an input image, usually as a preprocessor for a ControlNet model. This depth map is then used to guide the generation of a new image, leading to a new image with a similar structure.

There are different models for generating depth maps, including:

*   Midas
*   Leres
*   Zoe

[Try out depth maps and other ControlNet preprocessors](https://replicate.com/fofr/controlnet-preprocessors)

### [](#diffusion-model)Diffusion model

A diffusion model is a type of generative AI model that transforms random noise into structured data, such as images, audio, or text. It gradually shapes this noise through a series of steps to produce coherent and detailed outputs.

[](#e)E
-------

### [](#embeddings)Embeddings

Embeddings are representations of items like words, sentences, or image features. They are in the form of vectors in a continuous vector space. These representations capture the characteristics or features of the original data, allowing for efficient processing and analysis by AI models.

### [](#encoder)Encoder

A neural network component that compresses data into a compact representation.

### [](#epoch)Epoch

One complete pass of the training dataset through the algorithm. During an epoch, a model has the opportunity to learn from each example in the dataset.

[](#f)F
-------

### [](#fine-tuning)Fine-tuning

Adjusting a pre-trained model for specific tasks or improvements.

Guides:

*   [Fine-tune SDXL](https://replicate.com/blog/fine-tune-sdxl)
*   [Fine-tune MusicGen](https://replicate.com/blog/fine-tune-musicgen)

[](#h)H
-------

### [](#hyperparameter-tuning)Hyperparameter tuning

Hyperparameters define how a model is structured. They can be tuned for better model performance. [A guide to hyperparameter tuning by Jeremy Jordan](https://www.jeremyjordan.me/hyperparameter-tuning/).

[](#i)I
-------

### [](#image-to-image-img2img)Image-to-image (img2img)

Transforming one image into another, often guided by a text prompt. How much an image changes is controlled by the [denoising strength parameter](#denoising-strength-or-prompt-strength).

### [](#inference)Inference

Running a trained model to get an output. In machine learning, and on Replicate, these outputs are called [predictions](#prediction).

### [](#inpainting)Inpainting

Changing specific areas of an image. The areas are specified by a mask.

[An example of inpainting with SDXL](https://replicate.com/p/faz67o3bvxmrr5ydw7yhustwfq)

[](#l)L
-------

### [](#latent-space)Latent space

A high-dimensional space where AI models represent data.

[](#m)M
-------

### [](#model-evaluation)Model evaluation

Assessing the performance of a machine learning model.

[](#n)N
-------

### [](#negative-prompt-1)Negative prompt

A text input specifying what should not appear in a generated output. A text prompt asking for a photo of a cat might be alongside a negative prompt of ‘art, illustration, render’, to avoid getting images of cartoon cats.

[Try using negative prompts with Stable Diffusion XL](https://replicate.com/stability-ai/sdxl)

### [](#neural-network-or-neural-net)Neural network (or neural net)

A system designed to mimic the way human brains analyze and process information. It consists of interconnected nodes that work together to recognize patterns and make decisions based on input data.

Nodes are aggregated into layers. Signals travel from the input layer to the output layer via these hidden layers.

[Learn more about neural networks](https://en.wikipedia.org/wiki/Artificial_neural_network)

[](#o)O
-------

### [](#overfitting)Overfitting

Overtraining. It happens when a model learns its training data too thoroughly. An overfit model will perform poorly on new, unseen data, as it fails to generalize from the specific examples it was trained on.

If you are fine-tuning, try to use a more diverse training dataset or train with fewer steps.

[](#p)P
-------

### [](#prediction)Prediction

Predictions in machine learning refer to the output generated by a model when it is given new, unseen data. Based on the patterns and relationships it has learned during training, the model estimates or forecasts likely outcomes for this new data.

[View your predictions on Replicate](https://replicate.com/predictions)

### [](#prompt-1)Prompt

Text input to a generative AI model describing the desired output.

### [](#prompt-engineering)Prompt engineering

Crafting very good text inputs to guide AI models to better outputs. Often with an understanding of the model’s characteristics and limitations.

[](#s)S
-------

### [](#scheduler-or-sampler-1)Scheduler (or sampler)

An algorithm that determines the denoising process for a diffusion model. They play a critical role in determining how the noise is incrementally reduced (denoising) to form the final output.

They are called schedulers because they determine the noise schedule used during the diffusion process. They are sometimes called samplers because the denoising process creates a sample at each step.

Example schedulers include:

*   Euler
*   DDIM
*   DPM++ 2M Karras

[Learn more about schedulers on HuggingFace](https://huggingface.co/docs/diffusers/api/schedulers/overview#schedulers)

### [](#stable-diffusion)Stable Diffusion

A collection of open-source AI models for text-to-image generation.

*   [Stable Diffusion 1.5](https://replicate.com/stability-ai/stable-diffusion) (SD1.5, August 2022)
*   [Stable Diffusion 2.1](https://replicate.com/cjwbw/stable-diffusion-v2) (SD2.1, December 2022)
*   [Stable Diffusion XL](https://replicate.com/stability-ai/sdxl) (SDXL, July 2023)

### [](#style-transfer)Style transfer

Applying the style of one image to another.

[](#t)T
-------

### [](#text-to-image-generation-txt2img)Text-to-image generation (txt2img)

Generating images from text prompts using AI.

[](#u)U
-------

### [](#u-net)U-Net

A neural network predicting noise in each sampling step in Stable Diffusion.

### [](#upscaling)Upscaling

Increasing image resolution while enhancing details using an AI model.

[](#v)V
-------

### [](#variational-autoencoder-vae)Variational autoencoder (VAE)

A VAE can:

*   encode images into latent space
*   decode latents back into an image

Rather than working with pixels, which would be very slow, many diffusion models work in a [latent space](#latent-space) that is much smaller. This allows them to be more efficient.

During training, training data is encoded into latent space. During inference, the output of the diffusion process is decoded back into an image.

--- END OF make-art-with-stable-diffusion.md ---

