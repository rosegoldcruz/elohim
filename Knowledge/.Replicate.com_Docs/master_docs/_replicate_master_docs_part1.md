
# FILE: nodejs.md

Learn how to run a model on Replicate using Node.js.

This guide includes a quickstart to scaffold a new project with a single command in your terminal, followed by a step-by-step tutorial for setting up a project from scratch. By the end, you’ll have a working Node.js project that can run any model on Replicate.

[](#prerequisites)Prerequisites
-------------------------------

**Node.js 16 or greater:** The simplest way to install Node.js is using the installer at [nodejs.org](https://nodejs.org/).

[](#-quickstart-scaffold-a-project-with-a-one-liner)Quickstart: Scaffold a project with a one-liner
---------------------------------------------------------------------------------------------------

To get up and running as quickly as possible, you can use [create-replicate](https://github.com/replicate/create-replicate), an npm package that creates a project directory for you, writes some starter code, installs the dependencies, and runs the code.

Run the following command to scaffold a new project:

```shell
npx create-replicate
```

That’s it. You should now have a working Node.js project that generates images with the [SDXL](https://replicate.com/stability-ai/sdxl) model using Replicate’s API.

If you want to use a different model than SDXL, specify it when creating your project:

```shell
npx create-replicate --model black-forest-labs/flux-schnell
```

To learn more about scaffolding new Node.js projects, check out the [create-replicate documentation](https://github.com/replicate/create-replicate).

[](#-slowstart-set-up-a-project-from-scratch)Slowstart: Set up a project from scratch
-------------------------------------------------------------------------------------

If you prefer to manually set up your Node.js project step by step, follow the instructions below.

### [](#step-1-authenticate)Step 1: Authenticate

Authenticate by setting your Replicate API token in an environment variable:

```shell
export REPLICATE_API_TOKEN=r8_******
```

### [](#step-2-create-a-new-nodejs-project)Step 2: Create a new Node.js project

```shell
# create the directory
mkdir my-replicate-app
cd my-replicate-app
# set up package.json
npm init -y
npm pkg set type=module
```

### [](#step-3-install-the-replicate-javascript-client)Step 3: Install the Replicate JavaScript client

Use npm to install the [Replicate JavaScript client](https://github.com/replicate/replicate-javascript):

```shell
npm install replicate
```

### [](#step-4-write-some-code)Step 4: Write some code

Create a file called `index.js` and add the following code:

```javascript
import Replicate from "replicate";
const replicate = new Replicate();
console.log("Running the model...");
const [output] = await replicate.run(
  "black-forest-labs/flux-schnell",
  {
    input: {
      prompt: "An astronaut riding a rainbow unicorn, cinematic, dramatic",
    },
  }
);
// Save the generated image
import { writeFile } from "node:fs/promises";
await writeFile("./output.png", output);
console.log("Image saved as output.png");
```

### [](#step-5-run-your-code)Step 5: Run your code

Next, run your code from your terminal:

```shell
node index.js
```

You should see output indicating the model is running and the image has been saved:

```shell
Running the model...
Image saved as output.png
```

[](#next-steps)Next steps
-------------------------

Now you’re up and running on Replicate with Node.js.

In this guide you used the SDXL image generation model, but you can adapt the code to run any model on Replicate. Try [chatting with images using the LLaVa vision model](https://replicate.com/yorickvp/llava-13b?input=nodejs), or [writing AI-generated Python code using CodeLlama](https://replicate.com/meta/codellama-70b-instruct?input=nodejs). There are [thousands of public models](https://replicate.com/explore) on Replicate, and you can run any of them using the project you just created.

[](#further-reading)Further reading
-----------------------------------

*   [Build a website with Next.js](/docs/get-started/nextjs) and deploy it to Vercel
*   [Replicate JavaScript client reference](https://github.com/replicate/replicate-javascript#readme)
*   [setup-replicate documentation](https://github.com/replicate/setup-replicate#readme)
*   [HTTP API reference](https://replicate.com/docs/reference/http)

--- END OF nodejs.md ---


# FILE: google-colab.md

[](#what-is-google-colab)What is Google Colab?
----------------------------------------------

Google Colab is a cloud-based platform that lets you write and execute Python code right from your browser, without having to install anything or worry about setting up Python.

[](#what-are-notebooks)What are notebooks?
------------------------------------------

Colab uses **notebooks**: interactive documents that contain both code and other elements like paragraphs, equations, and images. Notebooks are a great prototyping tool for data scientists, researchers, and developers to create and share documents that contain live working code.

[](#running-replicate-models-on-colab)Running Replicate models on Colab
-----------------------------------------------------------------------

You can run any public Replicate model in a notebook with just a few lines of Python code.

To get started, [check out the Replicate Python notebook](https://colab.research.google.com/drive/1cLthjBaZ6qSRsI5izrgq95tNonRYnvxX)

[![](https://github.com/replicate/cog/assets/2289/d2b4d474-7fa3-4b09-932a-deda4a9cab54)](https://colab.research.google.com/drive/1cLthjBaZ6qSRsI5izrgq95tNonRYnvxX)

--- END OF google-colab.md ---


# FILE: python.md

Learn how to run a model on Replicate from within your Python code. It could be an app, a notebook, an evaluation script, or anywhere else you want to use machine learning.

Tip

Check out an interactive notebook version of this tutorial on [Google Colab](https://colab.research.google.com/drive/1K91q4p-OhL96FHBAVLsv9FlwFdu6Pn3c).

[](#install-the-python-library)Install the Python library
---------------------------------------------------------

We maintain an [open-source Python client](https://github.com/replicate/replicate-python#readme) for the API. Install it with pip:

```plaintext
pip install replicate
```

[](#authenticate)Authenticate
-----------------------------

Generate an API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens), copy the token, then set it as an environment variable in your shell:

```shell
export REPLICATE_API_TOKEN=r8_....
```

[](#run-a-model)Run a model
---------------------------

You can run [any public model](https://replicate.com/explore) on Replicate from your Python code. Here’s an example that runs [black-forest-labs/flux-schnell](https://replicate.com/black-forest-labs/flux-schnell) to generate an image:

```python
import replicate
output = replicate.run(
  "black-forest-labs/flux-schnell",
  input={"prompt": "an iguana on the beach, pointillism"}
)
# Save the generated image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
print(f"Image saved as output.png")
```

[](#using-local-files-as-inputs)Using local files as inputs
-----------------------------------------------------------

Some models take files as inputs. You can use a local file on your machine as input, or you can provide an HTTPS URL to a file on the public internet.

Here’s an example that uses a local file as input to the [LLaVA vision model](https://replicate.com/yorickvp/llava-13b), which takes an image and a text prompt as input and responds with text:

```python
import replicate
image = open("my_fridge.jpg", "rb")
output = replicate.run(
    "yorickvp/llava-13b:a0fdc44e4f2e1f20f2bb4e27846899953ac8e66c5886c5878fa1d6b73ce009e5",
    input={
        "image": image,
        "prompt": "Here's what's in my fridge. What can I make for dinner tonight?"
    }
)
print(output)
# You have a well-stocked refrigerator filled with various fruits, vegetables, and ...
```

[](#using-urls-as-inputs)Using URLs as inputs
---------------------------------------------

URLs are more efficient if your file is already in the cloud somewhere, or it is a large file.

Here’s an example that uses an HTTPS URL of an image on the internet as input to a model:

```python
image = "https://example.com/my_fridge.jpg"
output = replicate.run(
    "yorickvp/llava-13b:a0fdc44e4f2e1f20f2bb4e27846899953ac8e66c5886c5878fa1d6b73ce009e5",
    input={
        "image": image,
        "prompt": "Here's what's in my fridge. What can I make for dinner tonight?"
    }
)
print(output)
# You have a well-stocked refrigerator filled with various fruits, vegetables, and ...
```

[](#handling-output)Handling output
-----------------------------------

Some models stream output as the model is running. They will return an iterator, and you can iterate over that output.

Here’s an example that uses the [Claude 3.7 Sonnet model](https://replicate.com/anthropic/claude-3.7-sonnet) to generate text:

```python
iterator = replicate.run(
  "anthropic/claude-3.7-sonnet",
  input={"prompt": "Who was Dolly the sheep?"},
)
for text in iterator:
    print(text, end="")
# Dolly the sheep was the first mammal to be successfully cloned from an adult cell...
```

[](#handling-file-outputs)Handling file outputs
-----------------------------------------------

Some models generate files as output, such as images or audio. These are returned as `FileOutput` objects, which you can easily save or process:

```python
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "A majestic lion"}
)
# Save the generated image
with open('lion.png', 'wb') as f:
    f.write(output[0].read())
print("Image saved as lion.png")
# Handle multiple outputs
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "A majestic lion", "num_outputs": 2}
)
for idx, file_output in enumerate(output):
    with open(f'output_{idx}.png', 'wb') as f:
        f.write(file_output.read())

```

For more details on handling output files, see [Output Files](/docs/topics/predictions/output-files).

[](#next-steps)Next steps
-------------------------

Read the [full Python client documentation on GitHub.](https://github.com/replicate/replicate-python#readme)

--- END OF python.md ---


# FILE: fine-tune-with-flux.md

There are loads of image models on Replicate. Have you ever wanted to make your own?

Imagine a version of an image model that consistently generates images in a specific artistic style, or always includes a particular character or subject.

That’s exactly what fine-tuning lets you do.

This guide will teach you how to fine-tine a [FLUX.1 model](https://replicate.com/collections/flux) to generate images in a specific style, or of a specific subject, or of your pet, or of your own face. In this tutorial, we use Replicate’s beloved [@zeke](https://x.com/zeke) (AKA Ziki) to create a Ziki FLUX fine-tune:

[![Variants of 'ZIKI on a skateboard', generated by the ziki-flux fine-tune.](https://github.com/user-attachments/assets/ed67317e-9233-41d7-a5f4-f206161ad0ae)](https://replicate.com/zeke/ziki-flux)

Variants of 'ZIKI on a skateboard', generated by the ziki-flux fine-tune.

Fine-tuning FLUX on Replicate is easy: you just need a handful of images to get started. No deep technical knowledge is required. You can even [create a FLUX fine-tune entirely on the web](https://replicate.com/replicate/fast-flux-trainer/train), without writing a single line of code (we’ll show you how to in this guide!). You’ll be able to generate images of yourself as a superhero, a cartoon character, an adventurer, or just a regular person in a variety of interesting situations.

The community has already published [hundreds of public FLUX fine-tunes](https://replicate.com/collections/flux-fine-tunes) on Replicate, plus thousands of private fine-tunes too.

Feeling left out now? Let’s get started!

[](#step-0-prerequisites)Step 0: Prerequisites
----------------------------------------------

Here’s what you’ll need to get started:

*   A Replicate account
*   A handful of training images
*   Less than two US dollars

[](#step-1-gather-your-training-images)Step 1: Gather your training images
--------------------------------------------------------------------------

You’ll need a few images of yourself to get started. These should be high-quality images of your face, taken from various angles and in different lighting conditions.

You can fine-tune FLUX with as few as two training images, but for best results you’ll want to use at least 10 images or more. In theory, you’ll get continually better results as you include more images in the training data, but the training process can take longer the more images you add.

Consider the following when gathering your training images:

*   WebP, JPG, and PNG formats are all supported.
*   Use 1024x1024 or higher resolution if possible.
*   Filenames don’t matter. Name your files whatever you like.
*   Aspect ratio doesn’t matter. Images can be square, landscape, portrait, etc.
*   10 images is a good minimum.

![Variety is key. For best results, choose training images with different settings, clothing, lighting, and angles. Look at all these Zekes!](https://github.com/user-attachments/assets/b8be6440-1ab0-4fe2-8f19-3642daef0139)

Variety is key. For best results, choose training images with different settings, clothing, lighting, and angles. Look at all these Zekes!

Once you’ve gathered your images, put them in a zip file. Assuming you put them all in a folder called `data`, run this command in the same directory to generate a file called `data.zip`:

```plaintext
zip -r data.zip data
```

[](#step-2-choose-a-unique-trigger-word)Step 2: Choose a unique trigger word
----------------------------------------------------------------------------

Whenever you fine-tune an image model, you also choose a unique “trigger word” that you’ll use later in your text prompts when generating images:

```plaintext
photo of YOUR_TRIGGER_WORD_HERE looking super-cool, riding on a segway scooter
```

Here are some things to consider when choosing a trigger word:

*   It should be something unique like `MY_UNIQ_TRGGR`. Think “vanity license plates”, but without any length limits.
*   It should not be an existing word in any language, like `dog` or `cyberpunk`.
*   It should not be `TOK`, the commonly-used trigger word for other fine-tunes. This is because it will clash with other fine-tunes if you ever want to [combine them](https://x.com/replicate/status/1829240947487711548).
*   Case doesn’t matter, but capital letters can help visually distinguish the trigger word from the rest of the text prompt.

For my [zeke/ziki-flux](https://replicate.com/zeke/ziki-flux) fine-tune, I chose `ZIKI` as a trigger word. Short, unique, and memorable.

Got your trigger word? Hold it in your mind for a second. You’ll use it in the next step.

[](#step-3-create-and-train-a-model)Step 3: Create and train a model
--------------------------------------------------------------------

There are a couple ways to fine-tune FLUX on Replicate. You can use the [web-based training form](https://replicate.com/replicate/fast-flux-trainer/train), or the [API](https://replicate.com/blog/fine-tune-flux#create-a-training-via-an-api). The API is great for creating and updating fine-tunes in an automated or programmatic way, but in this guide we’ll just use the web-based form. It’s easier.

Tip

If you prefer writing code over clicking buttons, check out our [guide to fine-tuning FLUX with an API](https://replicate.com/blog/fine-tune-flux-with-an-api).

Go to **[https://replicate.com/replicate/fast-flux-trainer/train](https://replicate.com/replicate/fast-flux-trainer/train)** to start the web-based training process.

For the `destination` input, you’ll choose a model to publish to. This can be an existing model you’ve already created, or a new model:

![Your fine-tuned FLUX model can public or private.](https://github.com/user-attachments/assets/02cf1a01-54ee-4558-acf2-666384f5ef32)

Your fine-tuned FLUX model can public or private.

For the `input_images` input, drag and drop the zip file you created earlier.

For the `trigger_word` input, enter the string you chose earlier. Make sure it’s unique!

For the `lora_type` input, select “subject.” (Our subject is Zeke, a human being. Note, if you are fine-tuning an image model of a certain style, choose “style”!)

For `training_steps` under advanced outputs, leave it at 1000. Any less and your training process will not properly learn the concept in your training images. Any more and you could be incurring extra time and cost without much improvement in the model performance.

You’ll be [billed per second](https://replicate.com/docs/billing) for the time the training process takes to run. Trainings for the FLUX model run on x8 Nvidia H100 GPU hardware, which costs $0.012200 per second at the time of this writing. Training takes around 2 minutes (which is typical when using about 20 training images and 1000 steps), so you can expect to pay about $1.46 USD.

Leave the rest of the inputs at their default values and click **Create training**.

[](#step-4-stand-up-and-stretch)Step 4: Stand up and stretch
------------------------------------------------------------

The training process is pretty fast — again, less than two minutes. Use this opportunity to get up from your computer, stretch your arms and legs, grab a drink of water, etc.

Then come back, and your model should be ready to go.

[](#step-5-generate-images-on-the-web)Step 5: Generate images on the web
------------------------------------------------------------------------

Once the training process is complete, your model will be ready to run. You can either hit **Run trained model** to run the model on the web or hit **Download weights** to use elsewhere.

Let’s hit **Run trained model**!

The only input you’ll need to enter is the `prompt`. The rest you can leave alone to start. FLUX is great at following long prompts, so the more detailed and descriptive you make the prompt the better. Be sure to include your `trigger_word` in the prompt to activate your newly trained concept in the resulting images.

![Run your new fine-tuned model from the Replicate web playground.](https://github.com/user-attachments/assets/2abfdc60-cc32-4b84-b13f-50cf0462e118)

Run your new fine-tuned model from the Replicate web playground.

[](#step-6-generate-images-using-the-api)Step 6: Generate images using the API
------------------------------------------------------------------------------

The web playground is a great place to start playing with your new model, but generating images one click at a time can get old pretty fast. Plus, don’t you want to use your new image model in your own app?

Luckily your model is also hosted in the cloud with an API, so you can run it from your own code using the programming language of your choice.

When you run a model, you’ll see tabs for different languages like Node.js and Python. These tabs contain code snippets that show you how to construct an API call to reproduce the exact inputs you just entered in the browser form.

Click the **Node.js** tab in the web playground to see the API code:

![Run your new fine-tuned model with Node.js](https://github.com/user-attachments/assets/574ff4a2-0801-4a1d-8094-b4bb4e722409)

Run your new fine-tuned model with Node.js

This will show the exact setup steps and code snippet you’ll need to run the model on your own. Here’s an abbreviated version of the Node.js code to get you started:

```js
import Replicate from "replicate"
const replicate = new Replicate()
const model = "zeke/ziki-flux:dadc276a9062240e68f110ca06521752f334777a94f031feb0ae78ae3edca58e"
const prompt = "ZIKI, an adult man, standing atop Mount Everest at dawn..."
const output = await replicate.run(model, { input: { prompt } })
// Save the generated image
import { writeFile } from "node:fs/promises";
await writeFile("./output.png", output);
```

[](#step-65-use-a-language-model-to-write-better-prompts)Step 6.5: Use a language model to write better prompts
---------------------------------------------------------------------------------------------------------------

Sometimes it’s hard to think of a good prompt from scratch, and using a really simple prompt like “ZIKI wearing a turtleneck holiday sweater” is not going to give you very interesting results.

This is where language models come to the rescue. Here’s an example language model prompt to help crank out some ideas for interesting image-generation prompts:

> Write ten prompts for an image generation model. The prompts should describe a fictitious person named ZIKI in various scenarios. Make sure to use the word ZIKI in all caps in every prompt. Make the prompts highly detailed and interesting, and make them varied in subject matter. Make sure the prompts will generate images that include unobscured facial details. ZIKI is a 43 year old adult male. Include some reference to this in prompt to avoid misrepresenting ZIKI’s age or gender. Do not allude to ZIKI’s eye color.

This generates some interesting prompts:

> Close-up of ZIKI, a male street artist in his 40s, spray-painting a vibrant mural on a city wall. His face shows intense concentration, with flecks of paint on his cheeks and forehead. He wears a respirator mask around his neck and a beanie on his head. The partially completed mural is visible behind him.

> ZIKI, a dapper gentleman spy in his 40s, engaged in a high-stakes poker game in a luxurious Monte Carlo casino. His face betrays no emotion as he studies his cards, one eyebrow slightly raised. He wears a tailored tuxedo and a bow tie, with a martini glass on the table in front of him.

> ZIKI, a distinguished-looking gentleman in his 40s, conducting a symphony orchestra. His expressive face shows intense concentration as he gestures dramatically with a baton. He wears a crisp tuxedo, and his salt-and-pepper hair is slightly disheveled from his passionate movements.

To get started writing your own prompts, check out [Meta Llama 3.1 405b](https://replicate.com/p/w1gdknd8asrm00chmmqsnthap0), a fast and powerful language model that you can in the web or with an API on Replicate, just like your own model:

```js
import Replicate from "replicate"
const replicate = new Replicate()
const model = "meta/meta-llama-3.1-405b-instruct"
const prompt = "Write ten prompts for an image generation model..."
const output = await replicate.run(model, { input: { prompt } })
console.log(output)
```

[](#step-7-have-fun-and-iterate)Step 7: Have fun and iterate
------------------------------------------------------------

Now that you’ve got a fine-tuned image generation model and a language model to help generate prompts, it’s time to start playing around and generating fun images.

If you need inspiration, check the collection of [FLUX fine-tunes on Replicate](https://replicate.com/collections/flux-fine-tunes) to see what other people have created.

Have fun and share your results with the community on [X](https://x.com/replicate) or [Discord](https://discord.gg/replicate).

--- END OF fine-tune-with-flux.md ---


# FILE: model-best-practices.md

This guide will walk you through the best practices for pushing a reliable, fast, and user-friendly model to Replicate.

[](#getting-started)Getting started
-----------------------------------

All models on Replicate use [Cog](https://github.com/replicate/cog), an open-source tool that lets you package machine learning models in a standard, production-ready container. It’s based on Docker.

If you’re new to Cog, we recommend starting from our docs: [Push a model to Replicate](https://replicate.com/docs/guides/push-a-model)

In short, you need to:

1.  define the Docker environment your model runs in with `cog.yaml`
2.  define how predictions are run with `predict.py`
3.  test your model by running predictions locally, for example: `cog predict -i image=@input.jpg`
4.  push the model to Replicate with `cog push`

For the rest of this guide we’ll assume you’re familiar with Cog and you know how to push a model to Replicate.

[](#make-your-model-easy-to-understand)Make your model easy to understand
-------------------------------------------------------------------------

People must be able to use your model without reading the source code.

### [](#naming-your-model)Naming your model

All names on Replicate are lowercase and use dashes instead of spaces. For example, `llama-2-70b-chat`.

Best practice is to use the model’s official name, like the name of the Github repo or HuggingFace model.

Where there are variations of a model, we recommend adding those variations to the end of the name to make the model distinct. These are commonly different parameter sizes or fine-tunes, such as `codellama-34b` and `codellama-34b-instruct`.

### [](#include-a-clear-description)Include a clear description

A short one line description explaining what the model does. Avoid technical terms and abbreviations in your description.

Some good examples:

*   For the `autocaption` model: “Automatically add captions to a video”
*   For the `llama-2-70b-chat`: “A 70 billion parameter language model from Meta, fine tuned for chat completions”

### [](#use-well-named-model-inputs)Use well named model inputs

Do not prematurely shorten names. Use `negative_prompt` instead of `n_prompt`.

### [](#order-your-inputs)Order your inputs

Put the most important inputs first.

Group related inputs together. For example, `prompt` and `negative_prompt` should be together in your `predict.py` inputs. Users usually want to change them together.

For models with many inputs, consider prefixing fields with a group name. For example, `controlnet_strength`, `controlnet_image` and `controlnet_model`.

### [](#add-guidance-to-explain-inputs)Add guidance to explain inputs

Even when obvious to you. For example, not everyone knows how to use a negative prompt. Guidance like this would help them:

> A negative prompt is a prompt containing all the things you do not want in your output

### [](#pick-defaults-that-balance-speed-and-quality)Pick defaults that balance speed and quality

Good defaults get quality outputs quickly.

For example, with SDXL you get good images at 768x768 with 25 inference steps, which is 3x faster than 1024x1024 at 50 steps.

### [](#give-guidance-on-recommended-ranges)Give guidance on recommended ranges

A model should make it difficult to get bad results while remaining flexible for anyone wanting to experiment.

Keep wide input ranges, but use guidance text to explain where the best results lie.

### [](#handle-image-inputs-well)Handle image inputs well

If your model takes images as inputs, it should accept all the common image formats users will try. For example, JPEG, PNG, GIF and WEBP, as well as images with alpha channels (transparency).

Where inference would fail with a given input (like an RGBA image), convert images to a format that works.

An image that’s too big will often cause out of memory errors. Scale images to a size that works best with your model, but maintain aspect ratio.

Some models need dimensions that are multiples of 8, or similar (for example Stable Diffusion). In these cases, automatically scale images to the nearest multiple.

Make image scaling easy and automatic, so users can throw any image at your model and get good results. But add controls so they can override defaults and control sizing if they need to.

[](#dependencies)Dependencies
-----------------------------

Keep dependencies to a minimum. Fewer dependencies mean smaller containers and faster builds.

Use pinned versions. Pinning your dependencies to specific versions makes your model more reproducible. It will make it easier to debug.

OpenCV is a big dependency. If you’re using it, we recommend using the headless version [opencv-python-headless](https://pypi.org/project/opencv-python-headless/) which is a smaller version for server use.

[](#model-weights)Model weights
-------------------------------

Download weights and push them with your model. Do not try to download them at runtime. If you’re using HuggingFace Diffusers, you can also push the model cache.

If you have weights that are especially large, contact the Replicate team and we’ll help you keep your model size down and your model fast. We’re working on making this better.

--- END OF model-best-practices.md ---


# FILE: nextjs.md

Learn how to build a Next.js web application that uses Replicate to run a machine learning model. By the end of this guide, you’ll have your own deployed website that can accept text prompts as input and generate images using [Flux Schnell](https://replicate.com/black-forest-labs/flux-schnell), a fast and high-quality open-source image generation model from the creators of Stable Diffusion.

Tip

**Want to skip ahead to the completed project?** Check out the GitHub repo at [replicate/getting-started-nextjs](https://github.com/replicate/getting-started-nextjs). There’s also a [TypeScript version](https://github.com/replicate/getting-started-nextjs-typescript).

[](#prerequisites)Prerequisites
-------------------------------

*   **Node.js**: You’ll need Node.js installed to be able to run your application locally. The easiest way to install Node.js is by downloading and running the package installer at [nodejs.org](https://nodejs.org/).
*   **[An account on Replicate](https://replicate.com/signin)**: You’ll use Replicate to run machine learning models. It’s free to get started, and you get a bit of credit when you sign up. After that, you pay per second for your usage. See [how billing works](https://replicate.com/docs/billing) for more details.
*   **[An account on GitHub](https://github.com)**: This is where you’ll host the source code for your application.
*   **[An account on Vercel](https://vercel.com)**: Vercel is a platform for hosting Next.js apps. This is where you’ll deploy your web application.

[](#step-1-create-the-app)Step 1: Create the app
------------------------------------------------

[Next.js](https://nextjs.org/) is a framework for building web applications with JavaScript. You can use it to build apps that have both a Node.js backend web server and a React frontend. It’s a great choice for building web applications that use Replicate because it’s easy to get started with and it’s easy to deploy to Vercel.

The easiest way to get started with a new Next.js app is to use the [create-next-app](https://nextjs.org/docs/api-reference/create-next-app) command:

```shell
npx create-next-app@latest --js --eslint
```

This command asks you to choose a name for your project and some options (you can accept all the defaults), then creates a project directory for you and installs the necessary dependencies. It also takes care of initializing a new Git repository and creating an initial commit with all the added files. This gives you a good starting point for managing your project’s source code history.

[](#step-2-run-the-app-locally)Step 2: Run the app locally
----------------------------------------------------------

Now run your app locally to make sure everything is working:

```shell
cd my-app
npm run dev
```

You should have a running starter app at this point. View it in your browser at [localhost:3000](http://localhost:3000).

[](#step-3-configure-your-environment)Step 3: Configure your environment
------------------------------------------------------------------------

You need your API token to be able to run models. You can set it as an environment variable in your local development environment.

Generate an API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) and copy the token.

Next.js has built-in support for loading environment variables from a `.env.local` file into `process.env`.

Create a file called `.env.local` in the root of your project:

```shell
touch .env.local
```

Then edit the file and add your token to it:

```plaintext
REPLICATE_API_TOKEN=r8_...
```

Note: The `npx create-next-app` command you ran in Step 1 created a `.gitignore` file that ignores `.env.local` files. This is a good thing, because you don’t want to accidentally commit your API token to your project’s source code repository.

[](#step-4-build-the-backend)Step 4: Build the backend
------------------------------------------------------

Now it’s time to write some server-side code that you’ll use to run models with Replicate.

One of the great things about Next.js is that you can write your backend code in the same project as your frontend code. Any code in a `page.js` file is treated as a frontend component, and any code in a `route.js` file is treated as a backend API endpoint.

You’ll create two server-side endpoints: one for running the model and one for polling the status of that request until it’s complete.

Start by creating a directory for these endpoints:

```shell
mkdir -p app/api/predictions
```

Now create a file to handle prediction creation requests. Call it `app/api/predictions/route.js` and add the following code:

```javascript
import { NextResponse } from "next/server";
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;
export async function POST(request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    );
  }
  const { prompt } = await request.json();
  const options = {
    model: 'black-forest-labs/flux-schnell',
    input: { prompt }
  }
  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhooks`
    options.webhook_events_filter = ["start", "completed"]
  }
  // A prediction is the result you get when you run a model, including the input, output, and other details
  const prediction = await replicate.predictions.create(options);
  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }
  return NextResponse.json(prediction, { status: 201 });
}
```

Now create a file to handle requests to poll for the prediction’s status. Call it `app/api/predictions/[id]/route.js` and add the following code:

```javascript
import { NextResponse } from "next/server";
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
export async function GET(request, context) {
  const { id } = await context.params;
  const prediction = await replicate.predictions.get(id);
  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }
  return NextResponse.json(prediction);
}
```

Note the `[id]` in the directory structure. Next.js has a feature called [dynamic routing](https://nextjs.org/docs/routing/dynamic-routes) that treats the `id` part of the URL as a variable. You can use this variable in your code by accessing `req.query.id`.

[](#step-5-build-the-frontend)Step 5: Build the frontend
--------------------------------------------------------

You’ve finished writing the server-side code that talks to Replicate. Now it’s time to create the frontend code that renders a form. When a user enters a prompt and submits the form, it posts the data to the server-side endpoint that you created in Step 4. The endpoint runs the model with Replicate and returns a [prediction](https://replicate.com/docs/how-does-replicate-work#predictions) (an object representing a single model run).

Your project already has a file called `app/page.js` that renders the default “Welcome to Next.js” home route. Remove all the existing content in that file and replace it with the following code:

```javascript
'use client';
import { useState } from "react";
import Image from "next/image";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({ prediction: prediction });
      setPrediction(prediction);
    }
  };
  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Dream something with{" "}
        <a href="https://replicate.com/black-forest-labs/flux-schnell?utm_source=project&utm_project=getting-started">
          Flux Schnell
        </a>
      </h1>
      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow"
          name="prompt"
          placeholder="Enter a prompt to display an image"
        />
        <button className="button" type="submit">
          Go!
        </button>
      </form>
      {error && <div>{error}</div>}
      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
                height={768}
                width={768}
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
        </>
      )}
    </div>
  );
}
```

[](#step-6-add-basic-styles)Step 6: Add basic styles
----------------------------------------------------

The Next.js starter app includes some CSS styles that are used on the default splash page, but they aren’t really intended to be reused for a real app.

To create a clean slate for your styles, remove all the content in `app/globals.css` and replace it with the following basic styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
.container {
  padding: 2rem;
  font-size: 1.3rem;
  max-width: 48rem;
  margin: 0 auto;
}
form {
  display: flex;
  margin-bottom: 2rem;
}
form input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #000;
  border-radius: 0.25rem;
  font-size: 1.3rem;
  margin-right: 1rem;
}
form button {
  padding: 1rem;
  border: none;
  border-radius: 0.25rem;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 1.3rem;
}
.imageWrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
}
```

[](#step-7-configure-image-hosts)Step 7: Configure image hosts
--------------------------------------------------------------

To protect your application from malicious users, Next.js requires some configuration to use external images. Edit the `next.config.js` file and add `replicate.com` and `replicate.delivery` to the `images.domains` array:

```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
    ],
  },
};
export default nextConfig;
```

[](#step-8-create-a-prediction)Step 8: Create a prediction
----------------------------------------------------------

Your app should be ready to use now! Visit [localhost:3000](http://localhost:3000) and enter a prompt to see the results.

![studio portrait photo of an iguana wearing a hat](https://github.com/replicate/getting-started-nextjs/assets/14149230/28af66ff-0f6b-4454-b936-b7e5172b6a38)

[](#step-9-publish-to-github)Step 9: Publish to GitHub
------------------------------------------------------

Now that your app is working, it’s time to publish it to a GitHub repository. This step is not strictly necessary, but it’s a good idea to keep your code in a version control system like Git. This will also set you up nicely to use Vercel’s GitHub integration, which deploys your app automatically every time you push a new commit to the main branch on GitHub.

First, commit your changes to Git:

```shell
git add pages/api/predictions/
git commit -am "First working version! "
```

Then create a new GitHub repository and push your code to it. You can use whatever flow you like, but here we’ll go with the following command that uses GitHub’s official [`gh` CLI](https://cli.github.com/) to create a new public repo named `my-replicate-app` and push your code to it:

```shell
gh repo create my-replicate-app --public --push --source=.
```

If you’d rather keep your repository private, set the `--private` flag instead of `--public`.

[](#step-10-deploy-to-vercel)Step 10: Deploy to Vercel
------------------------------------------------------

There are many ways to deploy apps to Vercel, but for the sake of brevity, we’ll use the `vercel` CLI here. Start by installing the CLI and running it:

```shell
npx vercel
```

The command above installs the CLI, then walks you through the process of logging in to Vercel, creating the app, and deploying it.

Once you’ve deployed your app, you need to add your API token to the remote app’s environment variables. This allows your app to make requests to Replicate.

```shell
npx vercel env add REPLICATE_API_TOKEN
```

The command above prompts you to enter a value for your token. Paste the same token you used in Step 3. You then need to deploy again:

```shell
npx vercel deploy --prod
```

[](#next-steps)Next steps
-------------------------

You did it! You should now have a working web app that’s powered by machine learning.

But this is just the start. Here are some ideas for what you can do next:

Show your friends what you’ve built.

Update your app to request and receive webhooks so you can do things like store your prediction metadata in a database. See the [webhooks docs in the getting-started-nextjs repo](https://github.com/replicate/getting-started-nextjs?tab=readme-ov-file#webhooks).

Fine-tune and deploy [your own custom Flux Schnell image generation model](https://replicate.com/docs/get-started/fine-tune-with-flux) and use your new website to show it off.

Integrate a [super resolution model](https://replicate.com/collections/super-resolution) into your new app to upscale the generated images to a higher resolution.

[Explore other models on Replicate](https://replicate.com/explore) and integrate them into your app.

️ Update the README if you’re planning to open-source your project so others know how to use it and contribute.

⚡️ [Connect your Vercel app to your GitHub repo](https://vercel.com/docs/concepts/git/vercel-for-github), so you’ll get preview deployments for every pull request, and your app will automatically deploy every time you push to the main branch.

--- END OF nextjs.md ---


# FILE: discord-bot.md

In this tutorial you’ll use Python to build and deploy a Discord chat bot application that uses [Flux Schnell](https://replicate.com/black-forest-labs/flux-schnell) to generate images from text prompts.

[](#prerequisites)Prerequisites
-------------------------------

*   Install [Python 3.5](https://www.python.org/downloads/) or later.
*   A command-line shell (e.g. Terminal on Mac, gnome-terminal on Linux, or PowerShell on Windows)
*   Sign up for an [account on Replicate](https://replicate.com/signin?next=/docs/tutorials/dicord-bot).
*   Sign up for an [account on Discord](https://discord.com/register).

[](#set-up-a-discord-bot-account)Set up a Discord Bot account
-------------------------------------------------------------

Follow [discord.py’s guide](https://discordpy.readthedocs.io/en/stable/discord.html) to set up a Discord Bot account. Give it a name like `flux-bot`. At the end of the first section, you’ll need to turn on the “message content intent” option on the bot page. That permission is needed for your bot to read the content of messages, to get the prompts!

In the second half of the guide – inviting your bot – when it tells you to “tick the permissions required for your bot to function”, you’ll want to give the bot permission to “Send messages”.

[](#write-some-code)Write some code
-----------------------------------

This section walks you through steps required to set up a codebase.

Tip

**Want to skip ahead?** If you’d rather not copy and paste all the code below, then you can clone the [replicate/replicate-discord-bot](https://github.com/replicate/replicate-discord-bot) GitHub repo to start with a working project template.

### [](#create-a-project-directory)Create a project directory

```sh
mkdir flux-bot
cd flux-bot
```

### [](#define-python-dependencies)Define Python dependencies

Next you’ll define some of the Python package dependencies needed by your project.

Install the [poetry](https://python-poetry.org/docs#installation) command-line tool and create a new `pyproject.toml` file:

```sh
poetry init -n
```

Then add dependencies:

```sh
poetry add discord.py python-dotenv replicate
```

### [](#configure-environment-and-secrets)Configure environment and secrets

Create a file named `.env`. This text file will be used to store secrets for your development environment. Paste in the following:

```plaintext
REPLICATE_API_TOKEN=<your-token>
DISCORD_TOKEN=<your-token>
```

Visit [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens?new-token-name=discord-bot) to copy and paste your API token. If you didn’t subscribe before, you’ll need to now to get hold of the token.

The Discord token is the token you copied when creating your bot from the Discord guide. If you don’t have it, you can generate a new one by visiting [discord.com/applications](https://discord.com/developers/applications), selecting your bot application, selecting “Bot” from the side menu, and clicking “Reset Token”.

Note

The `.env` file contains secrets, so it should not be shared with anyone. If you’re planning to turn your project into a Git repository, be sure to create a [`.gitignore` file](https://git-scm.com/docs/gitignore) and add `.env` to it.

### [](#write-the-bot)Write the bot

Create a new file called `bot.py` and paste the following code into it:

```python
from discord import Intents
from discord.ext import commands
from dotenv import load_dotenv
import os
import replicate
load_dotenv()
intents = Intents.default()
intents.message_content = True
bot = commands.Bot(
    command_prefix="!",
    description="Runs models on Replicate!",
    intents=intents,
)
@bot.command()
async def flux(ctx, *, prompt):
    """Generate an image from a text prompt using the Flux Schnell model"""
    msg = await ctx.send(f""{prompt}"\n> Generating...")
    output = replicate.run(
        "black-forest-labs/flux-schnell",
        input={"prompt": prompt}
    )
    # Convert the FileOutput to bytes for Discord's upload_file
    file_data = output[0].read()
    await msg.delete()
    await ctx.send(f""{prompt}"", file=discord.File(file_data, "flux.png"))
bot.run(os.environ["DISCORD_TOKEN"])
```

This file defines the command for your bot (`!flux`) and how it works. When you want to make changes to your bot later, this will be the file you come back to.

[](#run-your-bot-locally)Run your bot locally
---------------------------------------------

Now that you’ve written the code for your bot, it’s time to run it!

The Discord API uses a system called [Gateway](https://discord.com/developers/docs/topics/gateway) which supports real-time communication over WebSockets. This means you can run your bot from any computer, even if it’s not exposed to the public internet. No need to configure any webhooks!

Run this command to start your bot locally:

```sh
poetry run python bot.py
```

[](#use-the-bot)Use the bot
---------------------------

Check your bot is running by typing `!help` into one of the channels on your Discord server. Your bot should respond with the list of commands it can run, including `!flux`.

Now try generating an image:

```text
!flux an astronaut riding a horse
```

Your bot should write a message saying “Generating…”, and then a few seconds later it should swap out that message for the newly generated image.

[](#deploy-your-bot-optional)Deploy your bot (optional)
-------------------------------------------------------

Running your bot locally is convenient, especially when you’re actively working on it. The downside, however, is that it can only run when you’re online. If you’re building a bot for a server, you probably want it to be online even when you aren’t.

There are lots of ways to deploy an application like this. Some of the easiest are services like [Vercel](https://vercel.com/), [Fly](https://fly.io/) or [Heroku](https://heroku.com). In this tutorial, you’ll use Fly to deploy the bot to the cloud.

To get started, see [Fly’s “speedrun” guide](https://fly.io/speedrun/) to install the `flyctl` command-line tool and create a Fly account.

Then create a new file called `Dockerfile` and paste the following code into it:

```docker
FROM python:3.10
RUN pip install poetry
WORKDIR /code
COPY poetry.lock pyproject.toml /code/
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi
COPY . /code
CMD python bot.py
```

Then create a new Fly application:

```sh
flyctl launch
```

That command will generate a new file called `fly.toml`, but it’s designed for running web apps so you’ll need to make a few changes. Remove the `[[services]]` block and everything below it. Your modified file should look something like this:

```toml
app = "name-of-your-fly-app"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []
[env]
[experimental]
  allowed_public_ports = []
  auto_rollback = true
```

Then configure your Fly app using the secrets from your local `.env` file:

```sh
flyctl secrets set REPLICATE_API_TOKEN=... DISCORD_TOKEN=...
```

That’s it! Your bot is now running in the cloud.

[](#next-steps)Next steps
-------------------------

Now might be a good time to tinker with the bot a bit. Some ideas:

*   Generate multiple images instead of a single one, and show them all.
*   Add another command that runs [a different model](https://replicate.com/explore).
*   Take the image output and run it through another model, like an [upscaler](https://replicate.com/collections/super-resolution).
*   Turn it into a game. Perhaps [a game of telephone](https://twitter.com/TelephoneAI), or [a game of Pictionary](https://en.wikipedia.org/wiki/Pictionary).

[Get creative and share what you’ve built in our Discord!](https://discord.gg/replicate)

--- END OF discord-bot.md ---


# FILE: swiftui.md

Learn how to build a SwiftUI app that uses Replicate to run a machine learning model.

By the end, you’ll have an app that can run on iOS and macOS that generates images from text prompts using Stable Diffusion.

Tip

**Want to skip ahead?** Check out the GitHub repo at [replicate/getting-started-swiftui](https://github.com/replicate/getting-started-swiftui).

[](#prerequisites)Prerequisites
-------------------------------

*   **Xcode**: You’ll need Xcode to build and run your app. Download the latest version of Xcode from [developer.apple.com](https://developer.apple.com/xcode/).
*   [**A Replicate account**](https://replicate.com/signin): You’ll use Replicate to run machine learning models. It’s free to get started, and you get a bit of credit when you sign up. After that, you pay per second for your usage. See [how billing works](https://replicate.com/docs/billing) for more details.

[](#1-create-the-app)1\. Create the app
---------------------------------------

[SwiftUI](https://developer.apple.com/xcode/swiftui/) is a framework for building native apps for Apple devices. It’s a great choice for getting something up and running fast, and is well-suited to prototyping ideas with Replicate.

Open Xcode and create a new project by selecting “File” > “New” > “Project…”. (⇧⌘N).

![swiftui-1-light](https://github.com/replicate/cog/assets/2289/2998a94a-1c9a-418a-a454-d0d6da8a2161)

Under “Multiplatform” select the “App” template and click “Next”. Give your app a name, such as “ReplicateExample”, and click “Next”. Then save your project to a working directory.

![swiftui-2-light](https://github.com/replicate/cog/assets/2289/921fd03d-703b-4364-8c67-b1f13953229d)

Now’s a good time to make sure everything is working as expected. In Xcode, select “Product” > “Run” (⌘R) build and run the app on your device or simulator.

If you see a “Hello, world!” message, you’re ready to move on to the next step.

[](#2-add-replicates-swift-package-dependency)2\. Add Replicate’s Swift package dependency
------------------------------------------------------------------------------------------

Use the [official Swift package](https://github.com/replicate/replicate-swift) to run machine learning models on Replicate from your app.

In Xcode, select “File” > “Add packages…”. Copy `https://github.com/replicate/replicate-swift` and paste it into the search bar. Select `replicate-swift` from the list and click the “Add Package” button.

![swiftui-3-light](https://github.com/replicate/cog/assets/2289/949e4c36-dd08-44d3-9f0c-88195900e913)

Once Xcode finishes downloading the package, you’ll be prompted to choose which products to add to your project. Select Replicate’s library and add it to your example app target.

![swiftui-4-light](https://github.com/replicate/cog/assets/2289/83de5826-3cdc-434c-9531-81f29f667290)

[](#3-configure-your-app)3\. Configure your app
-----------------------------------------------

Enable network access for your app so that it can connect to Replicate.

In project settings, select the “ReplicateExample” target, then select the “Signing & Capabilities” tab. Under “App Sandbox”, check the box next to “Outgoing Connections (Client)”.

![swiftui-5-light](https://github.com/replicate/cog/assets/2289/873ee719-287f-4017-80f9-f1beccb298cd)

[](#4-set-up-replicates-client)4\. Set up Replicate’s client
------------------------------------------------------------

Now it’s time to write some code.

In the Project Navigator, open the `ContentView.swift` file. Add the following code to the top of the file, replacing `<#token#>` with [your API token](https://replicate.com/account/api-tokens?new-token-name=swiftui-app).

```swift
import Replicate
private let client = Replicate.Client(token: <#token#>)
```

Warning

For this example, we’re hard-coding the API token in the app. But this is just to help you get started quickly, and isn’t recommended for production apps. You shouldn’t store secrets in code or any other resources bundled with your app. Instead, fetch them from CloudKit or another server and store them in the Keychain.

For more information, consult Apple’s documentation for CloudKit and the Keychain:

*   [fetch(withRecordID:completionHandler:)](https://developer.apple.com/documentation/cloudkit/ckdatabase/1449126-fetch)
*   [Storing Keys in the Keychain](https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_keychain)

[](#5-define-the-model)5\. Define the model
-------------------------------------------

Models on Replicate have typed [inputs](https://replicate.com/stability-ai/stable-diffusion/api#inputs) and [outputs](https://replicate.com/stability-ai/stable-diffusion/api#output-schema), so it’s convenient to define a Swift type for each model your app uses.

In `ContentView.swift`, add the following code:

```swift
// https://replicate.com/stability-ai/stable-diffusion
enum StableDiffusion: Predictable {
  static var modelID = "stability-ai/stable-diffusion"
  static let versionID = "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
  struct Input: Codable {
      let prompt: String
  }
  typealias Output = [URL]
}
```

*   `Predictable` is a protocol that defines a common interface for all models.
*   `modelID` is the ID of the model we want to run — in this case, “stability-ai/stable-diffusion” for [Stable Diffusion](https://replicate.com/stability-ai/stable-diffusion)
*   `versionID` is the ID of the version of the model we want to run. Here, we’re using the latest version at the time of writing.
*   `Input` and `Output` define the types of the model’s input and output. In this case, the input is a struct with a `prompt` property, and the output is a list of URLs to the generated images. (Stable Diffusion has additional inputs, including an option for how many images to generate, but we’re keeping things simple for this example.)

Next, add a `prompt` and a `prediction` property to `ContentView`, and define `generate()` and `cancel()` methods:

```swift
struct ContentView: View {
  @State private var prompt = ""
  @State private var prediction: StableDiffusion.Prediction? = nil
  func generate() async throws {
    prediction = try await StableDiffusion.predict(with: client,
                                                   input: .init(prompt: prompt))
    try await prediction?.wait(with: client)
  }
  func cancel() async throws {
    try await prediction?.cancel(with: client)
  }
  // ...
```

The `generate()` method creates a prediction and waits for it to complete. Because `Prediction` is a value type, the UI will automatically update when the prediction completes.

[](#6-implement-the-rest-of-contentview)6\. Implement the rest of ContentView
-----------------------------------------------------------------------------

Finally, wire up the UI to call these methods and display the generated image.

The content view’s body has a `Form` with a `Section` containing a `TextField`. When the user types text into this field and submits the form, that text will be used to create a prediction by the `generate()` method.

```swift
var body: some View {
  Form {
    Section {
      TextField(text: $prompt,
            prompt: Text("Enter a prompt to display an image"),
            axis: .vertical,
            label: {})
        .disabled(prediction?.status.terminated == false)
        .submitLabel(.go)
        .onSubmit(of: .text) {
          Task {
            try await generate()
          }
        }
    }
```

Under the text field is a conditional block that renders the prediction from the time it’s created until it finishes.

*   `starting` and `processing`: Show an indeterminate loading indicator as well as a button to cancel the prediction.
*   `succeeded`: Show the generated image using an `AsyncImage` component.
*   `failed`: Show an error message.
*   `canceled`: Show a status message to the user.

The `ZStack` acts as a placeholder to keep everything in place while waiting for the prediction to finish.

```swift
if let prediction {
  ZStack {
    Color.clear
      .aspectRatio(1.0, contentMode: .fit)
    switch prediction.status {
    case .starting, .processing:
      VStack{
        ProgressView("Generating...")
          .padding(32)
        Button("Cancel") {
          Task { try await cancel() }
        }
      }
    case .succeeded:
      if let url = prediction.output?.first {
        VStack {
          AsyncImage(url: url, scale: 2.0, content: { phase in
            phase.image?
              .resizable()
              .aspectRatio(contentMode: .fit)
              .cornerRadius(32)
          })
          ShareLink("Export", item: url)
            .padding(32)
        }
      }
    case .failed:
      Text(prediction.error?.localizedDescription ?? "Unknown error")
        .foregroundColor(.red)
    case .canceled:
      Text("The prediction was canceled")
        .foregroundColor(.secondary)
    }
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
  .padding()
  .listRowBackground(Color.clear)
  .listRowInsets(.init())
}
```

[](#7-create-a-prediction)7: Create a prediction
------------------------------------------------

Your app should be ready to use now! In Xcode, select “Product” > “Run” (⌘R) to run the app locally.

![swiftui-6-light](https://github.com/replicate/cog/assets/2289/2c38947a-abd6-4bda-bf43-baff303fdd98)

[](#next-steps)Next steps
-------------------------

Huzzah! You should now have a working app that’s powered by machine learning.

But this is just the start. Here are some ideas for what you can do next:

Show your friends what you’ve built.

Before you go too much further, make sure to set up CloudKit to securely store your API key, as you definitely don’t want to commit it to source control.

Integrate a [super resolution model](https://replicate.com/collections/super-resolution) into your new app to upscale the generated images to a higher resolution.

[Explore other models on Replicate](https://replicate.com/explore) and integrate them into your app.

️ Update the README if you’re planning to open-source your project so others know how to use it and contribute.

--- END OF swiftui.md ---


# FILE: cloudflare-image-cache.md

![image](https://github.com/user-attachments/assets/e873eee7-d6b1-4582-8d66-1409474a52f9)

This guide will show you how to build a [free](https://developers.cloudflare.com/images/pricing/#images-free) hosted [Cloudflare Worker](https://developers.cloudflare.com/workers) that:

*   Generates images using Replicate.
*   Caches output files in durable storage.
*   Serves images dynamically with [transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/) like scaling, cropping, and filters.

Tip

Want to skip ahead to the completed project? Check out the GitHub repo at [replicate/cloudflare-image-cache](https://github.com/replicate/cloudflare-image-cache)

[](#why-build-this)Why build this?
----------------------------------

*   **Persistence:** When you run models on Replicate that generate output files (like images), those files are automatically deleted after an hour. If you want to keep them for long-term use, you need to save them somewhere.
*   **Performance:** AI models take time and resources to run. Caching your generated output files helps you avoid repeatedly running a model using the same inputs.
*   **Flexibility:** Cloudflare [Transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/) let you serve images in different sizes and formats, with operations like cropping, blurring, and filtering.

[](#what-is-cloudflare)What is Cloudflare?
------------------------------------------

You might know of Cloudflare as a DNS provider, or as a CDN, or as a DDoS protection service. But Cloudflare is also a platform for building modern web applications. We run a lot of Replicate’s own infrastructure on Cloudflare, and we’re big fans.

Cloudflare has [dozens of products](https://developers.cloudflare.com/products/) for building web applications, but in this guide we’ll be using just a few of them:

*   [Cloudflare Workers](https://developers.cloudflare.com/workers) for running your code in the cloud.
*   [Cloudflare Images](https://developers.cloudflare.com/images) for storing and serving images.
*   [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv) for caching metadata.

[](#what-are-we-building)What are we building?
----------------------------------------------

You know those websites that generate placeholder images for web design prototypes? You give it a width and height and it generates a placeholder image of that size.

We’re going to build one of those, but with a bit more pizzaz:

![tired-and-wired](https://github.com/user-attachments/assets/53ce4032-b9bb-4403-a1a7-955b23ef1ad9)

We’ll call it “Placeholder Zoo”.

To build this app, we’ll create a Cloudflare Worker that does the following:

*   Takes image dimensions and a short text prompt as part of the URL path: `https://example.com/800x600/sunglasses-sloth`.
*   Enhances the short prompt from the URL to make a better image prompt.
*   Generates an image using the [Flux Schnell](https://replicate.com/black-forest-labs/flux-schnell) model on Replicate.
*   Stores the generated image in Cloudflare Images.
*   Caches the generated image metadata in Cloudflare KV.
*   Uses Cloudflare Transformations to dynamically serve that pre-generated and cached image at the requested dimensions.

[](#prerequisites)Prerequisites
-------------------------------

Here’s what you’ll need to build this project:

*   A [Cloudflare account](https://www.cloudflare.com/plans/free/). You can sign up and [run workers for free](https://workers.cloudflare.com/).
*   A [Replicate account](https://replicate.com/)
*   [Node.js 20](https://nodejs.org/en/download/prebuilt-installer) or later
*   [Git](https://chatgpt.com/share/673d65dc-8e50-8003-8ce2-4bc7053d0e3a), for storing your code changes as you build.

[](#step-1-set-up-your-project)Step 1: Set up your project
----------------------------------------------------------

The Cloudflare team maintains an official CLI tool called [create-cloudflare](https://npm.im/create-cloudflare) (also known as C3) that helps you set up and deploy new applications to Cloudflare. It’s an npm package that you can run directly from the command line.

Run the following command to get started:

```plaintext
npm create cloudflare@latest placeholder-zoo -- \
--type=hello-world \
--lang=ts \
--deploy \
--git
```

This commands takes care of a lot of things for you:

*   Creates a new git repository.
*   Generates a new hello-world Cloudflare worker script written in TypeScript.
*   Installs all the npm packages you need.
*   Configures a `.gitignore` file to avoid committing secrets to your repository.
*   Deploys the worker to Cloudflare.

This will also automatically open a browser window to your new worker’s URL:

![hello, worker!](https://github.com/user-attachments/assets/07e30305-f031-4058-ab96-df98c9f5615b)

[](#step-2-run-the-worker-locally)Step 2: Run the worker locally
----------------------------------------------------------------

Your new worker is now deployed to Cloudflare, but you can also run it locally.

Run the worker on your local machine to make sure everything is set up correctly:

```shell
cd placeholder-zoo
npm run dev
```

You should see output like this:

```plaintext
$ npm run dev
> placeholder-zoo@1.0.0 dev
> wrangler dev
 ⛅️ wrangler 3.88.0
-------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
╭───────────────────────────╮
│  [b] open a browser       │
│  [d] open devtools        │
│  [l] turn off local mode  │
│  [c] clear console        │
│  [x] to exit              │
╰───────────────────────────╯
```

Hit **b** to open the worker in your browser. You should see the “Hello, world!” message.

[](#step-3-set-up-secrets-for-your-worker)Step 3: Set up secrets for your worker
--------------------------------------------------------------------------------

Now that you’ve got your worker running locally, it’s time to add some secrets so your app can make authenticated requests to Replicate and Cloudflare.

Start by creating a file called `.dev.vars`. Cloudflare uses this file to store secrets locally for your worker.

```plaintext
touch .dev.vars
```

Then add the following placeholder values to the `.dev.vars` file:

```plaintext
REPLICATE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_IMAGE_ACCOUNT_HASH=
```

The values that go in this file are secrets, so you should treat them like passwords. Luckily, the `npm create cloudflare` command you ran created a `.gitignore` file that ignores the `.dev.vars` file, so you don’t have to worry about accidentally committing it to your repository.

**Replicate API token**

You’ll need a Replicate API token so you can start running models from your worker.

Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens?new-token-name=cloudflare-cache) and create a new API token, then copy it to your clipboard.

Then paste your Replicate API token into the `.dev.vars` file for local development:

```plaintext
REPLICATE_API_TOKEN=r8_...
```

You’ll also need to set the `REPLICATE_API_TOKEN` secret in your remote worker’s configuration.

Start by logging into Cloudflare using the wrangler CLI:

```shell
npx wrangler login
```

Note: You’ll use `npx wrangler` to run wrangler everywhere in this guide. Using npx ensures you’re using the version of wrangler that is installed locally in the project, rather than a globally isntalled npm package, which can vary from one machine to another.

Then set your Replicate token as a secret on your deployed worker:

```plaintext
npx wrangler secret put REPLICATE_API_TOKEN
```

You should see output like this:

```plaintext
 Enter a secret value: … ****************************************
 Creating the secret for the Worker "placeholder-zoo" 
 Success! Uploaded secret REPLICATE_API_TOKEN
```

**Cloudflare account ID**

To find your Cloudflare account ID, run this command in the terminal:

```shell
npx wrangler whoami
```

Set the `CLOUDFLARE_ACCOUNT_ID` secret in your `.dev.vars` file for local development:

```plaintext
CLOUDFLARE_ACCOUNT_ID=...
```

You’ll also need to set the `CLOUDFLARE_ACCOUNT_ID` secret in your remote worker’s configuration:

```shell
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
```

**Cloudflare API token**

To create a Cloudflare API token for Cloudflare Images, do the following:

1.  Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2.  Click “Create token”.
3.  Find the template called “Read and write to Cloudflare Stream and Images” and click **Use template**.
4.  Scroll down and click **Continue to summary**.
5.  Click **Create token**.
6.  Copy the token to your clipboard.

Set the `CLOUDFLARE_API_TOKEN` secret in your `.dev.vars` file for local development:

```plaintext
CLOUDFLARE_API_TOKEN=...
```

You’ll also need to set the `CLOUDFLARE_API_TOKEN` secret in your remote worker’s configuration:

```shell
npx wrangler secret put CLOUDFLARE_API_TOKEN
```

**Cloudflare Images account hash**

You’ll need your Cloudflare Images account hash so you can construct URLs to your generated images.

To find your Cloudflare Images account hash:

1.  Go to [dash.cloudflare.com](https://dash.cloudflare.com/)
2.  Click on the **Images** tab on the left.
3.  Find the **Account Hash** on the right and copy it to your clipboard.

Set the `CLOUDFLARE_IMAGE_ACCOUNT_HASH` secret in your `.dev.vars` file for local development:

```plaintext
CLOUDFLARE_IMAGE_ACCOUNT_HASH=...
```

You’ll also need to set the `CLOUDFLARE_IMAGE_ACCOUNT_HASH` secret in your remote worker’s configuration:

```shell
npx wrangler secret put CLOUDFLARE_IMAGE_ACCOUNT_HASH
```

Now that you’ve added all the secrets, run this command to check that you’ve set them up correctly on your deployed worker:

```shell
npx wrangler secret list
```

You should see output like this:

```json
[
  {
    "name": "CLOUDFLARE_ACCOUNT_ID",
    "type": "secret_text"
  },
  {
    "name": "CLOUDFLARE_API_TOKEN",
    "type": "secret_text"
  },
  {
    "name": "CLOUDFLARE_IMAGE_ACCOUNT_HASH",
    "type": "secret_text"
  },
  {
    "name": "REPLICATE_API_TOKEN",
    "type": "secret_text"
  }
]
```

[](#step-4-run-replicate-models-from-your-worker)Step 4: Run Replicate models from your worker
----------------------------------------------------------------------------------------------

Now that your worker is running locally and your secrets are set up, you can start running models on Replicate from your worker code.

Install the [`replicate`](https://npm.im/replicate) npm package:

```shell
npm install replicate
```

Create a new file called `src/image-generator.ts`:

```shell
touch src/image-generator.ts
```

Paste the following code into the file:

```typescript
import Replicate from 'replicate'
interface Env {
  REPLICATE_API_TOKEN: string
}
export async function generateImage(prompt: string, env: Env) {
  const replicate = new Replicate({auth: env.REPLICATE_API_TOKEN})
  const model = 'black-forest-labs/flux-schnell'  
  const output = await replicate.run(model, {
    input: {
      prompt,
      image_format: 'webp',
    }
  })
    
  // Some image models return an array of output files, others just a single file.
  const imageUrl = Array.isArray(output) ? output[0].url() : output.url()
  console.log({imageUrl})
  
  return imageUrl
} 
```

Then create a new file called `src/homepage.ts`:

```shell
touch src/homepage.ts
```

Then paste the following code into the `src/homepage.ts` file:

```typescript
export function homepage(): Response {
  const html = `
    <html>
      <body>
        <h1>Placeholder Zoo</h1>
        <p>Examples:</p>
        <ul>
          <li><a href="/800x600/sunglasses-sloth">/800x600/sunglasses-sloth</a></li>
          <li><a href="/512x512/psychic-goat">/512x512/psychic-goat</a></li>
          <li><a href="/1024x768/hippie-lion">/1024x768/hippie-lion</a></li>
          <li><a href="/600x800/punk-giraffe">/600x800/punk-giraffe</a></li>
        </ul>
      </body>
    </html>
  `;
  return new Response(html, { 
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
} 
```

Replace the contents of your `src/index.ts` file with the following code:

```typescript
import { homepage } from './homepage'
import { generateImage } from './image-generator'
export interface Env {
  REPLICATE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_IMAGE_ACCOUNT_HASH: string
  IMAGE_CACHE: KVNamespace
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    // Example: /800x600/sunglasses-sloth
    const [dimensions, animal] = url.pathname.split('/').filter(Boolean)
    // Render the homepage if the path is invalid
    if (!dimensions || !animal) return homepage()
    // Turn `/800x600/sunglasses-sloth` into a text prompt
    const [targetWidth, targetHeight] = dimensions.toLowerCase().split('x').map(n => Number.parseInt(n, 10))
    const prompt = `A high-quality image of a ${animal} holding up a sign with the words "${targetWidth} by ${targetHeight}"`
    // Generate the image
    const imageUrl = await generateImage(prompt, env)
        
    // Fetch the image and return it
    const imageResponse = await fetch(imageUrl)
    return new Response(imageResponse.body, {
      headers: {
        'content-type': 'image/webp',
      }
    })
  }
}
```

Now run the worker again:

```shell
npm run dev
```

Open this URL in your browser: [localhost:8787/1600x900/cinephile-rat](http://localhost:8787/1600x900/cinephile-rat)

You should see a generated image that looks something like this:

![cinephile-rat](https://github.com/user-attachments/assets/dc3b4697-e180-45b2-9b06-0ab9765f18a6)

This is another good time to commit your changes to Git:

```shell
git add .
git commit -m "Run Replicate models from the worker"
```

[](#step-5-store-your-generated-images-in-cloudflare)Step 5: Store your generated images in Cloudflare
------------------------------------------------------------------------------------------------------

When you run models with Replicate’s API, any output files generated by the model are returned as HTTPS URLs that are automatically deleted after an hour. If you want to keep your output files for longer than an hour, you need to save a copy of them somewhere.

You’ll use [Cloudflare Images](https://developers.cloudflare.com/images) to store your generated images, and [Cloudflare KV](https://developers.cloudflare.com/kv/) as a key-value datastore so you can do quick lookups of images that have already been generated.

Create a new file called `src/image-uploader.ts`:

```shell
touch src/image-uploader.ts
```

Then add the following code to the file:

```typescript
interface CloudflareEnv {
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_API_TOKEN: string
}
interface UploadResponse {
  result: {
    id: string
    variants: string[]
  }
}
export async function uploadToCloudflareImages (imageUrl: string, env: CloudflareEnv): Promise<string> {
  console.log('Uploading image to Cloudflare Images:', imageUrl)
  const imageResponse = await fetch(imageUrl)
  const imageBlob = await imageResponse.blob()
  const formData = new FormData()
  formData.append('file', imageBlob)
  const uploadResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1`, 
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`
      },
      body: formData
    }
  )
  const result = (await uploadResponse.json()) as UploadResponse
  
  if (!uploadResponse.ok) {
    console.error('Failed to upload to Cloudflare Images:', result)
    throw new Error('Failed to upload image')
  }
  console.log('Successfully uploaded to Cloudflare Images:', result)
  return result.result.id
} 
```

Then add this line to your `src/index.ts` file, after the `generateImage` function:

```typescript
// Upload the image to Cloudflare Images
const cloudflareImageId = await uploadToCloudflareImages(imageUrl, env)
```

[](#step-6-cache-metadata-in-cloudflare-kv)Step 6: Cache metadata in Cloudflare KV
----------------------------------------------------------------------------------

Each time you upload an image to Cloudflare Images, you’ll also store some metadata about the image in Cloudflare KV. This will let you quickly look up whether an image has already been generated, so you can return the existing image without re-running the model.

Use Wrangler to create a new KV namespace:

```shell
npx wrangler kv:namespace create "IMAGE_CACHE"
```

You should see output like this:

```plaintext
 ⛅️ wrangler 3.88.0
-------------------
 Creating namespace with title "placeholder-zoo-IMAGE_CACHE"
 Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "IMAGE_CACHE"
id = "3c8ce31144a0467080700b241fb6bfdc"
```

The “configuration file” the above message is referring to is your `wrangler.toml` file.

Next, update your worker code to check the KV store before generating an image, and cache the generated image ID in KV if it’s not already cached.

You’ll store the request pathname (e.g. `/800x600/sunglasses-sloth`) as a key, and the Cloudflare Images ID (e.g. `ab6b3a38-1957-4b8d-91de-3aadf0f22211`) as the value.

Overwrite the contents of your `src/index.ts` file with the following code:

```typescript
import { homepage } from './homepage'
import { uploadToCloudflareImages } from './image-uploader'
import { generateImage } from './image-generator'
export interface Env {
  REPLICATE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_IMAGE_ACCOUNT_HASH: string
  IMAGE_CACHE: KVNamespace
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    // Example: /800x600/sunglasses-sloth
    const [dimensions, animal] = url.pathname.split('/').filter(Boolean)
    // Render the homepage if the path is invalid
    if (!dimensions || !animal) return homepage()
    // Turn `/800x600/sunglasses-sloth` into a text prompt
    const [targetWidth, targetHeight] = dimensions.toLowerCase().split('x').map(n => Number.parseInt(n, 10))
    const prompt = `A high-quality image of a ${animal} holding up a sign with the words "${targetWidth} by ${targetHeight}"`
    // Check for a cached image id that matches this request URL
    const cacheKey = url.pathname
    // If the request has a `?redo` query param, we'll bypass the cache
    const shouldBypassCache = url.searchParams.has('redo')
    const cachedImageId = shouldBypassCache ? null : await env.IMAGE_CACHE.get(cacheKey)
    let cloudflareImageId: string
    if (cachedImageId) {
      console.log('Cache hit for:', cacheKey)
      cloudflareImageId = cachedImageId
    } else {
      console.log(shouldBypassCache ? 'Bypassing cache due to redo parameter' : 'Cache miss for:', cacheKey)
      // Generate the image
      const replicateImageUrl = await generateImage(prompt, env)
      console.log('Generated image URL:', replicateImageUrl)
      // Upload the image to Cloudflare Images
      cloudflareImageId = await uploadToCloudflareImages(replicateImageUrl, env)
      console.log('Cloudflare Images ID:', cloudflareImageId)
      // Cache the image ID
      await env.IMAGE_CACHE.put(cacheKey, cloudflareImageId)
      console.log('Stored in cache:', cacheKey, cloudflareImageId)
    }
    const transformations = {
      width: targetWidth,
      height: targetHeight,
      fit: "cover"
    }
    const transformationsString = Object.entries(transformations).map(([k,v]) => `${k}=${v}`).join(',')
    const transformedImageUrl = `https://imagedelivery.net/${env.CLOUDFLARE_IMAGE_ACCOUNT_HASH}/${cloudflareImageId}/${transformationsString}`;
    console.log({transformedImageUrl})
        
    // Fetch the image and return it
    const imageResponse = await fetch(transformedImageUrl)
    return new Response(imageResponse.body, {
      headers: {
        'content-type': 'image/webp',
      }
    })
  }
}
```

[](#step-7-deploy-your-updated-worker)Step 7: Deploy your updated worker
------------------------------------------------------------------------

You’ve been iterating on your worker locally, so now it’s time to deploy your changes to Cloudflare:

```shell
npm run deploy
```

You should see output like this:

```plaintext
Deployed placeholder-zoo triggers (0.32 sec)
  https://placeholder-zoo.ziki.workers.dev
```

Go to the URL in the output and you should see a landing page with links to example images.

* * *

If you encounter any errors when running your remote worker, you can use the `wrangler tail` command to see the logs:

```plaintext
npx wrangler tail
```

[](#next-steps)Next steps
-------------------------

Congratulations! You’ve built a Cloudflare Worker that:

*   Generates images using Replicate.
*   Caches output files in durable storage on Cloudflare.
*   Serves images dynamically with [transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/) like scaling, cropping, and filters.

Here are some suggestions for next steps:

*   Experiment with different [image generation models](https://replicate.com/collections/text-to-image) to see which one works best for you.
*   Try different [image transformations](https://developers.cloudflare.com/images/transform-images/transform-via-url/).
*   Use a [GitHub Actions workflow](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler) to automatically deploy your worker when you push changes to your GitHub repo.

Happy hacking!

--- END OF cloudflare-image-cache.md ---


# FILE: openai-realtime.md

This guide will show you how to build a simple hosted web app that lets you use realtime voice commands to call functions and run Replicate models right in your web browser.

Here’s a video demo of the app in action:

[Chatting with a webpage in English, Spanish, and French](https://x.com/zeke/status/1869877465524646245)

We tip our hat to [Craig Dennis](https://bsky.app/profile/craigsdennis.dev), a Developer Educator at Cloudflare who wrote [the original demo](https://www.youtube.com/watch?v=TcOytsfva0o) that inspired this guide.

[](#what-are-we-building)What are we building?
----------------------------------------------

By the end of this guide, you’ll have a serverless web app running locally, and deployed to the cloud. You’ll be able to run Replicate models using your voice, and easily extend the app to support more voice-activated features using other tools and APIs.

You’ll use the following technologies:

*   [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) over WebRTC for realtime speech recognition and synthesis.
*   [Cloudflare](https://cloudflare.com) for hosting the web app. It’s a powerful platform for building modern serverless web applications, and it’s free to get started.
*   [Hono](https://hono.dev/) for the app code. Hono is a web framework built and maintained by Cloudflare, and it’s perfect for building web apps with serverless backend functions using TypeScript.
*   [Replicate](https://replicate.com) for running the AI models.

[](#prerequisites)Prerequisites
-------------------------------

Here’s what you’ll need to build this project:

*   An [OpenAI account](https://platform.openai.com/signup). No special plan is required to use the Realtime API Beta.
*   A [Cloudflare account](https://www.cloudflare.com/plans/free/). You can sign up and [run workers for free](https://workers.cloudflare.com/).
*   A [Replicate account](https://replicate.com/).
*   [Node.js 20](https://nodejs.org/en/download/prebuilt-installer) or later.
*   [Git](https://chatgpt.com/share/673d65dc-8e50-8003-8ce2-4bc7053d0e3a) for cloning the project from GitHub.

[](#what-is-cloudflare)What is Cloudflare?
------------------------------------------

You might know of Cloudflare as a DNS provider, or as a CDN, or as a DDoS protection service. But Cloudflare is also a platform for building modern web applications. We run a lot of Replicate’s own infrastructure on Cloudflare, and we love its reliability and focus on developer experience.

Cloudflare has lots of products for building web applications (see our [guide to building an image cache](/docs/guides/cloudflare-image-cache)), but in this guide you’ll just be using [Cloudflare Workers](https://developers.cloudflare.com/workers).

You can get started running Workers for free, and they have [generous free tier limits](https://developers.cloudflare.com/workers/platform/pricing/), including 100,000 requests per day.

[](#what-is-openai-realtime)What is OpenAI Realtime?
----------------------------------------------------

OpenAI’s [Realtime API](https://platform.openai.com/docs/guides/realtime) (currently in beta as of April 2025) is a low-latency, multimodal API that enables speech-to-speech conversations, realtime transcription, and function calling.

What does that mean? It means you can talk to it, and it can talk back, in real time!

The Realtime API is multilingual. As you heard in the [demo video](https://x.com/zeke/status/1869877465524646245) above, you can speak in English, Spanish, French, and [many other languages](https://platform.openai.com/docs/guides/speech-to-text/supported-languages#supported-languages) and it will automatically switch to that language, without any configuration on your part. Pretty cool!

You can use the Realtime API with Websockets or WebRTC, but in this guide you’ll use WebRTC, which is ideal for client-side applications like web apps. You don’t need to know the details of how WebRTC works to follow this guide, but if you’re curious, you can read more about it on [OpenAI’s WebRTC docs](https://platform.openai.com/docs/guides/realtime#connect-with-webrtc).

[](#what-is-function-calling)What is function calling?
------------------------------------------------------

The OpenAI Realtime API supports function calling, also known as [“tool use” in Anthropic parlance](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview). Function calling allows language models like ChatGPT and Claude to interact with predefined functions in your application.

As the app author, you define functions with specific parameters and descriptions, and the language model can understand when and how to use these functions based on natural language input.

Let’s look at an example of function calling that changes the background color of a web page.

You define a simple function like this:

```ts
function changeBackgroundColor(color: string) {
    document.body.style.backgroundColor = color;
}
```

Then you tell the language model about your function and its parameters:

```ts
{
    name: 'changeBackgroundColor',
    description: 'Changes the background color of a web page',
    parameters: {
        type: 'object',
        properties: {
            color: { type: 'string', description: 'A hex value of the color' },
        }
    }
}
```

Then when a user says something like “Change the background color to red”, or “Cambia el color de fondo a rojo”, or “把背景颜色改成红色”, the language model can understand that and call the function with appropriate arguments:

```ts
changeBackgroundColor('#FF0000');
```

We’ll dig into function calling in more detail later in this guide.

[](#step-1-clone-the-starter-project)Step 1: Clone the starter project
----------------------------------------------------------------------

Okay, so now you know about Cloudflare, OpenAI Realtime, and function calling. It’s time to actually build something!

We’ve created a starter repository on GitHub at [replicate/getting-started-openai-realtime](https://github.com/replicate/getting-started-openai-realtime) that has the app already set up.

Use Git to clone the repository:

```plaintext
git clone https://github.com/replicate/getting-started-openai-realtime openai-realtime-starter
cd openai-realtime-starter
```

Then install the dependencies:

```plaintext
npm install
```

[](#step-2-set-up-secrets)Step 2: Set up secrets
------------------------------------------------

Before you can run the app locally, you’ll need two secrets for your project:

*   A Replicate API token: create one at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens?new-token-name=openai-realtime)
*   An OpenAI API key: create one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

Cloudflare uses a text file called `.dev.vars` to store secrets locally for your worker.

Create that file by copying the example file:

```plaintext
cp .dev.vars.example .dev.vars
```

Then add your secrets to the `.dev.vars` file:

```plaintext
REPLICATE_API_TOKEN=...
OPENAI_API_KEY=...
```

The values that go in this file are secrets, so you should treat them like passwords. Luckily, the project’s `.gitignore` file is already set up to ignore the `.dev.vars` file, so you don’t have to worry about accidentally committing it to your repository.

[](#step-3-run-the-app-locally)Step 3: Run the app locally
----------------------------------------------------------

Now that you’ve cloned the project, installed the dependencies, and set up the secrets locally, you can run the app locally:

```shell
npm run dev
```

You should see output like this:

```plaintext
> openai-realtime@0.0.0 dev
> wrangler dev
Your worker has access to the following bindings:
- Vars:
  - OPENAI_API_KEY: "(hidden)"
  - REPLICATE_API_TOKEN: "(hidden)"
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:3000
╭───────────────────────────╮
│  [b] open a browser       │
│  [d] open devtools        │
│  [l] turn off local mode  │
│  [c] clear console        │
│  [x] to exit              │
╰───────────────────────────╯
```

Press `b` to open the app in your browser.

This should open [http://localhost:3000](http://localhost:3000) in your browser, and you should see a permissions dialog asking you to allow the app to access your microphone.

Once you allow that, you can start talking.

Try saying these commands:

> Change the background to the color of the sky

> Change the text to the color of a polar bear

> Create an image of a hipster cat riding a bicycle

You should see the page change in real time as you talk, and sometimes you’ll hear a voice response from the OpenAI assistant. You can interrupt the assistant if it’s talking too much.

If you don’t see or hear anything, you may not have correctly set up your secrets. Check the browser console for errors, and look at the terminal output from the `npm run dev` command to see if there are any issues. If you’re still stuck, open an issue on the [GitHub repo](https://github.com/replicate/getting-started-openai-realtime/issues).

[](#step-4-deploy-the-app-to-cloudflare)Step 4: Deploy the app to Cloudflare
----------------------------------------------------------------------------

Now that you’ve got the app running locally, it’s time to deploy it to Cloudflare so other people can use it.

Start by logging into Cloudflare using the Wrangler CLI:

```shell
npx wrangler login
```

Note: You’ll use `npx wrangler` to run wrangler everywhere in this guide. Using `npx` guarantees that you’re using the version of wrangler that is installed locally in the project, rather than a globally isntalled npm package, which can vary from one machine to another.

Then run this command to deploy the worker to Cloudflare:

```shell
npm run deploy
```

You’ve got your secrets set up locally in the `.dev.vars` file, but you’ll also need to set them up on your deployed worker.

Then set your Replicate token as a secret on your deployed worker:

```plaintext
npx wrangler secret put REPLICATE_API_TOKEN
```

You should see output like this:

```plaintext
 Enter a secret value: … ****************************************
 Creating the secret for the Worker "openai-realtime" 
 Success! Uploaded secret REPLICATE_API_TOKEN
```

Then set your OpenAI API key as a secret on your deployed worker:

```plaintext
npx wrangler secret put OPENAI_API_KEY
```

Now that you’ve added all the secrets, run this command to check that you’ve set them up correctly on your deployed worker:

```shell
npx wrangler secret list
```

You should see output like this:

```json
[
  {
    "name": "REPLICATE_API_TOKEN",
    "type": "secret_text"
  },
  {
    "name": "OPENAI_API_KEY",
    "type": "secret_text"
  }
]
```

Now you’ve got the app running locally and deployed to Cloudflare!

[](#step-5-add-a-new-function)Step 5: Add a new function
--------------------------------------------------------

Let’s add a new function to the app, so you can familiarize yourself with the codebase and the process of adding new functions.

We’ll add a function that draws confetti on the screen whenever you say a command aloud like “make it rain” or “show me some confetti”.

Rather than doing the hard work of writing code for our own confetti function, we’ll use [canvas-confetti](https://www.npmjs.com/package/canvas-confetti), a popular and well-maintained JavaScript library for animating confetti in the browser. Gotta love open source!

Open the `public/index.html` file and add a script tag in the `<head>` section that loads the confetti function from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
```

Next, open `public/app.js`. This is the client-side code that runs in the browser.

Add a new function called `makeItRain` to the `fns` object, right after the other functions:

```js
const fns = {
	// changeBackgroundColor: ({ color }) => ...
	// changeTextColor: ({ color }) => ...
	// generateImage: async ({ prompt }) => ...,
	makeItRain: () => {
		confetti({
			particleCount: 200,
			spread: 180,
			startVelocity: 45
		});
		return { success: true };
	}
};
```

Next, update the `configureData` function to let OpenAI know about your new function:

```js
{
  type: 'function',
  name: 'makeItRain',
  description: 'Creates a confetti effect on the screen'
}
```

Now go back to your browser, refresh the page, and say “make it rain” or “show me some confetti”. You should see a confetti effect on the screen:

Make it rain confetti with a voice command.

[](#next-steps)Next steps
-------------------------

You’ve now got a working app that lets you use real-time voice commands to call functions and run Replicate models right in your web browser. Pretty cool!

But there’s a lot more you can do. Here are some ideas:

*   Make a visual storytelling app that captures your ideas and turns them into stories with images.
*   Build a voice-powered AI model search tool using [Replicate’s `models.search` API](https://replicate.com/docs/reference/http#models.search).
*   Create a new function that lets you iterate on designs using [image-to-image models](https://replicate.com/collections/image-editing).
*   Generate images or video using your webcam as input.
*   Create a foreign language tutor.
*   Build an audio-visual translation tool.

We’d love to see what you build with these powerful new tools.

Share your project on [X](https://x.com/replicate) or [Discord](https://discord.gg/replicate) and tag us.

--- END OF openai-realtime.md ---


# FILE: push-a-model.md

Learn how to package your own trained model using [Cog](https://github.com/replicate/cog) and push it to Replicate.

By the end of this guide your model will have an interactive GUI and its own HTTP API. You’ll also have the option to publicly share your model so anyone can try it.

![Replicate's GUI](https://user-images.githubusercontent.com/14149230/216632189-c700efb3-128d-4882-99ad-ef8843eb5eaf.png)

_By the end of this guide, your model will have its own [interactive GUI](https://replicate.com/stability-ai/stable-diffusion) and [HTTP API](https://replicate.com/stability-ai/stable-diffusion/api)._

[](#prerequisites)Prerequisites
-------------------------------

*   **A trained model in a directory on your computer.** Your model’s saved weights, alongside any code that is needed to run it. If you don’t already have your own trained model, you can use one from [replicate/cog-examples](https://github.com/replicate/cog-examples).
*   **Docker.** You’ll be using the Cog command-line tool to build and push your model. Cog uses Docker to create a container for your model. You’ll need to [install and start Docker](https://docs.docker.com/get-docker/) before you can run Cog. You can confirm Docker is running by typing `docker info` in your terminal.
*   **An account on Replicate.**

[](#create-a-model-page-on-replicate)Create a model page on Replicate
---------------------------------------------------------------------

Next you’ll [create a page for your model](/docs/topics/models/create-a-model) on Replicate, if you haven’t already. Visit [replicate.com/create](https://replicate.com/create) to choose a name for your model, and specify whether it should be public or private.

[](#install-cog)Install Cog
---------------------------

Cog is an open source tool that makes it easy to put a machine learning model in a Docker container. Run the following commands to install it and set the correct permissions:

```bash
sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
sudo chmod +x /usr/local/bin/cog
```

Refer to GitHub for [more information about Cog and its full documentation.](https://github.com/replicate/cog)

[](#initialize-cog)Initialize Cog
---------------------------------

To configure your project for use with Cog, you’ll need to add two files to the directory containing your model:

*   [`cog.yaml` defines system requirements, Python package dependencies, etc.](https://github.com/replicate/cog/blob/main/docs/yaml.md)
*   [`predict.py` describes the prediction interface for your model](https://github.com/replicate/cog/blob/main/docs/python.md)

Use the `cog init` command to generate these files in your project:

```bash
cd path/to/your/model
cog init
```

[](#define-your-dependencies)Define your dependencies
-----------------------------------------------------

The `cog.yaml` file defines all of the different things that need to be installed for your model to run. You can think of it as a simple way of defining a Docker image.

For example:

```yaml
build:
  python_version: "3.12"
  python_packages:
    - "torch==2.3.1"
```

This will generate a Docker image with Python 3.12 and PyTorch 2.3.1 installed and various other sensible best practices.

### [](#using-gpus)Using GPUs

To use GPUs, add the `gpu: true` option to the `build` section of your `cog.yaml`:

```yaml
build:
  gpu: true
  # ...
```

Cog will use the [nvidia-docker](https://github.com/NVIDIA/nvidia-docker) base image and automatically figure out what versions of CUDA and cuDNN to use based on the version of Python, PyTorch, and Tensorflow that you’re using.

### [](#running-commands)Running commands

To run a command inside this environment, prefix it with `cog run`:

```bash
$ cog run python
Building Docker image from cog.yaml...
[...]
Running 'python' in Docker with the current directory mounted as a volume...
Python 3.12.6 (main, Sep  9 2024, 18:06:16) [GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

This is handy for ensuring a consistent environment for development or training.

With `cog.yaml`, you can also install system packages and other things. [Take a look at the full reference to explore what else you can do.](https://github.com/replicate/cog/blob/main/docs/yaml.md)

[](#define-how-to-run-predictions)Define how to run predictions
---------------------------------------------------------------

The next step is to update `predict.py` to define the interface for running [predictions](/docs/topics/predictions) on your model. The `predict.py` generated by `cog init` looks something like this:

```python
from cog import BasePredictor, Path, Input
import torch
class Predictor(BasePredictor):
    def setup(self):
        """Load the model into memory to make running multiple predictions efficient"""
        self.net = torch.load("weights.pth")
    def predict(self,
            image: Path = Input(description="Image to enlarge"),
            scale: float = Input(description="Factor to scale image by", default=1.5)
    ) -> Path:
        """Run a single prediction on the model"""
        # ... pre-processing ...
        output = self.net(input)
        # ... post-processing ...
        return output
```

Edit your `predict.py` file and fill in the functions with your own model’s setup and prediction code. You might need to import parts of your model from another file.

You should keep your model weights in the same directory as your `predict.py` file, or a subdirectory underneath it, and load them directly off disk in your `setup()` function, as shown in the example above. This will make it more efficient to load and easier to version because it will get copied into the Docker image that Cog produces.

You also need to define the inputs to your model as arguments to the `predict()` function, as demonstrated above. For each argument, you need to annotate with a type. The supported types are:

*   `str`: a string
*   `int`: an integer
*   `float`: a floating point number
*   `bool`: a boolean
*   `cog.File`: a file-like object representing a file
*   `cog.Path`: a path to a file on disk

You can provide more information about the input with the `Input()` function, as shown above. It takes these basic arguments:

*   `description`: A description of what to pass to this input for users of the model
*   `default`: A default value to set the input to. If this argument isn’t passed, then the input is required. If it’s explicitly set to `None`, the input is optional.
*   `ge`: For `int` or `float` types, the value should be greater than or equal to this number.
*   `le`: For `int` or `float` types, the value should be less than or equal to this number.
*   `choices`: For `str` or `int` types, a list of possible values for this input.

There are some more advanced options you can pass, too. For more details, refer to [the prediction interface documentation](https://github.com/replicate/cog/blob/main/docs/python.md).

Next, add the line `predict: "predict.py:Predictor"` to your `cog.yaml`, so it looks something like this:

```yaml
build:
  python_version: "3.12"
  python_packages:
    - "torch==2.3.1"
predict: "predict.py:Predictor"
```

That’s it!

[](#test-your-model-locally)Test your model locally
---------------------------------------------------

To test that this works, try running a prediction on the model:

```bash
$ cog predict -i image=@input.jpg
 Building Docker image from cog.yaml... Successfully built 664ef88bc1f4
 Model running in Docker image 664ef88bc1f4
Written output to output.png
```

To pass more inputs to the model, you can add more `-i` options:

```bash
$ cog predict -i image=@image.jpg -i scale=2.0
```

In this case it’s just a number, not a file, so you don’t need the `@` prefix.

[](#push-your-model)Push your model
-----------------------------------

Now that you’ve configured your model for use with Cog and you have a corresponding model page on Replicate, it’s time to publish it to Replicate’s registry:

```shell
cog login
cog push r8.im/<your-username>/<your-model-name>
```

Your username and model name must match the values you set on Replicate.

Note

You can also set the [image](https://github.com/replicate/cog/blob/main/docs/yaml.md#image) property in your `cog.yaml` file. This allows you to run `cog push` without specifying the image, and also makes your model page on Replicate more discoverable for folks reading your model’s source code.

[](#run-predictions)Run predictions
-----------------------------------

Once you’ve pushed your model to Replicate it will be visible on the website, and you can use the web-based form to run predictions using your model.

To run predictions in the cloud from your code, you can use the [Python client library](https://github.com/replicate/replicate-python).

Install it from pip:

```bash
pip install replicate
```

Authenticate by setting your token in an environment variable:

```shell
export REPLICATE_API_TOKEN=r8_******
```

Then, you can use the model from your Python code:

```python
import replicate
output = replicate.run(
    "replicate/hello-world:5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa",
    input={"text": "python"}
)
print(output)  # "hello python"
```

To pass a file as an input, use a file handle or URL:

```python
image = open("mystery.jpg", "rb")
# or...
image = "https://example.com/mystery.jpg"
output = replicate.run(
    "replicate/resnet:dd782a3d531b61af491d1026434392e8afb40bfb53b8af35f727e80661489767",
    input={"image": image}
)
# If your model returns a file, save it like this:
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

URLs are more efficient if your file is already in the cloud somewhere, or it’s a large file.

For more details about handling file outputs, see the [Output files documentation](/docs/topics/predictions/output-files).

You can also run your model with the raw HTTP API. [Refer to the HTTP API reference](https://replicate.com/docs/reference/http) for more details.

--- END OF push-a-model.md ---

