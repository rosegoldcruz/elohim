In this guide, you’ll learn how to get your own GPU machine in the cloud using [NVIDIA Brev](https://brev.dev) to build, run, and test your own models.

[](#what-is-brev)What is Brev?
------------------------------

[NVIDIA Brev](https://brev.dev) is a cloud service that offers GPU machines for rent on demand. They come preconfigured with Docker and NVIDIA drivers, which makes them a great fit for working with [Cog](https://cog.run).

Brev connects to multiple cloud providers like GCP, AWS, Lambda Labs, and others to find the right type of GPU for the best price possible.

Brev is a developer-friendly tool with a [command line interface](https://github.com/brevdev/brev-cli) that makes it easy to create and manage your GPU machines.

[](#do-you-even-need-a-gpu)Do you even need a GPU?
--------------------------------------------------

You can build and push most [Cog](https://cog.run) models from machines that don’t have GPUs, like your laptop, or a GitHub Actions runner.

This guide helps when you need to _iterate_ on your model and run it as you make code changes, _before_ you push it to Replicate. For that, you’ll usually need a GPU development environment.

[](#step-1-sign-up-for-brev)Step 1: Sign up for Brev
----------------------------------------------------

To get started, go to [console.brev.dev](https://console.brev.dev/) and sign up for an account.

Creating an account is free, and Brev has [simple pricing](https://www.nvidia.com/en-us/launchables/pricing/): Only pay for what you use.

[](#step-2-install-the-brev-cli)Step 2: Install the Brev CLI
------------------------------------------------------------

Install the Brev CLI using [Homebrew](https://brew.sh/) with the following command:

```bash
brew install brevdev/homebrew-brev/brev
```

.You can create and manage instances using the [Brev website](https://console.brev.dev), but this guide uses the CLI for the sake of “brev”ity. (Sorry. Couldn’t resist.)

[](#step-3-log-in-to-brev)Step 3: Log in to Brev
------------------------------------------------

Use the CLI to log in to Brev:

```plaintext
brev login
```

This will prompt you to open a link in your browser to authenticate with Brev.

[](#step-4-create-an-instance)Step 4: Create an instance
--------------------------------------------------------

Now that you’ve logged in, create an instance and give it a name:

```plaintext
brev create my-dev-box \ 
  --gpu fancy-gpu
```

You should see output like the following:

```plaintext
$ brev create my-dev-box
Creating instance my-dev-box in org bapj27zsc
	name my-dev-box
	GPU instance n1-highmem-4:nvidia-tesla-t4:1
	Cloud GCP
⡿ Creating your instance. Hang tight 
⣟ Instance is deploying 
Your instance is ready!
Connect to the instance:
	brev open my-dev-box	# brev open <NAME> -> open instance in VS Code
	brev shell my-dev-box	# brev shell <NAME> -> ssh into instance (shortcut)
```

[](#step-5-shell-into-your-instance)Step 5: Shell into your instance
--------------------------------------------------------------------

Now that you’ve created your instance, you can access it as a shell:

```plaintext
brev shell my-dev-box
```

This will open a new terminal session that is SSH connected to your GPU instance.

[](#step-6-install-cog)Step 6: Install Cog
------------------------------------------

[Cog](https://cog.run) is Replicate’s open-source tool that makes it easy to put a machine learning model in a Docker container.

Install the Cog CLI on your Brev instance:

```sh
sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
sudo chmod +x /usr/local/bin/cog
```

[](#step-7-run-an-existing-cog-model)Step 7: Run an existing Cog model
----------------------------------------------------------------------

To verify that your new instance is working properly, you can run a prediction on an existing model on Replicate.

Run the following command in the terminal to download the [fofr/sdxl-emoji](https://replicate.com/fofr/sdxl-emoji) model and run it locally on your new instance to generate an emoji of the shaka symbol, AKA the “call me hand”:

```plaintext
cog predict r8.im/fofr/sdxl-emoji@sha256:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e \
  -i 'width=1024' \
  -i 'height=1024' \
  -i 'prompt="A TOK emoji of a hand doing the shaka symbol, AKA call me hand"'
```

If you see successful output from this task, you’ve made great progress!

*   Docker is installed and configured properly
*   NVIDIA CUDA drivers are installed
*   Cog works
*   Your instance is really fast!

[](#step-8-create-a-model)Step 8: Create a model
------------------------------------------------

Now that you know Cog is working, create a new model from scratch:

```plaintext
mkdir my-model && cd my-model
cog init
```

This will output something like the following:

```plaintext
Setting up the current directory for use with Cog...
 Created my-cog-model/cog.yaml
 Created my-cog-model/predict.py
 Created my-cog-model/.dockerignore
 Created my-cog-model/.github/workflows/push.yaml
```

If you’re new to creating models on Replicate, check out the [guide to push your first Cog model](/docs/guides/push-a-model).

[](#step-9-edit-model-code-in-your-ide)Step 9: Edit model code in your IDE
--------------------------------------------------------------------------

Brev can open your cloud instance in [VS Code Remote](https://code.visualstudio.com/docs/remote/remote-overview), Cursor, or your favorite IDE. This lets you search and edit all the files on your Brev instance as if they were on your local machine:

Use `brev open` to open your instance in your editor:

```plaintext
brev open my-dev-box
```

In your editor, overwrite the `predict.py` file with the following code and save it:

```python
from cog import BasePredictor, Input
class Predictor(BasePredictor):
    def setup(self):
        self.prefix = "hello"
    def predict(self, text: str = Input(description="Text to prefix with 'hello '")) -> str:
        return self.prefix + " " + text
```

[](#step-10-run-your-model)Step 10: Run your model
--------------------------------------------------

Now that you’ve made some changes to your model code, run it with Cog using existing `Brev shell` session, or the built-in terminal if you’re using VS Code or Cursor:

```plaintext
cd my-model
cog predict -i text="world"
```

You should see output like the following:

```plaintext
hello world
```

[](#step-11-celebrate)Step 11: Celebrate
----------------------------------------

You’ve just built an AI model on a GPU instance in the cloud!

You also have a fast and flexible cloud environment for iterating on your model and testing it before pushing it to Replicate.

Happy hacking!

[](#tips)Tips
-------------

*   [Install JupyterLab](https://developer.nvidia.com/blog/deploy-gpu-optimized-ai-software-with-one-click-using-brev-dev-and-nvidia-ngc-catalog/) on your instance to view output files and run models interactively.
*   [Increase disk storage](https://replicate.notion.site/Moving-Your-Home-Directory-on-Brev-dev-to-ephemeral-182279e7ce4b80bcb42cdb9fdf73b661) on your Brev instance by moving your home directory to an ephemeral disk.
*   [Update your NVIDIA CUDA drivers](https://replicate.notion.site/updating-nvidia-drivers-to-cuda-12-4-on-a-brev-machine-10d279e7ce4b8078ba52d2f7d597d6e6) to the latest version if it’s needed for your model.
*   [Change the GPU and memory configuration](https://console.brev.dev/) or your existing instance using the Brev web console.
*   Use `brev ls` to list your instances. This is handy if you forget what you named your new instance!
*   Remember to `brev stop` your instance when you’re not using it to avoid incurring charges.