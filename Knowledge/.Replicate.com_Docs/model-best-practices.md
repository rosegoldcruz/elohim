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