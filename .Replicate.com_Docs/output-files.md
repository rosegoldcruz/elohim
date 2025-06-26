Some models generate files as output, like images, audio, or video. With the release of version 1.0.0 of our client libraries, the way you handle these output files has changed.

[](#fileoutput-objects)FileOutput Objects
-----------------------------------------

When a model generates files, `replicate.run()` now returns `FileOutput` objects instead of URLs. These objects provide direct access to the file data, simplifying your code and speeding up your applications.

Here’s how you can work with `FileOutput` objects:

### [](#python)Python

```python
import replicate
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "A majestic lion"}
)
# If the model returns a single output
with open('output.png', 'wb') as f:
    f.write(output[0].read())
# If the model returns multiple outputs
for idx, file_output in enumerate(output):
    with open(f'output_{idx}.png', 'wb') as f:
        f.write(file_output.read())
# You can also stream the file by using its iterator methods:
for chunk in output:
  print(chunk)
```

### [](#javascript)JavaScript

```javascript
import Replicate from "replicate";
const replicate = new Replicate();
const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    { input: { prompt: "A majestic lion" }}
);
// If the model returns a single output
fs.writeFileSync("output.png", output);
// If the model returns multiple outputs
output.forEach((fileOutput, idx) => {
    fs.writeFileSync(`output_${idx}.png`, fileOutput);
});
```

[](#fileoutput-properties-and-methods)FileOutput Properties and Methods
-----------------------------------------------------------------------

The `FileOutput` type mimics a file-like object available on the platform.

Each Python `FileOutput` object implements `Iterator[bytes]` and `AsyncIterator[bytes]` and provides:

*   `read()`: Returns the binary content of the file
*   `url`: The URL of the underlying data source

Each JavaScript `FileOutput` object is a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) that also provides:

*   `blob()`: Reads the binary content of the file
*   `pipe()`: Stream the file data to a `WriteableStream` instance.
*   `url()`: The URL of the underlying data source

### [](#streaming-responses)Streaming Responses

In Python, `FileOutput` implements `Iterator[bytes]` and `AsyncIterator[bytes]` which means you can pass it to any function that takes one as input:

```python
with open("output.png", "wb") as f:
    for chunk in output:
        f.write(chunk)
# Using asyncio
import aiofiles
async with aiofiles.open('output.png', mode='wb') as f:
    async for chunk in output:
        await f.write(chunk)
```

In JavaScript, `FileOutput` implements `ReadableStream` which means you can pass it to any function that takes one as input (such as `Response` and `fs.writeFile`) to stream large files efficiently:

```javascript
const fileStream = fs.createWriteStream("output.png");
output[0].pipe(fileStream);
```

### [](#working-with-urls)Working with URLs

Sometimes you might want to use the file’s URL directly - for example, when displaying images in a web application or passing the URL to another service. Each `FileOutput` object has a `url` property:

```python
# Get the URL of the first output
url = output[0].url
print(f"File available at: {url}")
``````javascript
// Get the URL of the first output
const url = output[0].url;
// Example: Using the URL in an HTML image
const img = document.createElement('img');
img.src = url;  // Works with both HTTP URLs and data URIs
document.body.appendChild(img);
```

Remember: URLs for files will point to `replicate.delivery` and will expire after one hour.

[](#migrating-from-earlier-versions)Migrating from Earlier Versions
-------------------------------------------------------------------

If you’re updating from a version before 1.0.0:

1.  Replace any code that fetches URLs with direct use of the `FileOutput` object
2.  Use `read()` or `pipe()` to access file data instead of downloading from URLs
3.  Remove any URL handling or Authorization header logic
4.  If you need URLs (e.g., for displaying images), use the `url` property of the `FileOutput` object

[](#opting-out-of-the-blocking-api)Opting Out of the Blocking API
-----------------------------------------------------------------

If you prefer not to use the blocking API, you can opt for the polling mode. This allows you to handle predictions asynchronously and can be useful if you want to avoid holding a connection open. To use polling mode, pass the relevant argument to the `run()` method in your favorite language:

### [](#python-1)Python

```python
output = replicate.run(
    "black-forest-labs/flux-schnell",
    input={"prompt": "A majestic lion"},
    wait=False
)
```

### [](#javascript-1)JavaScript

```javascript
const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    { input: { prompt: "A majestic lion" }, wait: { type: "poll" } }
);
```

You can also opt out of `FileOutput` objects entirely by configuring the client when you create it:

```javascript
const replicate = new Replicate({ useFileOutput: false });
```

This will make the client return URLs instead of `FileOutput` objects, which can be useful if you’re migrating from an older version or prefer to handle the files yourself.

[](#data-retention)Data Retention
---------------------------------

For predictions created through the API, output files are automatically deleted after an hour. You must save a copy of any files in the output if you’d like to continue using them. For more details on how to store prediction data, see the [webhooks docs](/docs/topics/webhooks).

For predictions created through the web interface, output files are kept indefinitely, unless you delete them manually.

[](#output-file-domains)Output File Domains
-------------------------------------------

Output files are served by `replicate.delivery` and its subdomains.

If you use an allow list of external domains for your assets, add `replicate.delivery` and `*.replicate.delivery` to it.

For example, if you’re building a [Next.js app that displays output files from Replicate](/docs/get-started/nextjs), update your Next.js config as follows:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.replicate.delivery",
      }
    ]
  }
}
```

Remember to update your code to work with `FileOutput` objects if you’re using version 1.0.0 or later of our client libraries.