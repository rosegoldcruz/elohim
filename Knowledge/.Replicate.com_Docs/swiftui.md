Learn how to build a SwiftUI app that uses Replicate to run a machine learning model.

By the end, you’ll have an app that can run on iOS and macOS that generates images from text prompts using Stable Diffusion.

Tip

**Want to skip ahead?** Check out the GitHub repo at [replicate/getting-started-swiftui](https://github.com/replicate/getting-started-swiftui).

[](#prerequisites)Prerequisites
-------------------------------

*   **Xcode**: You’ll need Xcode to build and run your app. Download the latest version of Xcode from [developer.apple.com](https://developer.apple.com/xcode/).
*   [**A Replicate account**](https://replicate.com/signin): You’ll use Replicate to run machine learning models. It’s free to get started, and you get a bit of credit when you sign up. After that, you pay per second for your usage. See [how billing works](https://replicate.com/docs/billing) for more details.

[](#1-create-the-app)1\. Create the app
---------------------------------------

[SwiftUI](https://developer.apple.com/xcode/swiftui/) is a framework for building native apps for Apple devices. It’s a great choice for getting something up and running fast, and is well-suited to prototyping ideas with Replicate.

Open Xcode and create a new project by selecting “File” > “New” > “Project…”. (⇧⌘N).

![swiftui-1-light](https://github.com/replicate/cog/assets/2289/2998a94a-1c9a-418a-a454-d0d6da8a2161)

Under “Multiplatform” select the “App” template and click “Next”. Give your app a name, such as “ReplicateExample”, and click “Next”. Then save your project to a working directory.

![swiftui-2-light](https://github.com/replicate/cog/assets/2289/921fd03d-703b-4364-8c67-b1f13953229d)

Now’s a good time to make sure everything is working as expected. In Xcode, select “Product” > “Run” (⌘R) build and run the app on your device or simulator.

If you see a “Hello, world!” message, you’re ready to move on to the next step.

[](#2-add-replicates-swift-package-dependency)2\. Add Replicate’s Swift package dependency
------------------------------------------------------------------------------------------

Use the [official Swift package](https://github.com/replicate/replicate-swift) to run machine learning models on Replicate from your app.

In Xcode, select “File” > “Add packages…”. Copy `https://github.com/replicate/replicate-swift` and paste it into the search bar. Select `replicate-swift` from the list and click the “Add Package” button.

![swiftui-3-light](https://github.com/replicate/cog/assets/2289/949e4c36-dd08-44d3-9f0c-88195900e913)

Once Xcode finishes downloading the package, you’ll be prompted to choose which products to add to your project. Select Replicate’s library and add it to your example app target.

![swiftui-4-light](https://github.com/replicate/cog/assets/2289/83de5826-3cdc-434c-9531-81f29f667290)

[](#3-configure-your-app)3\. Configure your app
-----------------------------------------------

Enable network access for your app so that it can connect to Replicate.

In project settings, select the “ReplicateExample” target, then select the “Signing & Capabilities” tab. Under “App Sandbox”, check the box next to “Outgoing Connections (Client)”.

![swiftui-5-light](https://github.com/replicate/cog/assets/2289/873ee719-287f-4017-80f9-f1beccb298cd)

[](#4-set-up-replicates-client)4\. Set up Replicate’s client
------------------------------------------------------------

Now it’s time to write some code.

In the Project Navigator, open the `ContentView.swift` file. Add the following code to the top of the file, replacing `<#token#>` with [your API token](https://replicate.com/account/api-tokens?new-token-name=swiftui-app).

```swift
import Replicate
private let client = Replicate.Client(token: <#token#>)
```

Warning

For this example, we’re hard-coding the API token in the app. But this is just to help you get started quickly, and isn’t recommended for production apps. You shouldn’t store secrets in code or any other resources bundled with your app. Instead, fetch them from CloudKit or another server and store them in the Keychain.

For more information, consult Apple’s documentation for CloudKit and the Keychain:

*   [fetch(withRecordID:completionHandler:)](https://developer.apple.com/documentation/cloudkit/ckdatabase/1449126-fetch)
*   [Storing Keys in the Keychain](https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_keychain)

[](#5-define-the-model)5\. Define the model
-------------------------------------------

Models on Replicate have typed [inputs](https://replicate.com/stability-ai/stable-diffusion/api#inputs) and [outputs](https://replicate.com/stability-ai/stable-diffusion/api#output-schema), so it’s convenient to define a Swift type for each model your app uses.

In `ContentView.swift`, add the following code:

```swift
// https://replicate.com/stability-ai/stable-diffusion
enum StableDiffusion: Predictable {
  static var modelID = "stability-ai/stable-diffusion"
  static let versionID = "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
  struct Input: Codable {
      let prompt: String
  }
  typealias Output = [URL]
}
```

*   `Predictable` is a protocol that defines a common interface for all models.
*   `modelID` is the ID of the model we want to run — in this case, “stability-ai/stable-diffusion” for [Stable Diffusion](https://replicate.com/stability-ai/stable-diffusion)
*   `versionID` is the ID of the version of the model we want to run. Here, we’re using the latest version at the time of writing.
*   `Input` and `Output` define the types of the model’s input and output. In this case, the input is a struct with a `prompt` property, and the output is a list of URLs to the generated images. (Stable Diffusion has additional inputs, including an option for how many images to generate, but we’re keeping things simple for this example.)

Next, add a `prompt` and a `prediction` property to `ContentView`, and define `generate()` and `cancel()` methods:

```swift
struct ContentView: View {
  @State private var prompt = ""
  @State private var prediction: StableDiffusion.Prediction? = nil
  func generate() async throws {
    prediction = try await StableDiffusion.predict(with: client,
                                                   input: .init(prompt: prompt))
    try await prediction?.wait(with: client)
  }
  func cancel() async throws {
    try await prediction?.cancel(with: client)
  }
  // ...
```

The `generate()` method creates a prediction and waits for it to complete. Because `Prediction` is a value type, the UI will automatically update when the prediction completes.

[](#6-implement-the-rest-of-contentview)6\. Implement the rest of ContentView
-----------------------------------------------------------------------------

Finally, wire up the UI to call these methods and display the generated image.

The content view’s body has a `Form` with a `Section` containing a `TextField`. When the user types text into this field and submits the form, that text will be used to create a prediction by the `generate()` method.

```swift
var body: some View {
  Form {
    Section {
      TextField(text: $prompt,
            prompt: Text("Enter a prompt to display an image"),
            axis: .vertical,
            label: {})
        .disabled(prediction?.status.terminated == false)
        .submitLabel(.go)
        .onSubmit(of: .text) {
          Task {
            try await generate()
          }
        }
    }
```

Under the text field is a conditional block that renders the prediction from the time it’s created until it finishes.

*   `starting` and `processing`: Show an indeterminate loading indicator as well as a button to cancel the prediction.
*   `succeeded`: Show the generated image using an `AsyncImage` component.
*   `failed`: Show an error message.
*   `canceled`: Show a status message to the user.

The `ZStack` acts as a placeholder to keep everything in place while waiting for the prediction to finish.

```swift
if let prediction {
  ZStack {
    Color.clear
      .aspectRatio(1.0, contentMode: .fit)
    switch prediction.status {
    case .starting, .processing:
      VStack{
        ProgressView("Generating...")
          .padding(32)
        Button("Cancel") {
          Task { try await cancel() }
        }
      }
    case .succeeded:
      if let url = prediction.output?.first {
        VStack {
          AsyncImage(url: url, scale: 2.0, content: { phase in
            phase.image?
              .resizable()
              .aspectRatio(contentMode: .fit)
              .cornerRadius(32)
          })
          ShareLink("Export", item: url)
            .padding(32)
        }
      }
    case .failed:
      Text(prediction.error?.localizedDescription ?? "Unknown error")
        .foregroundColor(.red)
    case .canceled:
      Text("The prediction was canceled")
        .foregroundColor(.secondary)
    }
  }
  .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
  .padding()
  .listRowBackground(Color.clear)
  .listRowInsets(.init())
}
```

[](#7-create-a-prediction)7: Create a prediction
------------------------------------------------

Your app should be ready to use now! In Xcode, select “Product” > “Run” (⌘R) to run the app locally.

![swiftui-6-light](https://github.com/replicate/cog/assets/2289/2c38947a-abd6-4bda-bf43-baff303fdd98)

[](#next-steps)Next steps
-------------------------

Huzzah! You should now have a working app that’s powered by machine learning.

But this is just the start. Here are some ideas for what you can do next:

Show your friends what you’ve built.

Before you go too much further, make sure to set up CloudKit to securely store your API key, as you definitely don’t want to commit it to source control.

Integrate a [super resolution model](https://replicate.com/collections/super-resolution) into your new app to upscale the generated images to a higher resolution.

[Explore other models on Replicate](https://replicate.com/explore) and integrate them into your app.

️ Update the README if you’re planning to open-source your project so others know how to use it and contribute.