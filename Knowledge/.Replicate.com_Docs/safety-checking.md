Image generation models like [Stability AI’s SDXL](https://replicate.com/stability-ai/sdxl) and [Black Forest Labs’ Flux](https://replicate.com/black-forest-labs/flux-dev) include a safety checker to prevent the model from generating images that portray nudity, violence, and other unsafe content.

To protect users from generating unsafe content, we enable the safety checker for web predictions on the [SDXL base model](https://replicate.com/stability-ai/sdxl), the [Flux base model](https://replicate.com/black-forest-labs/flux-dev), and all derivative fine-tunes of both SDXL and Flux.

The safety checker is intended to protect users, but it can sometimes be too restrictive or generate false positives, incorrectly flagging safe content as unsafe. For those cases, you can disable the safety checker when running the model with the API. This gives you the flexibility to use a [custom safety-checking model](https://replicate.com/zsxkib/stable-diffusion-safety-checker) or a third-party service as part of your workflow.

For more details on allowed use, see the [terms of service](https://replicate.com/terms).