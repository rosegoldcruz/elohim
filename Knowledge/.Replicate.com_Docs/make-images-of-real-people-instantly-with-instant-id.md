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