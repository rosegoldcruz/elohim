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