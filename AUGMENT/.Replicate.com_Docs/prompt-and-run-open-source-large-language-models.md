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