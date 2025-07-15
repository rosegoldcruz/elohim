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