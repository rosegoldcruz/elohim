When writing the code for your new webhook handler, it’s useful to be able to receive real webhooks in your development environment so you can verify your code is handling them as expected.

[ngrok](https://ngrok.com/) is a free reverse proxy tool that can create a secure tunnel to your local machine so you can receive webhooks. If you have Node.js installed, run ngrok directly from the command line using the `npx` command that’s included with Node.js.

```shell
npx ngrok http 3000
```

The command above will generate output that looks like this:

```plaintext
Session Status                online
Session Expires               1 hour, 59 minutes
Version                       2.3.41
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://3e48-20-171-41-18.ngrok.io -> http://localhost:3000
Forwarding                    https://3e48-20-171-41-18.ngrok.io -> http://localhost:3000
```

The HTTPS URL in the output (`http://3e48-20-171-41-18.ngrok.io` in the example above) is a temporary URL pointing to your local machine. Copy that URL and use it as the base of your webhook URL.

Here’s an example using the [`replicate` JavaScript client](https://github.com/replicate/replicate-javascript):

```js
await replicate.predictions.create({
  version: "d55b9f2d...",
  input: { prompt: "call me later maybe" },
  webhook: "https://3e48-20-171-41-18.ngrok.io/replicate-webhook",
});
```

Your webhook handler should now receive webhooks from Replicate. Once you’ve deployed your app, change the value of the `webhook` URL to your production webhook handler endpoint when creating predictions.

For a real-world example of webhook handling in Next.js, check out [Scribble Diffusion’s codebase](https://github.com/replicate/scribble-diffusion/pull/27/commits/627c872c78aad89cadd02798d37d4696e3278a12).