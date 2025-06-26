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