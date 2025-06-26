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