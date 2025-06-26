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