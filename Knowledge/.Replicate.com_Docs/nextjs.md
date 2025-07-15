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