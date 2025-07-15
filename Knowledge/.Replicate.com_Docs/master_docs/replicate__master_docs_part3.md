
# FILE: make-images-of-real-people-instantly-with-instant-id.md

![InstantID](/_content/assets/instantidcover.BK1LVlaX_arL2m.webp)

InstantID is a new state-of-the-art tuning-free method to achieve ID-Preserving generation with only a single image. Think of it like instant DreamBooth.

With Replicate, you can run InstantID in the cloud with one line of code.

[](#run-instantid-in-our-playground)Run InstantID in our Playground
-------------------------------------------------------------------

Want to try out InstantID without writing code? Check out [our InstantID model playground](https://replicate.com/zsxkib/instant-id).

[](#run-instantid-with-an-api)Run InstantID with an API
-------------------------------------------------------

With Replicate, you can run InstantID in the cloud with one line of code.

[](#usage-tips)Usage Tips
-------------------------

*   For higher similarity, increase the weight of controlnet\_conditioning\_scale (IdentityNet) and ip\_adapter\_scale (Adapter).
*   For over-saturation, decrease the ip\_adapter\_scale. If not work, decrease controlnet\_conditioning\_scale.
*   For higher text control ability, decrease ip\_adapter\_scale.
*   For specific styles, choose corresponding base model makes differences.
*   We have not supported multi-person yet, will only use the largest face as reference pose.

[](#run-instantid-with-javascript)Run InstantID with JavaScript
---------------------------------------------------------------

You can run InstantID with our [official JavaScript client](https://github.com/replicate/replicate-javascript):

```bash
npm install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Import and set up the client:

```javascript
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
```

Run zsxkib/instant-id using Replicate’s API:

```javascript
const output = await replicate.run(
  "zsxkib/instant-id:latest",
  {
    input: {
		"image": "https://replicate.delivery/pbxt/KIIutO7jIleskKaWebhvurgBUlHR6M6KN7KHaMMWSt4OnVrF/musk_resize.jpeg",
		"width": 640,
		"height": 640,
		"prompt": "analog film photo of a man. faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage, masterpiece, best quality",
		"sdxl_weights": "protovision-xl-high-fidel",
		"guidance_scale": 5,
		"negative_prompt": "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured (lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch,deformed, mutated, cross-eyed, ugly, disfigured",
		"ip_adapter_scale": 0.8,
		"num_inference_steps": 30,
		"disable_safety_checker": False,
		"controlnet_conditioning_scale": 0.8
    }
  }
);
console.log(output);
```

Note that InstandID takes an image as input. You can provide URLs or base 64 strings as values for the image.

To learn more, take a [look at the guide on getting started with Node.js](https://replicate.com/docs/get-started/nodejs).

[](#run-instantid-with-python)Run InstantID with Python
-------------------------------------------------------

You can run InstantID with our [official Python client](https://github.com/replicate/replicate-python):

```bash
pip install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run zsxkib/instant-id using Replicate’s API:

```python
import replicate
output = replicate.run(
    "zsxkib/instant-id:latest",
    input={
		"image": "https://replicate.delivery/pbxt/KIIutO7jIleskKaWebhvurgBUlHR6M6KN7KHaMMWSt4OnVrF/musk_resize.jpeg",
		"width": 640,
		"height": 640,
		"prompt": "analog film photo of a man. faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage, masterpiece, best quality",
		"sdxl_weights": "protovision-xl-high-fidel",
		"guidance_scale": 5,
		"negative_prompt": "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured (lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch,deformed, mutated, cross-eyed, ugly, disfigured",
		"ip_adapter_scale": 0.8,
		"num_inference_steps": 30,
		"disable_safety_checker": False,
		"controlnet_conditioning_scale": 0.8
    }
)
print(output)
```

Note that InstandID takes an image as input. You can provide URLs or base 64 strings as values for the image.

To learn more, take a look at the guide on [getting started with Python](https://replicate.com/docs/get-started/python).

[](#run-instantid-with-curl)Run InstantID with cURL
---------------------------------------------------

You can call the [HTTP API](https://replicate.com/docs/reference/http) directly with tools like cURL:

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run zsxkib/instant-id using Replicate’s API:

```bash
curl -s -X POST \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d $'{
    "version": "c98b2e7a196828d00955767813b81fc05c5c9b294c670c6d147d545fed4ceecf",
    "input": {
		"image": "https://replicate.delivery/pbxt/KIIutO7jIleskKaWebhvurgBUlHR6M6KN7KHaMMWSt4OnVrF/musk_resize.jpeg",
		"width": 640,
		"height": 640,
		"prompt": "analog film photo of a man. faded film, desaturated, 35mm photo, grainy, vignette, vintage, Kodachrome, Lomography, stained, highly detailed, found footage, masterpiece, best quality",
		"sdxl_weights": "protovision-xl-high-fidel",
		"guidance_scale": 5,
		"negative_prompt": "(lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured (lowres, low quality, worst quality:1.2), (text:1.2), watermark, painting, drawing, illustration, glitch,deformed, mutated, cross-eyed, ugly, disfigured",
		"ip_adapter_scale": 0.8,
		"num_inference_steps": 30,
		"disable_safety_checker": False,
		"controlnet_conditioning_scale": 0.8
    }
  }' \
  https://api.replicate.com/v1/models/zsxkib/instant-id/predictions
```

Note that InstandID takes an image as input. You can provide URLs or base 64 strings as values for the image.

To learn more, take a look at [Replicate’s HTTP API](https://replicate.com/docs/reference/http) reference docs.

You can also run InstantID using [other Replicate client libraries for Golang, Swift, Elixir, and others](https://replicate.com/docs/reference/client-libraries)

[](#keep-up-to-speed)Keep up to speed
-------------------------------------

*   [Check out our InstantID model page](https://replicate.com/zsxkib/instant-id)
*   [Follow us on Twitter X to get the latest from Replicate](https://x.com/replicate)
*   [Hop in our Discord and talk InstantID](https://discord.gg/replicate)

--- END OF make-images-of-real-people-instantly-with-instant-id.md ---


# FILE: prompt-and-run-open-source-large-language-models.md

Large language models (LLMs) are deep learning models trained on text. They are used to predict, classify, and generate text, but they can do a lot more: language models provide the “text” side of text-to-image models, and some modern LLMs can use multimodal inputs like images.

In this guide we’ll cover the basic concepts behind LLMs, how to use them, how to find the right model for your needs, and some advanced techniques for prompt engineering.

[](#why-large)Why “large”?
--------------------------

Language modeling is not a brand new discipline. Researchers and engineers have been modeling language for decades with statistical methods, hand-coded grammars, even regular expressions. But over the last few years we’ve seen the [Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html): the most effective improvements in AI come from general methods that scale well with computation.

The “large” in Large Language Model is not a specific amount of compute or data. It refers to a qualitative shift that comes when you train a model with enough layers, enough parameters, and enough data: bigger suddenly becomes _better_. Language models have gone from auto-suggesting the next word, to writing essays and code and poetry, powered by the application of data and compute.

[](#but-i-dont-have-a-supercomputer)But I don’t have a supercomputer!
---------------------------------------------------------------------

These models are extremely expensive to train. The biggest companies in the world are competing to have the biggest GPU cluster and train models with the most parameters. But that doesn’t mean you can’t use them!

Companies like Meta, Google and Mistral have released not just the code, but the trained weights of their models FOR the community to build on. Training on web-scale datasets is the expensive part of the process. Using them to make predictions, or _inference_, requires much less computation. You can even run open models on your local computer, if you have the hardware and/or patience.

You can also call open models through Replicate’s API. Run models like Meta’s Llama, Google’s Flan-T5, or Mistral’s Mixtral in seconds with just an API key.

[](#sections-in-this-guide)Sections in this guide
-------------------------------------------------

*   [How to use open source language models](/guides/language-models/how-to-use)  
    A guide to the key concepts and parameters of LLMs, and how to use them to generate text.
*   [Use cases for language models](/guides/language-models/use-cases)  
    What can you do with LLMs? A guide to the different use cases for language models.
*   [Popular language models](/guides/language-models/popular-models)  
    A guide to the most popular open source language models, their strengths and weaknesses.
*   [How to prompt LLMs](/guides/language-models/how-to-prompt)  
    Techniques for prompting LLMs, and how to get the best results.
*   [Advanced prompting](/guides/language-models/advanced-prompting)  
    A guide to advanced prompt engineering in theory and practice.

[](#how-to-use-open-source-language-models)How to use open source language models
=================================================================================

Let’s cover the basics of how to use open source language models by exploring the important language model parameters, and how they work.

To work through these examples, you can use a [language model on Replicate, like meta/llama-3.1-405b-instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct).

*   [prompt](#prompt)
*   [tokens](#tokens)
*   [context window](#context-window)
*   [system prompt](#system-prompt)
*   [temperature](#temperature)
*   [top\_p](#top_p)
*   [top\_k](#top_k)
*   [minimum and maximum tokens](#minimum-and-maximum-new-tokens)
*   [stop sequences](#stop-sequences)
*   [frequency penalty](#frequency-penalty)

[](#prompt)Prompt
-----------------

The most important parameter for language models is the `prompt`. The `prompt` is the primary input instruction for the language model. When you feed the prompt to the language model, the language model responds with what it thinks is the most-likely next word.

Try out some of your own prompts below.

> Tell me a story about cats!

[](#tokens)Tokens
-----------------

Tokens are the foundational unit of language model inputs and outputs. Language models don’t see words or characters like you and I — they see tokens.

For example, the sentence of “Transformers language models are neat!” actually is broken down into 9 tokens: `<s>` `Trans` `form` `ers` `language` `models` `are` `neat` and `!`.

Each language model has a distinct vocabulary of tokens, so the exact number of tokens will vary from model to model. For Meta’s Llama2 models, the vocabulary consists of 32,000 possible tokens. A token vocabulary is a map of text string to integer id value.

As a rule of thumb, tokens are typically around 4 characters long. But this isn’t always the case, sometimes a single character can count as an entire token.

Below you can visualize how the Llama2 tokenizer chunks words into tokens. You can also play with this yourself on the [llama-tokenizer-js playground](https://belladoreai.github.io/llama-tokenizer-js/example-demo/build/). You’ll also notice that this tool adds a `<s>` tokento the beginning of the list of tokens. This this is a special “beginning of sentence token” or `bos_token`, and it is how Llama2 understands that this is the beginning of a prompt. You don’t need to include this in your prompt, it will automatically be included by the model tokenizer, but you will occasionally see it mentioned when reading about Llama2

![llama-tokenizer-js playground](/_content/assets/llama2-tokenizer-example.CBSXZCfN_LFsQz.webp)

[](#context-window)Context window
---------------------------------

Language models typically have a limited set of context, meaning they can only handle so many tokens before they start forgetting text they have previously seen or generated. This limit of tokens is called the context window.

Different language models have different sized context windows. For example the Llama2 model has a context window of `4,096` tokens or about 12 pages of text. The leading-edge proprietary models like GPT-4-Turbo have a context window of `128,000` tokens, or about 300 pages of text.

It’s important to understand the context window of the model you’re using, and how it impacts your use case. For example if you’re using Llama2, you won’t be able to ingest an entire book and answer questions; you’ll need to use additional strategies like [retrieval augmented generation](https://replicate.com/blog/how-to-use-rag-with-chromadb-and-mistral-7b-instruct). While GPT-4-Turbo can read an entire book without skipping a beat.

[](#system-prompt)System prompt
-------------------------------

The system prompt is a secondary prompt that you can use with [instruction-tuned language models](/guides/language-models/use-cases#2-instruct-models) to to define the desired “behavior” or “personality” of the language model response.

For example, if you want the language model to only respond with haikus, you can set the system prompt to `Only respond with haikus.`

> It’s a beautiful day in the neighborhood, would you be my neighbor? system\_prompt: Only respond with haikus.

System prompts are great for defining the “character” of your language model response. For example, this is what happens when we set our system prompt to be `Yarr matey! respond as if ye are a pirate.`

> Describe the free energy principle system\_prompt: Yarr matey! respond as if ye are a pirate.

[](#temperature)Temperature
---------------------------

The `temperature` parameter is used to set the randomness of a language model response, by scaling its probability distribution over tokens.

When the `temperature` is set to `0.01`, the language model will always respond with the most likely token.

When the `temperature` is set to `1.0`, the language model’s probability distribution is used as-is, without any scaling. While the most likely token is still the most probable choice, there’s room for diversity, as the model doesn’t always select it.

As the `temperature` increases above `1.0`, the probability distribution is scaled to increase entropy, meaning that lower-probability tokens gain a higher chance of being selected. This leads to more surprising and varied outputs, as the model starts to explore less likely options. High temperatures, such as 5.0, can result in highly random and creative responses, but they may also reduce coherence and relevance.

In summary, a lower `temperature` (`<1.0`) steers the model towards more deterministic and predictable behavior. A `temperature` of `1.0` offers a balance, using the model’s learned probability distribution to guide token selection. Higher temperatures (`>1.0`) increase randomness and creativity in the outputs.

Experimenting with different `temperature` settings can help you find the optimal balance for your specific use case, depending on whether you prioritize predictability or creativity.

> Write me lyrics for a song about the free energy principle

```plaintext
temperature
- defaultValue: 0.7
- min: 0.1
- max: 5
- step: 0.1
```

[](#top_p)top\_p
----------------

The `top_p` parameter is used to control the diversity of a language model’s responses by adjusting its word selection process.

When `top_p` is set to a lower value, like 0.1, the language model restricts its choices to a very small set of the most likely tokens. This leads to more predictable and conservative outputs, as it only considers the top 10% of the most probable words in each step.

As `top_p` increases, the model includes a broader range of words in its selection pool, allowing for more varied and creative responses. A top\_p value of `0.9` or higher enables the model to consider a wider array of possibilities, picking from the top 90% of probable words. This setting is useful when you want the language model to generate more diverse and less constrained text.

So, as a general guideline: if you’re aiming for more consistent and focused outputs, use a lower `top_p` value. If you’re seeking creativity and a wider range of responses, opt for a higher `top_p`.

`top_p` is also influenced by both the `temperature` and `top_k` parameters. Try playing with all of the knobs in the example below.

> Explain Docker but pretend to be a RuneScape wizard

```plaintext
top_p
- defaultValue: 0.95
- min: 0.0
- max: 1.0
- step: 0.01
``````plaintext
top_k
- defaultValue: -1
- min: -1
- max: 50
- step: 1.0
``````plaintext
temperature
- defaultValue: 0.7
- min: 0.1
- max: 5
- step: 0.1
```

[](#top_k)top\_k
----------------

The `top_k` parameter is a method used to refine the selection process of a language model when it generates text. It limits the number of words or tokens the model considers at each step of the generation process.

When `top_k` is set to a specific value, say 10, the model only considers the top 10 most likely next words or tokens at each step. It essentially ignores all other words in its vocabulary, regardless of their probability. This restriction helps to focus the model’s choices and can lead to more predictable and relevant text.

If `top_k` is set to a very high number, the model’s behavior begins to resemble more unrestricted, probabilistic generation, as it’s allowed to consider a wide range of possible words. Conversely, a very low `top_k` value (like 1 or 2) makes the model’s output highly deterministic and less varied.

Therefore, `top_k` is a key parameter for balancing creativity and coherence in text generation. A lower `top_k` leads to safer, more predictable text, while a higher `top_k` allows for more diverse and potentially creative outputs. The ideal `top_k` value often depends on the specific task and desired output characteristics.

> Explain Docker but pretend to be a RuneScape wizard

```plaintext
top_p
- defaultValue: 0.95
- min: 0.0
- max: 1.0
- step: 0.01
``````plaintext
top_k
- defaultValue: -1
- min: -1
- max: 50
- step: 1.0
``````plaintext
temperature
- defaultValue: 0.7
- min: 0.1
- max: 5
- step: 0.1
```

[](#minimum-and-maximum-new-tokens)Minimum and maximum new tokens
-----------------------------------------------------------------

The `min_new_tokens` and `max_new_tokens` parameters are used to control the length of the generated output.

`min_new_tokens` sets the minimum number of new tokens that the model should generate. This is useful when you need to ensure that the output has a certain amount of substance or detail.

`max_new_tokens` defines the maximum number of tokens the model is allowed to generate. This parameter ensures that the output doesn’t exceed a certain length. It’s helpful in keeping generated content concise.

> Explain Docker but pretend to be a RuneScape wizard

```plaintext
max_new_tokens
- defaultValue: 128
- min: 1
- max: 1024
- step: 1.0
``````plaintext
min_new_tokens
- defaultValue: -1
- min: -1
- max: 1024
- step: 1.0
```

[](#stop-sequences)Stop sequences
---------------------------------

These are sequences of tokens that, when generated, will stop the model from generating any more text.

This is useful for controlling the length and relevance of the output. For example, if you set the stop sequence to a period ”.”, the model will stop generating text once it completes a sentence.

Without a stop sequence the model can continue generating text up to its maximum token limit, or until it reaches a conclusion. This can lead to long or off-topic responses.

[](#frequency-penalty-repetition_penalty)Frequency penalty (repetition\_penalty)
--------------------------------------------------------------------------------

This parameter controls the amount of repetition in the generated text. It changes the likelihood of repeatedly using the same words or phrases.

With a `repetition_penalty` of 0, there is no penalty, allowing the model to use words as frequently as it needs. This can sometimes lead to repetitive text, especially in longer outputs.

If you’re noticing too much repetition in the model’s output, increasing the `repetition_penalty` can help. A higher setting, generally ranging from 0.1 to 1, imposes a stronger penalty on the recurrence of words. This motivates the model to employ a broader range of vocabulary and to write sentences with greater variation.

Do not set the penalty too high. This can lead the model to avoid relevant terms that are necessary for coherent text.

[](#use-cases-for-open-source-language-models)Use cases for open source language models
=======================================================================================

The release of open source models has led to an explosion of different models, each with their own strengths and weaknesses. This page is a guide to the different use cases for language models, and how to choose the right model for your needs.

[](#when-to-use-a-closed-model)When to use a closed model
---------------------------------------------------------

Currently, the most powerful models have not been released as open source. These models are trained on massive amounts of data, and are often fine-tuned on a specific task. They are also often trained on data that is not publicly available, such as the entirety of the internet.

Models like [OpenAI’s GPT-4](https://openai.com/gpt-4), [Anthropic’s Claude](https://www.anthropic.com/index/claude-2) or [Google’s Bard](https://bard.google.com/chat) are powerful generalists. They have a lot of factual knowledge, reasoning skills and can perform a wide variety of tasks. They are often accessed via an API, and are not available for download. The only way to use these models is to pay for access.

For complicated tasks or specific domains, closed models may be the only option. But open source is catching up quickly, and for many tasks, open source models are already competitive.

[](#different-types-of-open-models)Different types of open models
-----------------------------------------------------------------

There are three main types of language models:

### [](#1-base-models)1\. Base models

Base models, also known as foundation models, are LLMs that have been trained on raw text. They function _autoregressively_: the model takes a prompt and predicts a token, then uses the prompt+token to predict the next token, and so on.

Base models are the most flexible type of LLM and can be prompted or fine-tuned for a wide variety of tasks. But they can be tricky to prompt, because they don’t take instructions. You have to think carefully about how to phrase your prompt so that the model will continue in the right direction.

### [](#2-instruct-models)2\. Instruct models

Instruction-tuned models are base models that have been fine-tuned on a dataset of instruction-answer pairs. This process teaches the model to follow instructions, and makes it easier to prompt. Instruction-tuned models are often fine-tuned on a specific task, such as summarization, translation or question answering.

### [](#3-rl-tuned-models)3\. RL-tuned models

Some models have been fine-tuned using reinforcement learning (RL). There are various methods for this, with acronyms like RLHF, RLAIF, DPO, PPO, etc. RL-tuning is often used to align very large models with human preferences, or to fine-tune models on a specific task.

RL tuning is a powerful technique, but it is not yet clear how much it improves performance. It is also difficult to reproduce, and requires a lot of compute. For these reasons, RL-tuned models are not yet widely used.

[](#how-to-choose-a-model-for-your-needs)How to choose a model for your needs
-----------------------------------------------------------------------------

Different models are good at different things. Here are some guidelines for choosing the right model for your needs.

Language models can accomplish a variety of tasks, including:

*   **Classification**: classify text into categories
*   **Conversion**: convert text from one format to another
*   **Completion**: complete a text prompt
*   **Chat**: have a conversation with a model
*   **RAG**: retrieve and generate text
*   **Code gen**: generate code
*   **Grammars**: generate text with a specific structure
*   **Tool use**: use a model to select and call other models or functions
*   **Agents**: let a model plan and execute actions
*   **Multimodal**: understand images, video, audio, etc.

These are not mutually exclusive. For example, a model can be used for both classification and completion. But some models are better suited to certain tasks than others.

In most cases, you want to use the smallest model that can do the job. Smaller models are cheaper, faster and more efficient. But smaller models are also less powerful and less capable of generalization, and may not be able to do what you need.

The tasks above are listed in order of complexity (roughly), from easiest to hardest. The more complex the task, the larger the model you will need. It’s worth trying several models to see which one works best for your needs.

[](#popular-open-source-language-models-and-their-use-cases)Popular open source language models and their use cases
===================================================================================================================

Once you know your use case, it’s time to choose a model. There are a large and ever-growing number of models available, many of which are small modifications fine-tuned from the same foundation. This page will help you navigate the landscape of models and choose the right one for your needs.

[](#proprietary-models-and-when-to-use-them)Proprietary models and when to use them
-----------------------------------------------------------------------------------

The most well-known models are the proprietary models from the big research labs. These models are highly capable generalists and can be used for a wide variety of tasks. They’re usually accessed through an API or a web interface. Models of this scale are mostly RL-tuned for safety, and base models are not exposed to the public.

*   [**GPT-4**](https://openai.com/gpt-4), by OpenAI, is the most powerful model currently available. It is better at coding than the other models in this category, and can use tool functions through the API. OpenAI hosts ChatGPT, a web interface that also integrates a code interpreter, web search, and image generator. GPT-4 is only available to paid subscribers.
*   [**GPT-3.5**](https://platform.openai.com/docs/models/gpt-3-5), the free version of ChatGPT, is faster and cheaper than GPT-4 but much less capable. Open source models have caught up to GPT-3.5 in many areas, and may soon surpass it.
*   [**Claude**](https://www.anthropic.com/index/claude-2), by Anthropic, is a powerful model which is especially good at writing prose. It is free in open beta through a web interface, but the API is still in limited release to a small number of users.
*   [**Bard**](https://bard.google.com/chat), by Google, is a web interface that uses PALM and Gemini models under the hood. It is not as strong as GPT-4 or Claude (yet), but it is free to use and can integrate with Google services.

[](#open-models)Open models
---------------------------

### [](#base-models)Base models

#### [](#llama)Llama

The [Llama family of models](https://replicate.com/blog/run-llama-2-with-an-api) by Meta are popular foundation models and are the basis for many of the fine-tunes available today. The current generation, Llama 2, come in three sizes: 7, 13, and 70 billion parameters, and have a context window of 4,000 tokens. They perform well in reasoning and coding tasks. Meta has also released a chat version of the model, though many users have found it to be overly safety-tuned.

They are released under a custom license that requires potential users with “greater than 700 million monthly active users in the preceding calendar month” to request special permission from Meta.

#### [](#mistral)Mistral

The [Mistral 7B model](https://replicate.com/mistralai/mistral-7b-instruct-v0.1) is a small but powerful model, outperforming other models of up to 13 billion parameters in standard English and code benchmarks. It has an 8K context window and is licensed under Apache 2.0. Mistral 7B is a great choice for local inference and other compute-limited tasks.

### [](#specialist-models)Specialist models

#### [](#flan-t5)Flan-T5

[Google’s Flan-T5](https://replicate.com/replicate/flan-t5-xl) is a versatile model trained on instruction data, available in five different sizes. It’s particularly effective in tasks requiring comprehension and response to instructions, like classification, translation, and summarization. Flan-T5 is a good choice for fine-tuning on specific tasks.

#### [](#phind-codellama)Phind CodeLlama

[Phind CodeLlama](https://huggingface.co/Phind/Phind-CodeLlama-34B-v2), a 34B parameter model, specializes in programming-related tasks, boasting a 73.8% pass rate on HumanEval. Its multilingual capabilities in programming languages make it an exceptional tool for code generation and understanding.

#### [](#mixtral)Mixtral

[Mixtral 8x7B](https://replicate.com/mistralai/mistral-7b-instruct-v0.1) is a Sparse Mixture of Experts model praised for its speed and adaptability to a wide range of tasks. It matches or outperforms Llama 2 70B and GPT 3.5 on a variety of tasks, while being six times faster. It has a 32K token window and is also Apache 2.0 licensed.

#### [](#llava)Llava

[LLaVA](https://replicate.com/yorickvp/llava-13b) is a multimodal model built on top of LLaMA and GPT-4 generated visual instruction tuning data. It combines vision and language capabilities, nearing GPT-4 level in some domains.

#### [](#nous-hermes)Nous Hermes

[Nous Hermes](https://huggingface.co/NousResearch/Nous-Hermes-13b), a 13B parameter model, is fine-tuned on over 300,000 synthetic instructions generated by GPT-4. It is known for its longer responses and low hallucination rates. Comparable to GPT-3.5-turbo, it’s suitable for complex language tasks and applications where balance between efficiency and performance is essential. The recently released Nous Hermes Mistral 7B brings this instruction tuning to the Mistral base model.

[](#how-to-prompt-open-source-large-language-models)How to prompt open source large language models
===================================================================================================

Prompt engineering is a new field and there is still a lot to be discovered. This guide will show you some techniques that people have used to prompt LLMs, and help you develop the right mindset. There’s no one right way to prompt a model, and you’ll need to experiment to find what works best for your use case.

Not all of these techniques will apply in every situation. Some work better on base models, or instruct models. Special tactics may be necessary to get certain behaviors out of your model. However, if you find yourself having to jump through hoops or use ‘jailbreaks’ to get your model to do what you want, it may be worth considering a different model.

To work through these examples, you can use a [language model on Replicate, like meta/llama-3.1-405b-instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct).

[](#the-basics)The basics
-------------------------

### [](#prompts)Prompts

A prompt is a string of text that you feed into a language model to get it to generate text. It can be as simple as a single word, or as complex as a book. Every aspect of the prompt will affect the output of the model: content, framing, style, verbosity, etc.

A good prompt can get a model to do what you want, while a bad prompt can get you gibberish. The goal of prompt engineering is to find the right prompt for your use case.

### [](#prompt-templates)Prompt templates

A prompt template is a prompt with one or more variables. For example, `The <animal> went to the <place>.` is a prompt template with two variables. You can fill in the variables with different values to get different prompts, e.g. `The cat went to the store.` or `The dog went to the park.`

Prompt templates are useful for generating many prompts at once, or for generating prompts on the fly. They can also be used to generate prompts that are more or less likely to produce certain outputs. Prompt templates can be chained into each other to produce structured prompts.

### [](#types-of-prompts)Types of prompts

There are many different types of prompts. Some are better for certain use cases than others. Here are some strategies you might use to prompt a model:

#### [](#zero-shot-prompts)Zero-shot prompts

Zero-shot prompts are prompts that are designed to produce a specific output on the first try. They are called zero-shot because they don’t require any examples, fine-tuning or training. They are usually short and simple.

A zero-shot prompt to an instruct model might look like this:

> Translate the following sentence into French: “I like to eat apples.”

In this case we’re relying on the model’s internal understanding of French and English to produce a good translation. We’re also relying on the model’s ability to understand the prompt and follow instructions.

If you were to do this with a base model, you would need to add more context to the prompt so that the French sentence is the mostly likely next token. Like so:

> The following is a correct translation from English to French. English: “I like to eat apples.” French:

If you were to just use the first prompt, the model might think that it is predicting a list of instructions and produce more commands instead of the translation. The second prompt makes it clear that we’re looking for a translation.

#### [](#few-shot-prompts)Few-shot prompts

Few-shot prompts use a small number of examples to get the model to do something. They are called few-shot because they require only a few examples, rather than a large dataset. They are usually longer and more complex than zero-shot prompts.

A few-shot prompt to an instruct model might look like this:

```plaintext
Translate the following sentence into French: "I like to eat oranges."
Answer: "J'aime manger des oranges."
Translate the following sentence into French: "I like to eat bananas."
Answer: "J'aime manger des bananes."
Translate the following sentence into French: "I like to eat apples."
Answer:
```

The pattern set up by the previous examples will guide the model toward the correct answer. This prompt might allow us to switch to a smaller model than we would need for a zero-shot prompt, since we’re not asking as much of the model.

If we were using a base model, this prompt might work as-is, because the pattern of examples sets the expectation that the next token should be a French sentence.

### [](#chain-of-thought)Chain of thought

“Chain of thought” refers to a category of prompts that lead the model to do long-form reasoning during token generation. This can be a powerful way to get more intelligent results from your model.

The simplest chain of thought prompts can be chained onto the end of any other instruction. They look like something you might see on math homework:

```plaintext
<question>
Let's think step by step.
``````plaintext
<question>
Show your work.
``````plaintext
<question>
Consider possible methods to solve this, and their tradeoffs, before working out your answer.
```

This might seem like a silly thing to do, but it can actually be quite effective. It forces the model to think about the problem in a structured way, and it can help it avoid getting stuck in local minima. It also makes it easier to debug the model’s reasoning process, since you can see the steps it took to get to the answer.

Remember, the contents of the context window define the model’s next prediction. At each step, the model’s reasoning is reinforced by the accuracy of the previous steps. It’s important to develop an intuition for this because any small misstep can be exaggerated by the autoregressive process. Garbage in, garbage out.

What you don’t want to do is ask the model to give an answer _before_ reasoning about it. Whatever the answer is, the model will find a way to rationalize it, because it can’t go back and change it. This can lead to some very funny situations, but rarely desirable answers.

### [](#chat-structure)Chat structure

Some models are trained to maintain a conversation for multiple turns. They might need special tokens to delineate which turn is spoken by the user and which by the model. See our [Guide to Prompting Llama 2](/blog/how-to-prompt-llama) for an in-depth exploration of this.

Chat structures can also be applied to base models, as a form of few-shot prompting. If you want to produce dialogue with a base model, you might use a prompt like the following:

> User: Hi there Assistant: Hello, user! User: I need some help with my homework. Assistant:

Note that a base model will continue to produce text, attempting to generate the next user response as well. You can include the word “User:” as a stopword with the `stop` parameter to prevent this.

### [](#system-prompts)System prompts

Many chat models have incorporated the concept of a single “system prompt” that applies to the whole conversation. You can use this parameter to set a “character” for the model to play, or communicate any other information that you want to keep consistent throughout the interaction.

A system prompt incorporating a character and some extra information might look like this:

> You are an impatient senior engineer with deep expertise in our company’s stack of NextJS and Typescript. The user is your favorite junior engineer. You always give them preferential treatment when helping with problems, because you want them to succeed.

[](#advanced-prompting-for-open-source-large-language-models)Advanced prompting for open source large language models
=====================================================================================================================

Crafting effective prompts is still more of an art than a science. We’ve covered some tried-and-true tactics. This chapter will cover more of the theory of how prompts work, and how to use that theory to craft effective prompts.

To work through these examples, you can use a [language model on Replicate, like meta/llama-3.1-405b-instruct](https://replicate.com/meta/meta-llama-3.1-405b-instruct).

[](#language-models-are-models-of-the-world)Language models are models of the world
-----------------------------------------------------------------------------------

We know that language models are trained to predict the next token in a sequence, based off the distribution of tokens in their training data. They learn to emulate the process that creates those text sequences.

That process, of course, is “humans writing words”. But we don’t write words in isolation. The way we write reflects the way we think, and the way we think reflects the world. Language models see the world as it is reflected through human writing: its colors and textures, people and places, causes and effects, are all part of the process that leads one token to come after another.

Language models act like _world simulators_. At each step, they take into account all the previous tokens in the context window, and connect all the implications and connotations of those words to “imagine” a world in which that text would be written. The dynamics of that world are implied by the contents of the prompt.

Try guessing the next token before running the following prompt:

> The bowling ball balanced precariously atop the ladder for a moment, but then

The model doesn’t expect the bowling ball to float away like a balloon, or to remain balanced forever while some new unrelated thing happens. The prompt sets up a possible world, and for each token the model plays “what next” in that world.

Ambiguous or unclear prompts can bring undesirable connotations into your model’s simulated world. For instance, the prompt `Write about a bank` could lead to text about a financial institution or a river bank, depending on the model’s training data and the rest of the context.

Note that this **simulator theory** was developed in regard to base models. Instruct- or RL-tuned models have been modified to simulate more specific worlds, often worlds where an “Assistant” character is interacting with a “User.” The theory still applies, but you’ll have to account for the dialogue-based world that the model expects.

[](#the-art-of-crafting-prompts)The art of crafting prompts
-----------------------------------------------------------

A seed, though small, contains all the information to grow into a tree. Similarly, your prompt contains all the information necessary for the model to simulate a world. That information can be transmitted through several channels.

### [](#explicit-information)Explicit information

The most obvious way to include information about a world is, well, to include it! Just declare the information directly in the prompt itself.

> The bowling ball sat atop the ladder.

### [](#implicit-information)Implicit information

Of course, that explicit information also comes with connotations. A bowling ball usually doesn’t sit atop a ladder, at least not for long. This is another channel you can use to tell your model about the world. We can increase the likelihood that the ball will fall without explicitly telling the model to do that, by modifying the verb we choose:

> The bowling ball balanced precariously atop the ladder.

### [](#shadow-information)Shadow information

A weird thing about language models is that the inclusion of any word brings implicit information, even if we negate the actual concept itself. This “shadow” information can cause unpredictable behavior, so it’s hard to use it well. Nonetheless it’s an important thing to consider, if only to avoid possible bad outcomes. It is often better to phrase your prompt in a positive explicit manner, rather than trying to negate an undesirable word or phrase.

Compare the following two prompts:

> The bowling ball balanced, NOT precariously, atop the ladder.

> The bowling ball balanced, securely, atop the ladder.

The former contains shadow information. It implies that maybe the ball _should_ be balanced precariously, that such is the natural state of things. People might get hurt and it is surprising that they don’t. In the latter prompt, the possible fall is less salient, as we know the ball to be securely balanced.

### [](#metatextual-information)Metatextual information

Another channel through which we can shape the simulation is through aspects of the text itself, rather than the world it describes. Voice, style, genre tropes, even formatting can have an effect on the model’s predictions.

Even the choice of one word can affect the entire world downstream:

> The door lensed open.

> The door creaked open.

The two sentences have the same effect “in-world”, but the connotations they bring change the scene entirely.

### [](#proxied-information)Proxied information

**Proxy prompting** is a special case of implied information, where you use a “proxy” character or situation to point to information that you want included in the resulting text. For example, you might want your model to reveal its knowledge of a specific domain. A simple instruction might not access the actual depths of knowledge in the model, because the “average” piece of text in the training data is not specialist knowledge.

> The following is a conversation between Adam and Beth. A: I wonder if an octopus can change its color. B:

> The following is a conversation between Adam and Beth. Beth is a marine biologist who did her doctorate on the noble octopus. A: I wonder if an octopus can change its color. B:

[](#sculpting-possibility)Sculpting possibility
-----------------------------------------------

As we have seen , every word in your prompt tells the model about the world you are trying to simulate. In this way prompting is an art like sculpting: you start with a block of pure possibility and chisel it down to a certain set of possible worlds with every token.

Every word you add to your prompt is a constraint on the possible worlds that the model can simulate. The more words you add, the more constrained the simulation becomes. This can be good for producing more coherent text, but it can also lead to less interesting or intelligent responses.

The trick is to find the right balance between coherence and creativity. You want to give the model enough information to produce coherent text, but not so much that it can’t surprise you.

--- END OF prompt-and-run-open-source-large-language-models.md ---


# FILE: turn-speech-to-text-with-whisperx.md

[WhisperX](https://replicate.com/daanelson/whisperx) transcribes audio to text. It’s an accelerated version of OpenAI’s [Whisper](https://replicate.com/openai/whisper) model.

With Replicate, you can run WhisperX in the cloud with one line of code.

[](#run-whisperx-in-our-playground)Run WhisperX in our Playground
-----------------------------------------------------------------

Want to try out WhisperX without writing code? Check out [our WhisperX model playground](https://replicate.com/daanelson/whisperx).

[](#run-whipserx-with-an-api)Run WhipserX with an API
-----------------------------------------------------

With Replicate, you can run WhisperX in the cloud with one line of code.

[](#run-whisperx-with-javascript)Run WhisperX with JavaScript
-------------------------------------------------------------

You can run WhisperX with our [official JavaScript client](https://github.com/replicate/replicate-javascript):

```bash
npm install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Import and set up the client:

```javascript
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
```

Run daanelson/whisperx using Replicate’s API:

```javascript
const output = await replicate.run(
  "daanelson/whisperx:latest",
  {
    input: {
		"audio": "https://replicate.delivery/pbxt/J5r78wKSymorzW9idAbbbJ7iXQl9GddZTwfdX5OlLJW2hLR2/OSR_uk_000_0050_8k.wav",
		"debug": False,
		"only_text": False,
		"batch_size": 32,
		"align_output": False
    }
  }
);
console.log(output);
```

Note that WhisperX takes an audio file as input. You can provide URLs and or base 64 strings here as values for the image.

To learn more, take a [look at the guide on getting started with Node.js](https://replicate.com/docs/get-started/nodejs).

[](#run-whisperx-with-python)Run WhisperX with Python
-----------------------------------------------------

You can run WhisperX with our [official Python client](https://github.com/replicate/replicate-python):

```bash
pip install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run daanelson/whisperx using Replicate’s API:

```python
import replicate
output = replicate.run(
    "daanelson/whisperx:latest",
    input={
		"audio": "https://replicate.delivery/pbxt/J5r78wKSymorzW9idAbbbJ7iXQl9GddZTwfdX5OlLJW2hLR2/OSR_uk_000_0050_8k.wav",
		"debug": False,
		"only_text": False,
		"batch_size": 32,
		"align_output": False
    }
)
print(output)
```

Note that WhisperX takes an audio file as input. You can provide URLs and or base 64 strings here as values for the image.

To learn more, take a look at the guide on [getting started with Python](https://replicate.com/docs/get-started/python).

[](#run-whisperx-with-curl)Run WhisperX with cURL
-------------------------------------------------

You can call the [HTTP API](https://replicate.com/docs/reference/http) directly with tools like cURL:

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run daanelson/whisperx using Replicate’s API:

```bash
curl -s -X POST \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d $'{
    "version": "9aa6ecadd30610b81119fc1b6807302fd18ca6cbb39b3216f430dcf23618cedd",
    "input": {
		"audio": "https://replicate.delivery/pbxt/J5r78wKSymorzW9idAbbbJ7iXQl9GddZTwfdX5OlLJW2hLR2/OSR_uk_000_0050_8k.wav",
		"debug": False,
		"only_text": False,
		"batch_size": 32,
		"align_output": False
    }
  }' \
  https://api.replicate.com/v1/models/daanelson/whisperx/predictions
```

Note that WhisperX takes an audio file as input. You can provide URLs and or base 64 strings here as values for the image.

To learn more, take a look at [Replicate’s HTTP API](https://replicate.com/docs/reference/http) reference docs.

You can also run WhisperX using [other Replicate client libraries for Golang, Swift, Elixir, and others](https://replicate.com/docs/reference/client-libraries)

[](#keep-up-to-speed)Keep up to speed
-------------------------------------

*   [Check out our WhisperX model page](https://replicate.com/daanelson/whisperx)
*   [Follow us on Twitter X to get the latest from Replicate](https://x.com/replicate)
*   [Hop in our Discord and talk WhisperX](https://discord.gg/replicate)

--- END OF turn-speech-to-text-with-whisperx.md ---


# FILE: upscale-images-with-ai-models.md

In this guide we’ll cover the many different ways you can upscale images with AI. We’ll cover the pros and cons of each approach, and how to choose the best one for your use case.

[](#what-is-image-upscaling)What is image upscaling?
----------------------------------------------------

Upscaling increases an image’s resolution. AI is used to enhance the image by adding detail and fixing artifacts.

Imagine you have a small, somewhat blurry photo, and you want to make it larger and clearer, like turning a wallet-sized photo into a poster without losing quality. Traditional methods might make the photo bigger, but it would become even blurrier. AI upscaling models work a lot like a smart artist who not only enlarges the photo but also cleverly adds in details to make the larger photo look sharp and clear.

There is also a big overlap between image upscaling and image restoration. AI models for image restoration fix blemishes, remove noise and add detail, which is well suited to the upscaling process.

astro-island,astro-slot,astro-static-slot{display:contents}(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();;(()=>{var A=Object.defineProperty;var g=(i,o,a)=>o in i?A(i,o,{enumerable:!0,configurable:!0,writable:!0,value:a}):i\[o\]=a;var d=(i,o,a)=>g(i,typeof o!="symbol"?o+"":o,a);{let i={0:t=>m(t),1:t=>a(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(a(t)),5:t=>new Set(a(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>1/0\*t},o=t=>{let\[l,e\]=t;return l in i?i\[l\](e):void 0},a=t=>t.map(o),m=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map((\[l,e\])=>\[l,o(e)\]));class y extends HTMLElement{constructor(){super(...arguments);d(this,"Component");d(this,"hydrator");d(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island\[ssr\]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let c=this.querySelectorAll("astro-slot"),n={},h=this.querySelectorAll("template\[data-astro-template\]");for(let r of h){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("data-astro-template")||"default"\]=r.innerHTML,r.remove())}for(let r of c){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(n\[r.getAttribute("name")||"default"\]=r.innerHTML)}let p;try{p=this.hasAttribute("props")?m(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(s+=\` (export ${v})\`),console.error(\`\[hydrate\] Error parsing props for component ${s}\`,this.getAttribute("props"),r),r}let u;await this.hydrator(this)(this.Component,p,n,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});d(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),c.disconnect(),this.childrenConnectedCallback()},c=new MutationObserver(()=>{var n;((n=this.lastChild)==null?void 0:n.nodeType)===Node.COMMENT\_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});c.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}async start(){let e=JSON.parse(this.getAttribute("opts")),c=this.getAttribute("client");if(Astro\[c\]===void 0){window.addEventListener(\`astro:${c}\`,()=>this.start(),{once:!0});return}try{await Astro\[c\](async()=>{let n=this.getAttribute("renderer-url"),\[h,{default:p}\]=await Promise.all(\[import(this.getAttribute("component-url")),n?import(n):()=>()=>{}\]),u=this.getAttribute("component-export")||"default";if(!u.includes("."))this.Component=h\[u\];else{this.Component=h;for(let f of u.split("."))this.Component=this.Component\[f\]}return this.hydrator=p,this.hydrate},e,this)}catch(n){console.error(\`\[astro-island\] Error hydrating ${this.getAttribute("component-url")}\`,n)}}attributeChangedCallback(){this.hydrate()}}d(y,"observedAttributes",\["props"\]),customElements.get("astro-island")||customElements.define("astro-island",y)}})();

[](#classic-upscalers)Classic upscalers
---------------------------------------

These are fast and cheap to run upscalers that work extremely well for low quality and badly compressed images. They can also fix faces, including distorted AI faces.

*   [Real-ESRGAN](/guides/upscaling-images/real-esrgan) – Fast 4x upscale
*   [GFPGAN and Codeformer](/guides/upscaling-images/gfpgan-and-codeformer) – Face fixing with upscale options
*   [SwinIR](/guides/upscaling-images/swinir) – Fast 4x upscale with good textures

[](#state-of-the-art-open-source-upscalers)State of the art open source upscalers
---------------------------------------------------------------------------------

Many recent upscalers use diffusion based image generation as a way of hallucinating details and giving higher quality results. These run slower and so are more expensive, but they can go very large and produce magnificent images.

*   [Upscaling with ControlNet tile](/guides/upscaling-images/controlnet-tile) – Diffusion based upscaling with tiling
*   [Ultimate SD Upscale](/guides/upscaling-images/sd-ultimate-upscale) – Power user ControlNet tile upscaling

[](#upscaling-images-with-real-esrgan)Upscaling images with Real-ESRGAN
=======================================================================

[Real-ESRGAN](https://replicate.com/nightmareai/real-esrgan) is an upscaler model that is cheap and fast. The Replicate model also incorporates GFPGAN for fixing faces. It improves the quality of images by using a form of AI called a Generative Adversarial Network (GAN).

It is very good at:

*   upscaling very small images
*   removing image artefacts, such as JPEG compression
*   sharpening edges
*   cleaning up text (if it’s not too small)

It does not:

*   add new details
*   fix scratches or other damage

[](#example-upscales)Example upscales
-------------------------------------

[In this example](https://replicate.com/p/ssntm5jbx64k4noaxx2knixfwi) a damaged Victorian photo is upscaled 8x in 5.5 seconds. All the compression artefacts are removed, and the face is improved using GFPGAN. Edges are sharper, the hair especially looks good. But the scratches and other damage are not fixed. There are no new details added.

In another example, we can see how well it deals with a low quality JPEG image of text:

[](#run-in-the-cloud-with-an-api)Run in the cloud with an API
-------------------------------------------------------------

Because of its speed and quality in handling low resolution internet images, it is an excellent choice for incorporating into web development pipelines.

With Replicate you can run Real-ESRGAN in the cloud with one line of code.

### [](#run-real-esrgan-with-javascript)Run Real-ESRGAN with JavaScript

Try our [official JavaScript client](https://github.com/replicate/replicate-javascript) to run Real-ESRGAN with Node.js:

```javascript
npm install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash

export REPLICATE_API_TOKEN=[your-api-token]

```

Run [nightmareai/real-esrgan](https://replicate.com/nightmareai/real-esrgan):

```javascript
import Replicate from "replicate";
// Import and set up the client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const output = await replicate.run(
  "nightmareai/real-esrgan:latest",
  {
    input: {
      image: "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
      scale: 2,
      face_enhance: false
    }
  }
);
console.log(output);
```

Note that Real-ESRGAN takes an image as input. You can provide URLs or base 64 strings here as values for the image.

To learn more, take a [look at the guide on getting started with Node.js](https://replicate.com/docs/get-started/nodejs).

### [](#run-real-esrgan-with-python)Run Real-ESRGAN with Python

You can also use our [official Python client](https://github.com/replicate/replicate-python). Read our [getting started with Python](https://replicate.com/docs/get-started/python) docs.

```bash
pip install replicate
export REPLICATE_API_TOKEN=<your-api-token>
```

Run [nightmareai/real-esrgan](https://replicate.com/nightmareai/real-esrgan):

```python
import replicate
output = replicate.run(
    "nightmareai/real-esrgan:latest",
    input={
        "image": "https://replicate.delivery/pbxt/Ing7Fa4YMk6YtcoG1YZnaK3UwbgDB5guRc5M2dEjV6ODNLMl/cat.jpg",
        "scale": 2,
        "face_enhance": False
    }
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

You can also run Real-ESRGAN using [other Replicate client libraries for Golang, Swift, Elixir, and others](https://replicate.com/docs/reference/client-libraries).

[](#fixing-faces-with-gfpgan-and-codeformer)Fixing faces with GFPGAN and Codeformer
===================================================================================

GFPGAN and Codeformer are two models that can fix faces in images.

They are both fast and can be run in the cloud with an API. They are particularly useful as models to run against images generated by other AI models, especially older ones.

[](#gfpgan)GFPGAN
-----------------

TencentArc’s [GFPGAN](https://replicate.com/tencentarc/gfpgan) has long been the go to model for fixing faces in images. Whether that’s correcting them while upscaling, or fixing the mistakes in faces generated by AI.

It is very good at:

*   upscaling low resolution faces, such as those in old photos
*   fixing early AI’s mistakes in faces, especially eyes
*   removing noise from an image

It does not:

*   work well with high resolution faces, it tends to remove details
*   remove all compression artefacts
*   fix scratches or other damage

Use it in modern workflows alongside other upscalers. Fix faces with GFPGAN, then upscale with another model.

### [](#example-face-fixes)Example face fixes

[In this example](https://replicate.com/tencentarc/gfpgan?prediction=7eqep7tb77wbtt55sgjxikxpji) a Midjourney image from 2022 is fixed using GFPGAN in 2.6s.

See how well the eyes are fixed, but also note how some skin blemishes are removed. The sharpening of the soft focus is also noticeable and undesirable.

In another example we can see how GFPGAN fixes the face in an old victorian photo. The face looks really good and much of the identity is preserved. However there are still JPEG artefacts and picture damage.

### [](#run-in-the-cloud-with-an-api-1)Run in the cloud with an API

We recommend using GFPGAN via the [Real-ESRGAN model on Replicate](https://replicate.com/nightmareai/real-esrgan). Turn on the `face_enhance` option to enable GFPGAN.

[Read about running Real-ESRGAN + GFPGAN with an API](/guides/upscaling-images/real-esrgan#run-in-the-cloud-with-an-api).

In this comparison, we compare GFPGAN and Real-ESRGAN:

[](#codeformer)Codeformer
-------------------------

[Codeformer](https://replicate.com/sczhou/codeformer) by sczhou is another choice for fixing badly generated AI faces.

Unlike GFPGAN, it will typically leave alone any part of the image that is not a face (you can optionally enhance the background with Real-ESRGAN).

It also takes a more heavy-handed approach to fixing faces. This means it can fix the very worst of AI faces, but when fixes need to be subtle it can degrade likeness.

It is very good at:

*   fixing really bad AI mistakes in faces
*   upscaling low resolution faces, such as those in old photos

It does not work well with:

*   high resolution faces
*   faces with lots of compression artefacts
*   subtle fixes where likeness needs preserving

In these cases it can get confused and [return distorted and broken results](https://replicate.com/p/umkqczdb23almb5cpwl7wia5ne).

### [](#example-face-fixes-1)Example face fixes

[In this example](https://replicate.com/p/hmygys3bahjiynjdwgqlojm4vy), using the same Midjourney image as before, Codeformer fixes the face in 3s.

Notice that the edges of the image are unchanged. The eyes are fixed and the face is improved, albeit they look a little different. Like GFPGAN the skin blemishes have also been removed.

In another example we can see how Codeformer fixes the face in an old victorian photo. The face looks really good and much of the identity is preserved. However there are still JPEG artefacts and picture damage.

[](#gfpgan-vs-codeformer)GFPGAN vs Codeformer
---------------------------------------------

GFPGAN and Codeformer are both good at fixing faces.

If you want to maintain likeness, use GFPGAN. If the face you need to fix is really bad, try Codeformer. But otherwise they are very similar.

And the Victorian example:

[](#upscaling-images-with-swinir)Upscaling images with SwinIR
=============================================================

[SwinIR](https://replicate.com/jingyunliang/swinir) is very good at upscaling small and low quality images. Like Real-ESRGAN, it is fast and cheap to run.

SwinIR is a great choice for incorporating fast upscaling into web development pipelines. For example, at Replicate we used SwinIR as part of our [SDXL fine-tuning API](https://replicate.com/stability-ai/sdxl/train) to make sure input images were big enough for the model to work with.

It is very good at:

*   upscaling very small images
*   maintaining likeness when upscaling faces
*   keeping textures in the upscaled image
*   removing image artefacts, such as JPEG compression
*   removing noise

It does not:

*   upscale eyes well
*   fix AI mistakes in faces
*   fix scratches or other damage

[](#example-upscales-1)Example upscales
---------------------------------------

[In this landscape example](https://replicate.com/p/xnboddbbsmatzzhuis26tconxa) a low quality image of mountains with plenty of JPEG compression artefacts is upscaled 4x to 1400px in 4.5 seconds. The output is much sharper and the compression artefacts are removed. The trees and grass have more detail.

[In this portrait example](https://replicate.com/p/moebbcrbvcomdvlhgaqwfjciri) a poorly compressed 350px portrait photo is upscaled 4x to 1400px in 4 seconds. All the compression artefacts are removed, and the face has a consistent likeness with the original. Edges are sharper and hair detail is especially good. The eyes need work.

[](#real-esrgan-vs-swinir)Real-ESRGAN vs SwinIR
-----------------------------------------------

If we compare SwinIR to Real-ESRGAN (without any face enhancements), we can see just how much better SwinIR is at upscaling. SwinIR has much better textures, particularly in the facial hair and skin detail.

SwinIR takes longer to run, 4s [vs Real-ESRGAN’s 1.4s](https://replicate.com/p/z52y5vrbmgeyqgub3ebaa3umbq). But it is still very fast.

[](#run-swinir-with-an-api)Run SwinIR with an API
-------------------------------------------------

If you want to incorporate SwinIR into your own web development pipeline, you can use our [API](https://replicate.com/jingyunliang/swinir) to run it in the cloud.

For a 4x upscale use the `Real-World Image Super-Resolution-Large` task. For a 2x upscale use `Real-World Image Super-Resolution-Medium`.

### [](#run-swinir-with-javascript)Run SwinIR with JavaScript

Try our [official JavaScript client](https://github.com/replicate/replicate-javascript) to run SwinIR with Node.js:

```bash
npm install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run [jingyunliang/swinir](https://replicate.com/jingyunliang/swinir):

```javascript
import Replicate from "replicate";
// Import and set up the client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
// Run the model
const output = await replicate.run(
  "jingyunliang/swinir:latest",
  {
    input: {
      image: "https://replicate.delivery/pbxt/KK3v1DvsmnfiKf8pm3IAPUpzR43QwrNw9FV0fNiuxSUyrpf0/low-quality-face.jpg",
      task_type: "Real-World Image Super-Resolution-Large"
    }
  }
);
// Save the output image
fs.writeFileSync("output.png", output[0]);

```

SwinIR takes an image as input. You can use URLs or base 64 strings.

To learn more, take a [look at the guide on getting started with Node.js](https://replicate.com/docs/get-started/nodejs).

### [](#run-swinir-with-python)Run SwinIR with Python

You can also use our [official Python client](https://github.com/replicate/replicate-python). Read our [getting started with Python](https://replicate.com/docs/get-started/python) docs.

```bash
pip install replicate
export REPLICATE_API_TOKEN=<your-api-token>
```

Run [jingyunliang/swinir](https://replicate.com/jingyunliang/swinir):

```python
import replicate
output = replicate.run(
    "jingyunliang/swinir:latest",
    input={
      "image": "https://replicate.delivery/pbxt/KK3v1DvsmnfiKf8pm3IAPUpzR43QwrNw9FV0fNiuxSUyrpf0/low-quality-face.jpg",
      "task_type": "Real-World Image Super-Resolution-Large"
    }
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())

```

You can also run SwinIR using [Golang, Swift, Elixir, and others](https://replicate.com/docs/reference/client-libraries).

[](#upscaling-images-with-controlnet-tile)Upscaling images with ControlNet tile
===============================================================================

ControlNet tile is a [ControlNet](/guides/stable-diffusion/controlnet) model ([control\_v11f1e\_sd15\_tile](https://huggingface.co/lllyasviel/control_v11f1e_sd15_tile)) introduced by Lvmin Zhang (lllyasviel) in May 2023.

You can run it on Replicate with the following models:

*   [batouresearch/high-resolution-controlnet-tile](https://replicate.com/batouresearch/high-resolution-controlnet-tile) (a simple model which gives good results)
*   [fewjative/ultimate-sd-upscale](https://replicate.com/fewjative/ultimate-sd-upscale) (a more flexible model that exposes each of the ControlNet tile parameters)
*   [juergengunz/ultimate-portrait-upscale](https://replicate.com/juergengunz/ultimate-portrait-upscale)

Use ControlNet tile to:

*   upscale 2x, 4x or 8x times
*   add, change, or re-generate image details
*   fix mistakes from upscaling by other models (like blurring or incoherent details)

It is very good at:

*   upscaling medium to large images
*   introducing coherent new details
*   controlling your upscale with a prompt
*   applying an artistic style or direction in the upscale process

However, it:

*   does not handle small images well. Anything below 512x512 should be upscaled with something like [Real-ESRGAN](/guides/upscaling-images/real-esrgan) or [SwinIR](/guides/upscaling-images/swinir) first. [Ultimate SD Upscale can do this for you](/guides/upscaling-images/sd-ultimate-upscale).
*   does not remove compression artifacts like JPEG artifacts. Again, use another model first.
*   often loses likenesses in faces. Careful selection of parameters is needed to balance between original image strength and hallucinated details.
*   can be tricky to use, and often requires some experimentation to get the best results

[](#how-controlnet-tile-works)How ControlNet tile works
-------------------------------------------------------

It upscales by hallucinating new details. You can use a text prompt (and negative prompt), to guide the generation of details towards your desired image.

As the name suggests, it is a tile-based approach. The original image is split into tiles, and each tile is upscaled separately before being recombined. Previous tiling approaches were limited by the way each tile interpreted a given prompt. Consider a ‘photo of a man outside’, split into 9, where the top left tile is just sky. Early techniques would try to diffuse an image of a man into that space, as well as every other tile, without a wider understanding of the whole image. ControlNet tile is different.

The clever part with ControlNet tile is that despite the tiles being upscaled separately, the prompt is always applied to the whole image.

ControlNet tile is best used with any Stable Diffusion 1.5 fine-tune. RealisticVision V5.1 and above are a good choice for photorealistic upscaling. There isn’t currently a ControlNet tile model for SDXL.

[](#example-upscales-2)Example upscales
---------------------------------------

[In this example of a woman in a bright outfit](https://replicate.com/p/m2hek1r0phrme0cn0sbt2nns1w), the image is upscaled from 1024x1024 (a standard SDXL sized output) to 2560x2560 (2.5x) in 38 seconds.

You can clearly see the issues ControlNet tile can have with maintaining a likeness here. Not only has this woman’s likeness changed, but so has her ethnicity. You’ll also see that her face is no longer distorted, and that the pose and colors have remained consistent. Small details like the buttons and the shirt pattern are also fixed. Meanwhile new details have been introduced - the woman is now wearing a necklace, she is wearing less makeup and the shiny material of the outfit is more pared back.

[In another example](https://replicate.com/p/b6cyhgbby63wrboy5xe4t3ufii), we upscale a photo of a cat using the `fewjative/ultimate-sd-upscale` model. The original image is 1024x1024, and we upscale it 2x to 2048x2048 in 49 seconds. We use a prompt to describe the image, and a negative prompt to list things we don’t want.

See how the detail in the cat’s fur is improved, and AI generation errors like the zip and eyes are fixed.

[](#run-in-the-cloud-with-an-api-2)Run in the cloud with an API
---------------------------------------------------------------

Using a ControlNet tile upscaler in the cloud is a great way to improve the quality of images in your website or app. Whether they are from a generative AI model or a real-world source.

### [](#run-a-controlnet-tile-upscaler-with-javascript)Run a ControlNet tile upscaler with JavaScript

We’ll use the `batouresearch/high-resolution-controlnet-tile` for this example, but the API is similar whichever model you choose.

Start with our [official JavaScript client](https://github.com/replicate/replicate-javascript) to run the model with Node.js:

```bash
npm install replicate
export REPLICATE_API_TOKEN=<your-api-token>
```

Run [batouresearch/high-resolution-controlnet-tile](https://replicate.com/batouresearch/high-resolution-controlnet-tile) with the following code:

```javascript
import Replicate from "replicate";
import fs from "fs/promises";
// Import and set up the client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
// Run the model
const output = await replicate.run(
  "batouresearch/high-resolution-controlnet-tile:latest",
  {
    input: {
      hdr: 0.2,
      image: "https://replicate.delivery/pbxt/K5vab12temDjc8jOnWFJ3p4RD7YWPQ3nuCyXpaRmN9yB8M1h/f84e7869-32ca-444b-a720-19e4325f4347.jpeg",
      steps: 20,
      prompt: "a woman wearing a colorful suit",
      scheduler: "DDIM",
      creativity: 0.6,
      guess_mode: false,
      resolution: 2560,
      resemblance: 0.4,
      guidance_scale: 5
    }
  }
);
// Save the output image
fs.writeFileSync("output.png", output[0]);
```

You can also run this model using other Replicate client libraries such as for [Python, Golang, Swift, Elixir, and others](https://replicate.com/docs/reference/client-libraries).

[](#upscaling-images-with-ultimate-sd-upscale)Upscaling images with Ultimate SD Upscale
=======================================================================================

Ultimate SD Upscale is an [Automatic1111 extension](https://github.com/Coyote-A/ultimate-upscale-for-automatic1111) by Coyote-A. It is a very powerful wrapper around ControlNet tile, giving fine control over all of the parameters, including:

*   [denoising strength](/guides/stable-diffusion/image-to-image#prompt-strength-or-denoising-strength) (ie how much of the original image remains in the final result)
*   target image size
*   opting into a first-pass upscaler before using ControlNet tile (for example [Real-ESRGAN](/guides/upscaling-images/real-esrgan))
*   the order that tiles are processed in, linear or chessboard. Chessboard can reduce unwanted seams from showing
*   the size of the tiles
*   the amount of padding around each tile
*   the amount of blur applied to the tile masks (to hide seams where tiles are restitched together)
*   options for fixing seams after the ControlNet tile upscaling is complete

[](#using-with-comfyui)Using with ComfyUI
-----------------------------------------

It has also been [ported to ComfyUI as a custom node](https://github.com/ssitu/ComfyUI_UltimateSDUpscale) by ssitu. We recommend this in [our ComfyUI guide](/guides/comfyui/custom-nodes#upscale-images) as a must-have custom node in your workflow.

![An ultimate SD upscale workflow](/_content/assets/ultimate-upscale.8SC4VHm4_ZuRe1Y.webp)

[](#run-ultimate-sd-upscale-with-an-api)Run Ultimate SD Upscale with an API
---------------------------------------------------------------------------

User ‘fewjative’ has wrapped the ComfyUI custom node into a Replicate model that you can run with a production-ready API. [Try out `fewjative/ultimate-sd-upscale`](https://replicate.com/fewjative/ultimate-sd-upscale), or run it with an API using our guide below.

Alternatively, if you want to run your own customised ComfyUI workflow, one that incorporates Ultimate SD Upscale, you can use the `fofr/any-comfyui-workflow` model. [Read our ComfyUI with an API guide](/guides/comfyui/run-comfyui-with-an-api) to learn how.

### [](#running-ultimate-sd-upscale-with-python)Running Ultimate SD Upscale with Python

We’ll use `fewjative/ultimate-sd-upscale` for this example.

Start with our [official Python client](https://github.com/replicate/replicate-python) and read our [getting started with Python](https://replicate.com/docs/get-started/python) docs.

```bash
pip install replicate
export REPLICATE_API_TOKEN=<your-api-token>
```

Run [fewjative/ultimate-sd-upscale](https://replicate.com/fewjative/ultimate-sd-upscale):

```python
import replicate
output = replicate.run(
    "fewjative/ultimate-sd-upscale:latest",
    input={
        "image": "https://replicate.delivery/pbxt/KKOaCNy9baG5cUZfK3YvvePBqZeTxyvytifSo7pFOKLySQN2/ComfyUI_00004_.png",
        "steps": 20,
        "denoise": 0.4,
        "scheduler": "karras",
        "upscale_by": 2,
        "negative_prompt": "ugly, broken, weird",
        "positive_prompt": "a portrait photo of a cat in a green hoodie",
    }
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

A more complete example, that incorporates all of the Ultimate SD Upscale parameters might look like this:

```python
output = replicate.run(
    "fewjative/ultimate-sd-upscale:latest",
    input={
        "cfg": 8,
        "image": "https://replicate.delivery/pbxt/KKOaCNy9baG5cUZfK3YvvePBqZeTxyvytifSo7pFOKLySQN2/ComfyUI_00004_.png",
        "positive_prompt": "a portrait photo of a cat in a green hoodie",
        "negative_prompt": "ugly, broken, weird",
        "steps": 20,
        "denoise": 0.4,
        "sampler_name": "euler",
        "scheduler": "karras",
        "upscale_by": 2,
        "upscaler": "4x-UltraSharp",
        "controlnet_strength": 1,
        "use_controlnet_tile": True
        "mask_blur": 8,
        "mode_type": "Linear",
        "tile_width": 512,
        "tile_height": 512,
        "tile_padding": 32,
        "force_uniform_tiles": True,
        "seam_fix_mode": "None",
        "seam_fix_width": 64,
        "seam_fix_denoise": 1,
        "seam_fix_padding": 16,
        "seam_fix_mask_blur": 8,
    }
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

--- END OF upscale-images-with-ai-models.md ---


# FILE: comfyui.md

ComfyUI is a simple yet powerful Stable Diffusion UI with a graph and nodes interface. You can use it to connect up models, prompts, and other nodes to create your own unique workflow.

It has quickly grown to encompass more than just Stable Diffusion. It supports SD, SD2.1, [SDXL](https://replicate.com/stability-ai/sdxl), [controlnet](https://replicate.com/guides/stable-diffusion/controlnet), but also models like [Stable Video Diffusion](https://stability.ai/stable-video), [AnimateDiff](https://replicate.com/blog/animatediff-interpolator), [PhotoMaker](https://replicate.com/tencentarc/photomaker) and more.

In this guide we’ll walk you through how to:

*   install and use ComfyUI for the first time
*   install ComfyUI manager
*   run the default examples
*   install and use popular custom nodes
*   run your ComfyUI workflow on Replicate
*   run your ComfyUI workflow with an API

![A screenshot of a ComfyUI workflow](/_content/assets/workflow.ye9Ozh1v_dounw.webp)

[](#install-comfyui)Install ComfyUI
-----------------------------------

ComfyUI can run locally on your computer, as well as on GPUs in the cloud.

If you’re on Windows, there’s a portable version that works on Nvidia GPUs and CPU. You can download it from the [ComfyUI releases page](https://github.com/comfyanonymous/ComfyUI/releases).

Alternatively you can manually install it. Start by cloning the ComfyUI repository and installing the python dependencies.

You can run this in your terminal:

```bash
git clone https://github.com/comfyanonymous/ComfyUI
# Optional: You might want to use a virtual environment
cd ComfyUI
python -m venv venv
source venv/bin/activate
# Install ComfyUI dependencies
pip install -r requirements.txt
```

Start ComfyUI:

```bash
python main.py
```

There are more detailed instructions in the [ComfyUI README](https://github.com/comfyanonymous/ComfyUI?tab=readme-ov-file#installing).

[](#comfyui-vs-automatic1111-a1111)ComfyUI vs Automatic1111 (A1111)
-------------------------------------------------------------------

![Screenshots comparing Automatic1111 vs. ComfyUI](/_content/assets/a1111-vs-comfyui.ByPXz6_y_2lClsl.webp)

ComfyUI and [Automatic1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui) (sometimes also called A1111 or stable-diffusion-webui) are the two most popular Stable Diffusion UIs, and they both have their strengths and weaknesses.

If you just want to make images and see results quickly then Automatic1111 is the best choice. It’s a [Gradio](https://www.gradio.app/) based interface with many options and plugins. But you can load up a checkpoint, set a prompt and get going. [Fooocus](https://github.com/lllyasviel/Fooocus) is also another good choice for this.

ComfyUI is more powerful and flexible, but it has a steeper learning curve. If you want to explore ControlNet, AnimateDiff, IPAdapters, noise scheduling, prompt walking, and novel workflows using newly released models and tools, then ComfyUI is worth learning.

Use ComfyUI if you like to experiment.

[](#use-comfyui-manager)Use ComfyUI manager
-------------------------------------------

Before we start with examples, you should install the ComfyUI manager by `ltdrdata`. It’s a custom node that makes it easy to manage all your ComfyUI custom nodes and weights.

### [](#install-the-comfyui-manager)Install the ComfyUI manager

The simplest way to install [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager) is to clone the repository into your custom nodes directory: `ComfyUI/custom_nodes`.

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
```

You should now have a directory called `ComfyUI/custom_nodes/ComfyUI-Manager`.

If you’re installing on Linux there are a few extra steps. See the [ComfyUI-Manager README](https://github.com/ltdrdata/ComfyUI-Manager?tab=readme-ov-file#installationmethod3-installation-for-linuxvenv-comfyui--comfyui-manager) for more details.

### [](#start-installing-models-and-nodes)Start installing models and nodes

Once you’ve installed ComfyUI manager, it’s now very easy to install models and nodes. From the manager menu you can:

*   install custom nodes
*   install missing custom nodes (very useful when using someone else’s workflow)
*   install models (checkpoints, loras, etc.)

You can also use the manager to:

*   update all custom nodes
*   update ComfyUI

Your browser does not support the video tag.

[](#start-by-running-the-comfyui-examples)Start by running the ComfyUI examples
-------------------------------------------------------------------------------

The easiest way to get to grips with how ComfyUI works is to [start from the shared examples](https://comfyanonymous.github.io/ComfyUI_examples/).

### [](#start-with-the-default-workflow)Start with the default workflow

The default workflow is a simple text-to-image flow using Stable Diffusion 1.5. It’s one that shows how to use the basic features of ComfyUI. If it’s not already loaded, you can load it by clicking the “Load default” button. You can always reset back to this.

You’ll need one checkpoint for this to work, the default uses `v1-5-pruned-emaonly.ckpt`. But any Stable Diffusion checkpoint will work – SD1.5, SDXL, SD2.1 or any fine-tune. Remember you can download these models via “Install models” in ComfyUI manager.

To run the workflow, click the “Queue prompt” button. Outputs are saved in the `ComfyUI/outputs` folder by default.

Your browser does not support the video tag.

### [](#try-changing-this-example)Try changing this example

Given this default example, try exploring by:

*   changing your prompt ([CLIP Text Encode node](https://blenderneko.github.io/ComfyUI-docs/Core%20Nodes/Conditioning/CLIPTextEncode/))
*   editing the negative prompt (this is the CLIP Text Encode node that connects to the negative input of the [KSampler node](https://blenderneko.github.io/ComfyUI-docs/Core%20Nodes/Sampling/KSampler/))
*   loading a different checkpoint
*   using different image dimensions ([Empty Latent Image node](https://blenderneko.github.io/ComfyUI-docs/Core%20Nodes/Latent/EmptyLatentImage))
*   changing steps and sampler settings ([KSampler node](https://blenderneko.github.io/ComfyUI-docs/Core%20Nodes/Sampling/KSampler/))

### [](#load-another-workflow)Load another workflow

You can load workflows into ComfyUI by:

*   dragging a PNG image of the workflow onto the ComfyUI window (if the PNG has been encoded with the necessary JSON)
*   copying the JSON workflow and simply pasting it into the ComfyUI window
*   clicking the “Load” button and selecting a JSON or PNG file

Try dragging this img2img example onto your ComfyUI window:

![Example workflow](/_content/assets/workflow.ye9Ozh1v_dounw.webp)

It works like this:

Your browser does not support the video tag.

[](#popular-comfyui-custom-nodes)Popular ComfyUI custom nodes
-------------------------------------------------------------

Now you’re up and running with ComfyUI, you’ll want to start powering-up using some of the best custom nodes that are available.

You should already have the [ComfyUI-manager](comfyui-manager), which you can use to install these. Alternatively, any custom node can be git cloned into your `ComfyUI/custom_nodes` directory. Make sure you also install any dependencies that are needed.

### [](#upscale-images)Upscale images

[ComfyUI\_UltimateSDUpscale](https://github.com/ssitu/ComfyUI_UltimateSDUpscale) is a wrapper around the A1111 equivalent. It’s the goto node for upscaling. Use the controlnet tile upscaling options to get detailed outputs at massive resolutions.

Try [running UltimateSDUpscale on Replicate](https://replicate.com/fewjative/ultimate-sd-upscale) to see what’s possible.

![An ultimate SD upscale workflow](/_content/assets/ultimate-upscale.8SC4VHm4_ZuRe1Y.webp)

### [](#utilities)Utilities

#### [](#comfyui-custom-scripts-)ComfyUI Custom Scripts

[ComfyUI Custom Scripts](https://github.com/pythongosssss/ComfyUI-Custom-Scripts) is a set of UI enhancements for ComfyUI, typically enriching the information shown.

You can use it to:

*   add autocomplete to your text prompts, very useful for selecting your embeddings from a list
*   view extra checkpoint, LoRA and embedding information
*   auto arrange your nodes
*   snap nodes to a grid
*   show an image feed
*   lock nodes
*   use mathematical expressions (for example when generating latents)
*   save your workflows as PNG images

#### [](#efficiency-nodes)Efficiency nodes

[comfyui-efficiency-nodes](https://github.com/jags111/efficiency-nodes-comfyui) are a collection of nodes that aim to combine many nodes into one. Use them to streamline workflows and reduce total node count.

### [](#animatediff--and-video-helpers-)AnimateDiff and video helpers

If you’re looking to make videos using [AnimateDiff](https://replicate.com/lucataco/animate-diff), then [Kosinkadink’s ComfyUI-AnimateDiff-Evolved](https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved) is a must.

Use it to:

*   create videos from your checkpoints
*   use motion loras to control camera direction
*   control your outputs using controlnets

It should be used with [ComfyUI-VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite), which can:

*   load videos
*   combine videos
*   preview videos
*   make videos from images

[](#run-your-comfyui-workflow-on-replicate)Run your ComfyUI workflow on Replicate
---------------------------------------------------------------------------------

You can run ComfyUI workflows directly on Replicate using the [fofr/any-comfyui-workflow](https://replicate.com/fofr/any-comfyui-workflow) model.

It works by using a ComfyUI JSON blob. You send us your workflow as a JSON blob and we’ll generate your outputs. You can also upload inputs or use URLs in your JSON.

Your browser does not support the video tag.

### [](#how-to-use-the-replicate-model)How to use the Replicate model

#### [](#get-your-api-json)Get your API JSON

You’ll need the API version of your ComfyUI workflow. This is different to the commonly shared JSON version, it does not included visual information about nodes, etc.

To get your API JSON:

1.  Turn on the “Enable Dev mode Options” from the ComfyUI settings (via the settings icon)
2.  Load your workflow into ComfyUI
3.  Export your API JSON using the “Save (API format)” button

Your browser does not support the video tag.

#### [](#gather-your-input-files)Gather your input files

If your model takes inputs, like images for img2img or controlnet, you have 3 options:

1.  Use a URL
2.  Upload a single input
3.  Upload a zip file or tar file of your inputs

##### [](#using-urls-as-inputs)Using URLs as inputs

If you’re using URLs, you should modify your API JSON file to point at a URL:

```diff
- "image": "/your-path-to/image.jpg",
+ "image": "https://example.com/image.jpg",
```

##### [](#uploading-a-single-input)Uploading a single input

You can also give a single input file when running the model. If this is an image or video, we’ll put it directly into the input directory, as `input.[extension]` – for example `input.jpg`.

You can then reference this in your workflow using the filename:

```diff
- "image": "/your-path-to/my-picture-001.jpg",
+ "image": "image.jpg",
```

##### [](#uploading-a-zip-file-or-tar-file-of-your-inputs)Uploading a zip file or tar file of your inputs

If your model is more complex and requires multiple inputs, you can upload a zip file or tar file of all of them.

These will be downloaded and extracted to the `input` directory. You can then reference them in your workflow based on their relative paths.

So a zip file containing:

```plaintext
- my_img.png
- references/my_reference_01.jpg
- references/my_reference_02.jpg
```

Might be used in the workflow like:

```plaintext
"image": "my_img.png",
...
"directory": "references",
```

We’ll always validate that your inputs exist before running your workflow.

### [](#run-your-workflow)Run your workflow

With all your inputs ready, you can now run your workflow.

There’s a couple of extra options you can use:

*   `return_temp_files` – Some workflows save temporary files, for example pre-processed controlnet images. Use this option to also return these files.
*   `randomise_seeds` – Usually you want to randomise your seeds, so we’ve made this easy for you. Set this option to `true` to randomise all your seeds.

### [](#an-example-output)An example output

Input

workflow\_json { ... "seed": 156680208700286, "steps": 20, "cfg": 8, "sampler\_name": "euler", "scheduler": "normal", "denoise": 1, "positive": \["beautiful scenery nature glass bottle landscape, purple galaxy bottle", 0\], "negative": \["text, watermark", 0\], "latent\_image": \[512, 512, 1, 0\] ... }

Output

![](https://replicate.delivery/pbxt/GvpKN1SsGJaLBdhZpWyOasslCMq1UeetKDf5l0wshxex5J4IB/ComfyUI_00001_.png)

### [](#supported-weights)Supported weights

We support the most popular model weights, including:

*   SDXL
*   RealVisXL 3.0
*   Realistic Vision 5.1 and 6.0
*   DreamShaper 6
*   TurboVisionXL
*   Stable Video Diffusion
*   AnimateDiff
*   LCM Dreamshaper
*   LCM LoRAs

Also included are all the popular controlnets and preprocessors. We recommend using the [`comfyui_controlnet_aux`](https://github.com/Fannovel16/comfyui_controlnet_aux/) custom node for preprocessors. And [`ComfyUI Advanced ControlNet`](https://github.com/Kosinkadink/ComfyUI-Advanced-ControlNet/) is included if you really know what you’re doing.

[View the complete list of supported weights](https://github.com/fofr/cog-comfyui/blob/main/supported_weights.md) or [request a weight by raising an issue](https://github.com/fofr/cog-comfyui/issues).

If your exact model isn’t supported, you can also try switching to the closest match. Just update your JSON to use a different model filename.

### [](#custom-nodes)Custom nodes

Again, we’ve tried to include the most popular custom nodes.

Some of the custom nodes included are:

*   [ComfyUI IPAdapter Plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus/tree/4e898fe)
*   [ComfyUI Controlnet Aux](https://github.com/Fannovel16/comfyui_controlnet_aux/tree/6d6f63c)
*   [ComfyUI Inspire Pack](https://github.com/ltdrdata/ComfyUI-Inspire-Pack/tree/c8231dd)
*   [ComfyUI Logic](https://github.com/theUpsider/ComfyUI-Logic/tree/fb88973)
*   [ComfyUI AnimateDiff Evolved](https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved/tree/d2bf367)
*   [ComfyUI VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite/tree/1dbf01b)
*   [ComfyUI Advanced ControlNet](https://github.com/Kosinkadink/ComfyUI-Advanced-ControlNet/tree/bd5bcbf)
*   [Efficiency Nodes ComfyUI](https://github.com/jags111/efficiency-nodes-comfyui/tree/1ac5f18)
*   [Derfuu ComfyUI ModdedNodes](https://github.com/Derfuu/Derfuu_ComfyUI_ModdedNodes/tree/2ace4c4)
*   [ComfyUI FizzNodes](https://github.com/FizzleDorf/ComfyUI_FizzNodes/tree/cd6cadd)

[View the complete list of supported custom nodes](https://github.com/fofr/cog-comfyui). You can also [raise an issue](https://github.com/fofr/cog-comfyui/issues) to request more custom nodes, or use the Github repo as a template to roll your own.

[](#run-comfyui-with-an-api)Run ComfyUI with an API
---------------------------------------------------

You can [run ComfyUI workflows on Replicate](run-comfyui-on-replicate), which means you can run them with an API too. Take your custom ComfyUI workflow to production.

You can use our official [Python](https://github.com/replicate/replicate-python#readme), [Node.js](https://github.com/replicate/replicate-javascript), [Swift](https://github.com/replicate/replicate-swift), [Elixir](https://github.com/replicate/replicate-elixir) and [Go](https://github.com/replicate/replicate-go) clients.

We recommend you follow these steps:

1.  Get your workflow running on Replicate with the [`fofr/any-comfyui-workflow`](https://replicate.com/fofr/any-comfyui-workflow) model ([read our instructions and see what’s supported](run-comfyui-on-replicate))
2.  Use the Replicate API to run the workflow
3.  Write code to customise the JSON you pass to the model (for example, to change prompts)
4.  Integrate the API into your app or website

### [](#get-your-api-token)Get your API token

You’ll need to [sign up for Replicate](https://replicate.com/signin), then you can find your API token on [your account page](https://replicate.com/account/api-tokens?new-token-name=comfyui).

### [](#run-your-workflow-with-python)Run your workflow with Python

In this example we’ll run the default ComfyUI workflow, a simple text to image flow.

Install Replicate’s Python client library:

```bash
pip install replicate
```

Set the REPLICATE\_API\_TOKEN environment variable:

```bash
export REPLICATE_API_TOKEN=r8-*********************************
```

Import the client and run the workflow:

```python
import json
import replicate
output = replicate.run(
    "fofr/any-comfyui-workflow:latest",
    input={
        "workflow_json": json.dumps({
            "3": {
                "inputs": {
                    "seed": 156680208700286,
                    "steps": 20,
                    "cfg": 8,
                    "sampler_name": "euler",
                    "scheduler": "normal",
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                },
                "class_type": "KSampler",
                "_meta": {"title": "KSampler"}
            },
            "4": {
                "inputs": {
                    "ckpt_name": "Realistic_Vision_V6.0_NV_B1_fp16.safetensors"
                },
                "class_type": "CheckpointLoaderSimple",
                "_meta": {"title": "Load Checkpoint"}
            },
            "5": {
                "inputs": {
                    "width": 512,
                    "height": 512,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage",
                "_meta": {"title": "Empty Latent Image"}
            },
            "6": {
                "inputs": {
                    "text": "beautiful scenery nature glass bottle landscape, purple galaxy bottle,",
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Prompt)"}
            },
            "7": {
                "inputs": {
                    "text": "text, watermark",
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Prompt)"}
            },
            "8": {
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2]
                },
                "class_type": "VAEDecode",
                "_meta": {"title": "VAE Decode"}
            },
            "9": {
                "inputs": {
                    "filename_prefix": "ComfyUI",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage",
                "_meta": {"title": "Save Image"}
            }
        }),
        "randomise_seeds": True,
        "return_temp_files": False
    }
)
# Save all generated images
for i, file_output in enumerate(output):
    with open(f'output_{i}.png', 'wb') as f:
        f.write(file_output.read())
```

#### [](#customise-your-workflow)Customise your workflow

You’ll want to customise your workflow, to send in different prompts and other options. You can do this by changing the JSON you pass to the model.

For example, you could change the checkpoint and prompt like this:

```python
import json
import replicate
def load_workflow_from_file(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)
def update_checkpoint_name(workflow, new_name):
    workflow["4"]["inputs"]["ckpt_name"] = new_name
def update_prompt(workflow, new_prompt):
    workflow["6"]["inputs"]["text"] = new_prompt
workflow = load_workflow_from_file('workflow.json')
update_checkpoint_name(workflow, "sd_xl_base_1.0.safetensors")
update_prompt(workflow, "a photo of a comfy sofa")
output = replicate.run(
    "fofr/any-comfyui-workflow:latest",
    input={
        "workflow_json": json.dumps(workflow),
        "randomise_seeds": True,
        "return_temp_files": False
    }
)
print(output)
```

### [](#run-your-workflow-with-javascript)Run your workflow with JavaScript

```js
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const workflowJson = {
  "3": {
    "inputs": {
      "seed": 156680208700286,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "Realistic_Vision_V6.0_NV_B1_fp16.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 512,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "Empty Latent Image"
    }
  },
  "6": {
    "inputs": {
      "text": "beautiful scenery nature glass bottle landscape, purple galaxy bottle,",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "7": {
    "inputs": {
      "text": "text, watermark",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "8": {
    "inputs": {
      "samples": ["3", 0],
      "vae": ["4", 2]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": ["8", 0]
    },
    "class_type": "SaveImage",
    "_meta": {
      "title": "Save Image"
    }
  }
};
const output = await replicate.run(
  "fofr/any-comfyui-workflow:latest",
  {
    input: {
      workflow_json: JSON.stringify(workflowJson),
      randomise_seeds: true,
      return_temp_files: false
    }
  }
);
console.log(output);
```

--- END OF comfyui.md ---


# FILE: llava.md

![llava](/_content/assets/llava.R_4oVZJi_mn8Jl.webp)

[Llava 13B](https://replicate.com/yorickvp/llava-13b) is a multimodal vision model that can understand images. Llava can take image as inputs and answer questions about them.

With Replicate, you can run Llava in the cloud with one line of code.

[](#run-llava-in-our-playground)Run Llava in our Playground
-----------------------------------------------------------

Want to try out Llava without writing code? Check out [our Llava model playground](https://replicate.com/yorickvp/llava-13b).

[](#run-llava-with-javascript)Run Llava with JavaScript
-------------------------------------------------------

You can run Llava with our [official JavaScript client](https://github.com/replicate/replicate-javascript):

```bash
npm install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Import and set up the client:

```javascript
import Replicate from "replicate";
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
```

Run yorickvp/llava-13b using Replicate’s API:

```javascript
const output = await replicate.run(
  "yorickvp/llava-13b:latest",
  {
    input: {
		"image": "https://replicate.delivery/pbxt/JfvBi04QfleIeJ3ASiBEMbJvhTQKWKLjKaajEbuhO1Y0wPHd/view.jpg",
		"top_p": 1,
		"prompt": "Are you allowed to swim here?",
		"max_tokens": 1024,
		"temperature": 0.2
    }
  }
);
console.log(output);
```

Note that Llava takes an image as input. You can provide URLs and or base 64 strings here as values for the image.

To learn more, take a [look at the guide on getting started with Node.js](https://replicate.com/docs/get-started/nodejs).

[](#run-llava-with-python)Run Llava with Python
-----------------------------------------------

You can run Llava with our [official Python client](https://github.com/replicate/replicate-python):

```bash
pip install replicate
```

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run yorickvp/llava-13b using Replicate’s API:

```python
import replicate
output = replicate.run(
    "yorickvp/llava-13b:latest",
    input={
		"image": "https://replicate.delivery/pbxt/JfvBi04QfleIeJ3ASiBEMbJvhTQKWKLjKaajEbuhO1Y0wPHd/view.jpg",
		"top_p": 1,
		"prompt": "Are you allowed to swim here?",
		"max_tokens": 1024,
		"temperature": 0.2
    }
)
print(output)
```

Note that Llava takes an image as input. You can provide URLs and or base 64 strings here as values for the image.

To learn more, take a look at the guide on [getting started with Python](https://replicate.com/docs/get-started/python).

[](#run-llava-with-curl)Run Llava with cURL
-------------------------------------------

You can call the [HTTP API](https://replicate.com/docs/reference/http) directly with tools like cURL:

Set the `REPLICATE_API_TOKEN` environment variable:

```bash
export REPLICATE_API_TOKEN=<your-api-token>
```

Run yorickvp/llava-13b using Replicate’s API:

```bash
curl -s -X POST \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d $'{
    "version": "e272157381e2a3bf12df3a8edd1f38d1dbd736bbb7437277c8b34175f8fce358",
    "input": {
		"image": "https://replicate.delivery/pbxt/JfvBi04QfleIeJ3ASiBEMbJvhTQKWKLjKaajEbuhO1Y0wPHd/view.jpg",
		"top_p": 1,
		"prompt": "Are you allowed to swim here?",
		"max_tokens": 1024,
		"temperature": 0.2
    }
  }' \
  https://api.replicate.com/v1/models/yorickvp/llava-13b/predictions
```

Note that Llava takes an image as input. You can provide URLs and or base 64 strings here as values for the image.

To learn more, take a look at [Replicate’s HTTP API](https://replicate.com/docs/reference/http) reference docs.

You can also run Llava using [other Replicate client libraries for Golang, Swift, Elixir, and others](https://replicate.com/docs/reference/client-libraries)

[](#keep-up-to-speed)Keep up to speed
-------------------------------------

*   [Check out our Llava model page](https://replicate.com/yorickvp/llava-13b)
*   [Follow us on Twitter X to get the latest from Replicate](https://x.com/replicate)
*   [Hop in our Discord and talk Llava](https://discord.gg/replicate)

--- END OF llava.md ---


# FILE: models.md

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

--- END OF models.md ---


# FILE: run-a-model.md

You can run models on Replicate using the web or the API.

[](#run-a-model-on-the-web)Run a model on the web
-------------------------------------------------

Every model on Replicate has its own “playground” page with a web form for running the model. The playground is a good place to start when trying out a model for the first time. It gives you a visual view of all the inputs to the model, and generates a form for running the model right from your browser:

![Replicate's web playground UI for running models in the browser](/_content/assets/playground.DYzT_j-I.png)

Once you’ve tried out a model in the playground, you can easily [run the model from your own code using the API](#run-a-model-with-the-api).

[](#run-a-model-with-the-api)Run a model with the API
-----------------------------------------------------

The web playground is great for getting acquainted with a model, but when you’re ready to integrate a model into something like a chat bot, website, or mobile app, you’ll want to use the API.

Our [HTTP API](/docs/reference/http) can be used with any programming language, but there are also [client libraries](/docs/reference/client-libraries) for Python, JavaScript, and other languages that make it easier to use the API.

Using the [Python client](https://github.com/replicate/replicate-python), you can create predictions with just a few lines of code:

```python
import replicate
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "an astronaut riding a horse"}
)
# Save the output image
with open('output.png', 'wb') as f:
    f.write(output[0].read())
```

The [JavaScript client](https://github.com/replicate/replicate-javascript) works similarly:

```javascript
import Replicate from "replicate";
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const model = "black-forest-labs/flux-schnell";
const input = {
  prompt: "a 19th century portrait of a raccoon gentleman wearing a suit",
};
const output = await replicate.run(model, { input });
// Save the output image
fs.writeFileSync("output.png", output[0]);
```

For more details on how to run models with the API, including how to handle output files, see [Create a prediction](/docs/topics/predictions/create-a-prediction) and [Output files](/docs/topics/predictions/output-files).

[](#warm-models)Warm models
---------------------------

We have a huge catalogue of models. To make good use of resources, we only run the models that are actually being used. When a model hasn’t been used for a little while, we turn it off.

When you make a request to run a [prediction](/docs/topics/predictions) on a [model](/docs/topics/models), you’ll get a fast response if the model is “warm” (already running), and a slower response if the model is “cold” (starting up). Machine learning models are often very large and resource intensive, and we have to fetch and load several gigabytes of code for some models. In some cases this process can take several minutes.

Cold boots can also happen when there’s a big spike in demand. We autoscale by running multiple copies of a model on different machines, but the model can take a while to become ready.

For popular public models, cold boots are uncommon because the model is kept “warm” from all the activity. For less-frequently used models, cold boots are more frequent.

If you’re using the API to create predictions in the background, then cold boots probably aren’t a big deal: we only charge for the time that your prediction is actually running, so it doesn’t affect your costs.

--- END OF run-a-model.md ---


# FILE: create-a-model.md

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

--- END OF create-a-model.md ---


# FILE: publish-a-model.md

Whether you’re building a private model with your team, or a public model to share with the community, it’s important to document what your model does and how to use it.

This page has tips for improving your model to make it more discoverable, well-documented, and user-friendly.

If you’ve never created a model before, start by reading the [guide to creating a model with Cog](/docs/guides/push-a-model) or the [guide to fine-tuning Flux](https://replicate.com/blog/fine-tune-flux-with-faces).

[](#what-are-examples)What are examples?
----------------------------------------

The best models include examples.

Examples are [predictions](/docs/topics/predictions) on a model that are shared by the model author.

When you land on a Replicate model page, the first thing you see is the model playground, with inputs and outputs:

[![A model with a good example is easier to understand and use.](/_content/assets/playground-with-example.C-w8M7Uc_Z1DkIuC.webp)](https://replicate.com/lucataco/flux-watercolor)

A model with a good example is easier to understand and use.

When your model has examples, the playground page is more useful and intuitive to new users or your model, as the input form and outputs are pre-populated with starting values that users can modify. This makes it easier to see at a glance what your model does and how to use it.

[](#add-examples)Add examples
-----------------------------

To add examples to your model, [run the model in the playground](/docs/topics/models/run-a-model) and look for the **Add to Examples** button below the prediction output:

![Click this button to add your prediction to the list of examples for this model.](/_content/assets/add-to-examples-button.Bg6ecmLb_Z1FkkN7.webp)

Click this button to add your prediction to the list of examples for this model.

[](#write-a-model-description)Write a model description
-------------------------------------------------------

Keep your model descriptions concise and clear.

Avoid technical terms and abbreviations in your description.

Here are some examples that are vague, confusing, or overly technical:

*   “Arbitrary Neural Style Transfer”
*   “Generating Conditional 3D Implicit Functions”
*   “Zeroscope V2 XL & 576w”

Here are some better examples that are more clear and descriptive:

*   “Add captions to a video”
*   “A language model from Meta, fine tuned for chat completions”
*   “Use Stable Diffusion and aesthetic CLIP embeddings to guide boring outputs to be more aesthetically pleasing.”

To edit the description of your model:

1.  Go to the model page
2.  Click the **Settings** tab
3.  Edit the description
4.  Click **Save**

[](#write-helpful-input-descriptions)Write helpful input descriptions
---------------------------------------------------------------------

Every model has inputs, and every input has a description.

Input descriptions are displayed below each form field in the web playground, as well as the API reference docs for each model.

It’s very important to write good descriptions for your inputs, because they’ll make or break the experience for people using your model.

![Good input descriptions like this one make a big difference in how easy a model is to use.](/_content/assets/playground-input-with-good-description.qMg7J7mj_Z1QhBti.webp)

Good input descriptions like this one make a big difference in how easy a model is to use.

Inputs are defined in the Cog model’s source code in a Python file, typically named `predict.py`. See [Predictor API docs](https://cog.run/python/) for more details.

Here’s an example of a bad input description:

```python
guidance_scale: float = Input(
    description="Scale for classifier-free guidance.",
    ge=1,
    le=50,
    default=7.5
),
```

If you’re a machine learning expert, maybe this description is enough to understand what the input does. But for most people, that’s not enough information.

Here’s an example of a good input description that explains what the input does, how to use it, and what effect different values might have on the output:

```python
guidance_scale: float = Input(
    description="""Scale for classifier-free guidance. This value determines how
                much the image generation follows the prompt. Higher values
                make the output more closely aligned with the prompt but may
                reduce image quality. Values typically range from 7 to 15,
                where 7 is a good starting point. Lower values allow more
                creative freedom but may stray from the prompt.""",
    ge=1,
    le=50,
    default=7.5
),
```

Don’t be afraid to write long descriptions for your inputs. Use triple quotes to allow for multiple lines of text, and use line breaks to make the description more readable. Your users will thank you for it.

[](#add-a-readme)Add a README
-----------------------------

GitHub popularized the README file as a way to describe what a project is and how to use it. In the AI community, this concept has evolved into [AI model cards](https://modelcards.withgoogle.com/about), which provide structured information about machine learning models.

Include the following information in your README, which can also serve as a model card:

*   A description of what the model does
*   How to use the model
*   Common use cases
*   Limitations and ethical considerations
*   Model details (e.g., architecture, training data, performance metrics)
*   Intended uses and out-of-scope uses
*   Troubleshooting tips
*   Citations and acknowledgments

Providing this information in your README helps users understand and use your model, and also promotes transparency and responsible AI development.

[](#displayworthy-models)Displayworthy models
---------------------------------------------

We have some requirements that models must meet to be considered “displayworthy”.

In order for a model to be [featured on the explore page](https://replicate.com/explore), or to [show up in search results](https://replicate.com/search?query=vision), or to be returned by the [“List models” API](https://replicate.com/docs/reference/http#models.list), it must meet these criteria:

*   The model must have at least one [version](/docs/topics/models/versions).
*   The model must have at least one [example](#create-examples) prediction.
*   The model must be [public](/docs/topics/models/private-models).

If you’re building a model that you want others in the community to be able to discover and use, make sure it meets these criteria.

[](#iterate-and-build-new-versions)Iterate and build new versions
-----------------------------------------------------------------

Cog models are versioned just like normal software projects, which means you can create the model once and then continually make improvements to it, and publish those improvements as new versions.

For more details, see [model versions](/docs/topics/models/versions).

--- END OF publish-a-model.md ---


# FILE: versions.md

Just like normal software, machine learning models change and improve over time, and those changes are released as new versions. Whenever a model author retrains a model with new data, fixes a bug in the source code, or updates a dependency, those changes can influence the behavior of the model. The changes are published as new versions, so model authors can make improvements without disrupting the experience for people using older versions of the model. Versioning is essential to making machine learning reproducible: it helps guarantee that a model will behave consistently regardless of when or where it’s being run.

[](#finding-model-versions)Finding model versions
-------------------------------------------------

You can find model versions by going to any model page and clicking on the [Versions tab](https://replicate.com/fofr/sticker-maker/versions).

![The model versions UI on Replicate](/_content/assets/versions.CEoIZcbo.png)

--- END OF versions.md ---

