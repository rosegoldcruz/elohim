GPUs are specialized processors that are designed to handle complex mathematical calculations. Many machine learning models will only run on a computer with a GPU. While GPUs are incredibly powerful, setting up a machine that can use them can be challenging. GPUs require specific drivers and software to work properly, which can be difficult to install and configure.

In this guide, you’ll learn how to get your own GPU machine in the cloud, so you can package your model and push it to Replicate.

Note

You probably don’t need to set up your own GPU machine to push a model to Replicate. In most cases, you should be able to package your model with [Cog](https://cog.run) and [push it to Replicate](https://replicate.com/docs/guides/push-a-model) without ever leaving your local machine.

In certain cases, you may need a GPU machine to push a model. If you’re not sure if you need this, you probably don’t. If you get an error message like this:

`RuntimeError: CUDA unknown error - this may be due to an incorrectly set up environment, e.g. changing env variable CUDA_VISIBLE_DEVICES after program start. Setting the available devices to be zero.`

then you may need this guide.

[](#sign-up-for-lambda-labs)Sign up for Lambda Labs
---------------------------------------------------

Lambda Labs is a cloud provider that offers GPU machines that come preconfigured with Docker and NVIDIA drivers, which makes them a great fit for working with [Cog](https://cog.run).

Create an account at [lambdalabs.com/service/gpu-cloud](https://lambdalabs.com/service/gpu-cloud) and enter your billing info. You’ll be able to run GPU machines for [as little as $0.50/hour](https://lambdalabs.com/service/gpu-cloud/pricing).

[](#create-a-gpu-cloud-instance)Create a GPU Cloud instance
-----------------------------------------------------------

Once you’ve got a Lambda account, create a new GPU Cloud instance. You’ll be asked to specify three settings:

*   **Instance type**: This is the type of machine you want to use. For example, `1x A10 (24 GB PCIe)`. Start by choosing the smallest instance type. You can upgrade to a larger instance type later if you need more power.
*   **Region**: This is the geographical location of the machine. For example, “California, USA (`us-west-1`)”. Choose the region closest to you.
*   **Filesystem**: This is not strictly required, as your instance will still have an ephemeral writeable filesystem, but if you want to be able to shut down your instance and come back to it without losing your changes on disk, you’ll need to attach a filesystem.

[](#add-your-public-ssh-key)Add your public SSH key
---------------------------------------------------

Next you’ll be asked to provide your public SSH key so you can easily log into your new instance using SSH. If you’ve already set up your SSH keys for another service like GitHub, you can use your existing public key. Use a command like this to copy your public key to your clipboard:

```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

If you don’t have one already, check out [GitHub’s docs for generating an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

[](#launch-your-instance)Launch your instance
---------------------------------------------

Your GPU Cloud instance will be launched in a few minutes. Once it’s ready, you can access it through SSH or JupyterLab.

To SSH into your instance, copy the “SSH login” command from your Lambda dashboard, then run it:

```bash
ssh ubuntu@[your-instance-ip]
```

To access your instance using JupyterLab, click the “Launch” button beside your new instance in the Lambda dashboard.

[](#install-cog-on-your-instance)Install Cog on your instance
-------------------------------------------------------------

Cog is Replicate’s open-source tool that makes it easy to put a machine learning model in a Docker container. Cog is the tool you use to package your trained model and push it to Replicate.

Using the terminal (either from your SSH sesion or inside JupyterLab), run the following command to install Cog on your instance:

```sh
sudo curl -o /usr/local/bin/cog -L https://github.com/replicate/cog/releases/latest/download/cog_`uname -s`_`uname -m`
sudo chmod +x /usr/local/bin/cog
```

[](#run-an-existing-model)Run an existing model
-----------------------------------------------

To verify that your new instance is working properly, you can run a prediction on an existing model on Replicate.

Run the following commmand in the terminal to download the [Stable Diffusion](https://replicate.com/stability-ai/stable-diffusion) model and run it locally on your new instance:

```bash
sudo cog predict r8.im/stability-ai/stable-diffusion@sha256:f178fa7a1ae43a9a9af01b833b9d2ecf97b1bcb0acfd2dc5dd04895e042863f1 -i prompt="a pot of gold"
```

Note: It’s important to use `sudo` here so Cog can work properly with the Docker installation on your instance.

[](#use-jupyterlab-to-view-model-output)Use JupyterLab to view model output
---------------------------------------------------------------------------

JupyterLab is a web-based editor that makes it easy to run models interactively and view the files on your instance. Lambda’s GPU Cloud instances are preconfigured with JupyterLab.

To access JupyterLab, click the “Launch” button beside your new instance in the Lambda dashboard.

You should see your output file in the JupyterLab file browser. Click on it to view the output.

![jupyterlab](https://user-images.githubusercontent.com/2289/214712829-b393d36a-fe90-4da2-974d-735b5ee036fe.png)

[](#push-your-model-to-replicate)Push your model to Replicate
-------------------------------------------------------------

You’ve now got a working GPU machine in the cloud!

Now it’s time to [build your own model and push it to Replicate](https://replicate.com/docs/topics/models/publish-a-model).

[](#terminate-your-instance)Terminate your instance
---------------------------------------------------

Lambda’s GPU Cloud instances remain active until you terminate them, so you’ll be charged for them until you shut them down. To terminate your instance, go to the Lambda dashboard and click “Terminate” on your instance.