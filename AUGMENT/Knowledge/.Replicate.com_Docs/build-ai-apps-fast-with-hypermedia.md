In the age of generative AI it can feel like everything is moving too fast. There are so many fun generative models to play with, and new ones released every day. It’s hard to keep up.

Especially when combining different models, the workflows get complex and hard to manage. But you don’t want to spin up a new production app with frontend, backend, and GPU every time you try something new.

What if you could quickly glue a few models together to suit your workflow? What if you could do this without leaving your browser? Even… from your phone? We’re not talking about “no-code” interfaces here. What if you could build and deploy a custom AI app with just a few lines of code?

This guide will walk you through the basics of hypermedia and how to use it to build AI powered apps. We’ll combine several models to build a custom AI web app and deploy it to the web as a single serverless function. You can follow along in the browser and fork the app to create your own custom AI workflows.

Our example app is Movie Real, a face swapping app that puts you on the big screen:

[](#who-is-this-guide-for)Who is this guide for?
------------------------------------------------

This guide is for developers who want to rapidly prototype AI powered apps. You’re familiar with HTML, CSS, and JavaScript, and you’ve used AI models before.

Maybe you’ve heard about hypermedia and are curious to test it out. Or maybe you’re a full-stack veteran looking for a way to quickly iterate AI projects. Whatever your background, this guide will help you build AI apps fast. We’ll walk through everything step by step and you can follow along in the browser.

### [](#what-is-hypermedia)What is hypermedia?

Hypermedia is a paradigm for interactive multimedia applications. It specifies that the server should send not just data, but also controls that can operate on that data. The user can then use those controls to navigate and operate on the data. The client doesn’t have to know anything other than how to render the data and controls.

Hypermedia is the original vision of the web. Most of the web is built on top of the HyperText Transfer Protocol (HTTP), which is a hypermedia protocol. The original HTML specification was a hypermedia specification. The web was originally designed to be a hypermedia platform.

But the web has changed a lot since then. Frontend frameworks like React, developed for massively multiplayer apps like Facebook, took over the web, and brought all the complexity of those apps with them. Single page apps, state management, and client side routing are now the norm.

The idealism of hypermedia was replaced by the pragmatism of the SPA. But hypermedia is suddenly relevant again, in large part thanks to one library and its author: [HTMX](https://htmx.org/). HTMX is a small JavaScript library that brings the power of hypermedia to the modern web.

There’s already a hypermedia client on every device: the web browser. With HTMX we’ll be able to leverage the browser’s built-in capabilities for rendering, caching and navigation, so we don’t have to reinvent the wheel. And we’ll be able to build apps that are easy to extend and maintain, without having to write a bunch of boilerplate code.

#### [](#hypermedia-and-ai)Hypermedia and AI

The hypermedia paradigm is a great fit for AI powered apps. Generative models are often slow and resource intensive. You don’t want to run them on the client. You want to run them on a GPU instance in the cloud (with Replicate, for example).

If you’re waiting many seconds for a model to generate text or images, you don’t really care about the much smaller latency introduced by a server round trip. And you don’t want to have to manage the state of the app on the client. You want to be able to quickly prototype and iterate on models, prompts, and parameters, without having to worry about re-configuring the frontend.

#### [](#hypermedia-as-the-engine-of-application-state)Hypermedia as the Engine of Application State

Hypermedia as the Engine of Application State (HATEOAS) is a constraint of the original REST specification. It requires that a client should interact with a network application entirely through hypermedia provided dynamically by application servers.

In the current scenario, most APIs are data APIs, not true REST APIs. They send JSON representations of data, which is then transformed into a document by frontend code. This requires the client to know the API of the web app, what data to expect, and how to transform it into a document.

HATEOAS, on the other hand, suggests sending a representation in hypermedia. This representation would include links to other resources, and controls that can operate on those resources. This powerful idea eliminates the need for the client to know anything about the API of your web app. It can discover the API as it goes along.

#### [](#limitations)Limitations

Note that hypermedia might not be the best choice for applications that require real-time, bidirectional communication like chat apps or games. For these types of applications, technologies like WebSockets are more suitable.

[](#the-tools-well-use)The tools we’ll use
------------------------------------------

The hypermedia paradigm is getting more popular, and there are several tools that make it easier to build hypermedia apps. We’ll use a few of them in this guide.

### [](#htmx)HTMX

We talked about HTMX earlier. It’s a small library you import into your `<head>` tag. It lets you add hypermedia attributes to your HTML. Its mission is to fill the missing capabilities of the web platform, and then get out of the way.

The original hypermedia controls are the `link` and `form` tags. They’re the only tags that are allowed to to navigate and operate on resources. HTMX adds a few more attributes that let you do the same thing with any tag. It also adds a boost of interactivity by making it possible to update the page without a full page reload.

### [](#val-town)Val Town

[Val Town](https://www.val.town/) is a social website to code in the cloud. You can create standalone JavaScript functions, called “vals”, to run scripts, schedule actions, and serve HTTP endpoints. That last feature is what we’ll use in this guide. We’ll create a single stateless function that will serve our app.

We won’t need to worry about setting up a backend, or managing a server. We’ll just write our code and deploy it on the cloud. You can use the Val Town editor in any browser, even on your phone. You can copy and fork vals and call one val from another. It’s a great way to quickly prototype and share code.

### [](#replicate)Replicate

[Replicate](https://replicate.com/) runs machine learning models in the cloud. We have a library of open-source models that you can run with a few lines of code. If you’re building your own machine learning models, Replicate makes it easy to deploy them at scale.

For our example app, we’ll chain together calls to a few different models. We can use the Replicate JavaScript client to call the models from our val.

[](#building-a-face-swapping-app-with-val-town-htmx-and-replicate)Building a face swapping app with Val Town, HTMX, and Replicate
---------------------------------------------------------------------------------------------------------------------------------

Warning

This guide is no longer supported, and includes references to deprecated models. Check out the [docs homepage](/docs) for more up-to-date guides and examples.

Now that we’ve learned about the tools and concepts, let’s build a hypermedia AI app. We’ll use Val Town to create a serverless function, HTMX to add hypermedia controls to the page, and Replicate to call AI models.

### [](#the-concept)The concept

Face-swapping models are increasingly popular. And why not? It’s fun to insert your face into a painting or movie screenshot. But wouldn’t it be cool if you could do it with generated images, so you could star in any movie you can imagine?

Let’s make a face swap app that lets you insert your face into a generated image. We’ll use the popular [lucataco/faceswap](https://replicate.com/lucataco/faceswap) to switch the faces, and the photorealistic model [adirik/realvisxl-v3.0-turbo](https://replicate.com/adirik/realvisxl-v3.0-turbo) to generate the imaginary scenes.

### [](#preparing-your-development-environment)Preparing your development environment

This part is surprisingly easy. You don’t need to install anything. You can follow along in the browser.

Sign up for a free account on [Val Town](https://val.town/). You’ll also need an account on [Replicate](https://replicate.com/).

The only other preparation is to get a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=hypermedia-app) and set it as `REPLICATE_API_TOKEN` in your Val Town [Environment Variables](https://www.val.town/settings/environment-variables). This will let you call Replicate models from your val.

Watch out: this will also let anyone else call Replicate models from your val. Val Town protects the security of your environment variable, but it doesn’t secure your HTTP endpoint or do any authentication. We won’t do that for this demo app, but keep it in mind when building your own tool.

### [](#start-with-a-val)Start with a val

Conveniently, Val Town has an HTMX template we can use:

&#x20;

This is an embedded val, so you can run it here. It’s just a hello world example right now, but it does have a live endpoint. You can click “Browser preview” in the bottom panel of the val (or “Open HTTP endpoint” in the top bar) and observe the dynamic behavior enabled by HTMX. Send a request, get a response and update a separate part of the DOM. All with just a 3kb library and two attributes:

```plaintext
hx-target="#answer" hx-post="/"
```

And all without a full page reload. It’s… oddly refreshing.

#### [](#understanding-htmx-attributes)Understanding HTMX attributes

HTMX adds a few attributes to HTML tags so you can add hypermedia controls to your page. The ones to know here are:

*   **hx-get**: fetch a resource
*   **hx-post**: send a request
*   **hx-trigger**: specify the event that triggers a request
*   **hx-swap**: define how to update the page after a request
*   **hx-target**: specify the element to update after a request

You can read more about the attributes in the [HTMX documentation](https://htmx.org/reference/#attributes).

### [](#integrate-replicate)Integrate Replicate

Before we wire up the hypermedia controls, let’s add the Replicate client to our val to call the models. We’ll use the `replicate` package from npm. This code will run on the Val Town platform, so we don’t need to install anything locally.

We also add the function calls that we use to call the models, with parameters set for a nice image. First we send a text prompt to the image generation model, and then send the generated image to the face swap model, and finally return the result.

&#x20;

Note that we encode the uploaded image into a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs). This is so we can pass it from the client to the val without putting it on a server or in blob storage somewhere.

### [](#building-the-ui)Building the UI

Now we’ll add the controls to the app: a form to upload a face image and a text input to prompt the model.

When you submit the form, it sends a POST request to the Val Town endpoint with the form data, which will call our Replicate models and get the generated image. Finally the val sends back a fragment of HTML with the generated image, and HTMX updates the DOM by putting the new fragment at the target.

&#x20;

### [](#add-styles)Add styles

We have a working app! But it’s not very pretty. We can make it look nicer by adding some CSS.

Let’s use [terminal.css](https://terminalcss.xyz/) to give it a clean retro look. We could import this from npm through Val Town, but it’s just a css file that creates utility classes, so to emphasize the power of hypermedia we’ll just include it with a style tag like HTML of old.

Once we’ve added the style tag, we can include the classes in our HTML. Let’s give it a fun name too.

&#x20;

### [](#add-a-loading-indicator)Add a loading indicator

It would also be nice to load more than one image at once. Since we’re using hypermedia as the engine of application state, we can do that by retargeting the new content. Using `hx-swap` we can target the element _before_ the most recent image, so they’ll be stacked in reverse chronological order.

Finally let’s also add a loading indicator so we know when the app is working. We’ll add an attribute `hx-indicator` to the form, and HTMX will add a class `.htmx-request` to the element while the request is in progress. We can use a small piece of CSS to hide the indicator when not loading.

&#x20;

[](#customizing-and-extending-your-app)Customizing and Extending Your App
-------------------------------------------------------------------------

One of the best things about creating tools with Replicate is the ability to modify and customize them in real time to suit your needs.

### [](#integrating-a-new-ai-model)Integrating a New AI Model

For instance, if the images generated by the app aren’t aesthetically pleasing, you don’t have to keep tweaking the prompt each time. Instead, you can integrate a language model to engineer the prompt for you. A popular open-source choice with instruction following abilities is [mistralai/mistral-7b-instruct-v0.1](https://replicate.com/mistralai/mistral-7b-instruct-v0.1). This model can transform a simple prompt into a more complex one, resulting in a better image.

We can use a metaprompt like the following to transform our short text suggestions into evocative descriptions that the image generation model can use to create a more interesting image.

```plaintext
Take the description that follows and imagine it vividly as a movie scene, describing character, action, setting, composition, lighting, and mood. Write your answer in the form of a brief terse sentence. Include only the text of your answer, no other information or communication.
"""
${textPrompt}
"""
```

And then we just pass the prompt through the language model before sending it to the image generation model.

&#x20;

### [](#considering-real-world-factors)Considering Real-World Factors

While this might not be a full-fledged app, it’s a great balance of simplicity and power for a personal tool. However, in a real-world scenario, you’d want to consider factors like authorization, error handling, security, scalability, performance, and cost. This doesn’t mean you have to change approach — [hypermedia can scale](https://htmx.org/essays/does-hypermedia-scale/).

### [](#forking-the-app-and-further-customization)Forking the App and Further Customization

One of the key advantages of this paradigm is the ease of iteration and customization. You can fork and extend the API to suit your needs.

You can modify models, prompts, and behaviors with Replicate. The input and output from one stateless endpoint can be managed, and with the ability to have multiple vals, import them, and call their HTTP endpoints, you could even build an entire app with just vals.

The modular nature of the code means that if you need to scale up, you can easily move the code to a different platform. And since you’re sending hypermedia, the app will continue to work even if the controls or the data change. The browser will be able to render it, and the user will be able to use it.

[](#wrapping-up)Wrapping Up
---------------------------

We’ve journeyed together through the creation of a hypermedia AI app, getting our hands dirty with practical coding and gaining a solid understanding of the key tools and concepts involved. We’ve seen how these elements can come together to build something that’s not just functional, but also fun and imaginative.

### [](#what-lies-ahead)What Lies Ahead

This guide is your starting point. Experiment with different models, tweak the code, and make it your own. The possibilities are endless, and the power to create is in your hands.