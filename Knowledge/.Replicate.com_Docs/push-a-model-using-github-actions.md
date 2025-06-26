GitHub Actions let you to automate your software development workflows directly within your GitHub repository.

In this tutorial, you’ll learn how to use GitHub Actions to build and push your model to Replicate, so you don’t have to manually build and push your model. This setup works equally well for both public and private models.

Note

This guide will get you started using GitHub Actions to push your model, but if you’re looking for a more full-featured approach that includes linting, testing, and more, check out the [guide to setting up a CI/CD pipeline for your model](/docs/guides/continuous-model-deployment).

[](#prerequisites)Prerequisites
-------------------------------

*   **An existing Cog model in a GitHub repository.** This tutorial assumes you already have a working Cog model. If you don’t, you can use one from [replicate/cog-examples](https://github.com/replicate/cog-examples) or check out the [guide to pushing a model](/docs/guides/push-a-model).
*   **A Replicate account.** You’ll need a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=github-actions) to push your model to Replicate.

[](#step-1-create-a-workflow-file)Step 1: Create a workflow file
----------------------------------------------------------------

To use GitHub Actions, you define workflows using YAML files stored in the `.github/workflows` directory of your GitHub repository.

Your new workflow will use an open-source GitHub Action called [replicate/setup-cog](https://github.com/replicate/setup-cog) that takes care of installing Docker buildx, Cog, CUDA drivers (optionally), and other setup steps.

Create a new file in the `.github/workflows` directory of your repository, and name it `push.yml`. Then add the following content:

```yml
name: Push to Replicate
on:
  workflow_dispatch:
    inputs:
      model_name:
        description: 'Enter the model name, like "alice/bunny-detector"'
        required: true
jobs:
  push_to_replicate:
    name: Push to Replicate
    runs-on: ubuntu-latest
    steps:
      - name: Free disk pace
        uses: jlumbroso/free-disk-space@v1.3.1
        with:
          tool-cache: false
          docker-images: false
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Cog
        uses: replicate/setup-cog@v2
        with:
          token: ${{ secrets.REPLICATE_CLI_AUTH_TOKEN }}
      - name: Push to Replicate
        run: cog push r8.im/${{ inputs.model_name }}
```

Note

If you’re creating a new model from scratch, you can use the `cog init` command, which will automatically generate a starter workflow for you.

[](#step-2-get-your-replicate-cli-auth-token)Step 2: Get your Replicate CLI auth token
--------------------------------------------------------------------------------------

The [replicate/setup-cog](https://github.com/replicate/setup-cog) action supports automatically authenticating with your Replicate account so you can push models to Replicate. For this to work, you need to provide it with a Replicate CLI auth token.

Go to [replicate.com/auth/token](https://replicate.com/auth/token) and copy the token to your clipboard.

[](#step-3-add-your-replicate-token-as-a-secret)Step 3: Add your Replicate token as a secret
--------------------------------------------------------------------------------------------

Next you’ll add your Replicate API token as a secret to your repository, so it can be safely accessed by your workflow.

Go to your GitHub repository, click “Settings”, click “Secrets”, click “New repository secret”, and add your token as the secret. Name it `REPLICATE_CLI_AUTH_TOKEN` and paste in the token you copied in the previous step.

[](#step-4-commit-and-push-your-changes-to-github)Step 4: Commit and push your changes to GitHub
------------------------------------------------------------------------------------------------

Next you’ll commit and push your changes to GitHub, so you can run the workflow:

```sh
git add .
git commit -am "Add Actions workflow for pushing to Replicate"
git push
```

[](#step-5-trigger-the-workflow-manually)Step 5: Trigger the workflow manually
------------------------------------------------------------------------------

GitHub Actions workflows can be triggered manually, or on a schedule, or in response to events like creating pull requests or pushing to your default branch.

The workflow you added above is configured to be triggered manually (see the `workflow_dispatch` bit). It’s a good idea to start with a manual trigger so you can test out the workflow explicitly, then switch to a more automated process once you’ve got it working as expected.

1.  Go to your repository page on GitHub
2.  Click **Actions**
3.  Click **Push to Replicate**
4.  Enter the name of your Replicate model
5.  Click “Run workflow”

[](#step-6-trigger-the-workflow-automatically-optional)Step 6: Trigger the workflow automatically (optional)
------------------------------------------------------------------------------------------------------------

Once you’ve run the workflow manually and the process is working as expected, you may want to update your workflow to trigger automatically. Here’s how to update the workflow to trigger whenever you push to your default branch:

First, add a [Repository configuration variable](https://docs.github.com/en/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository) to your repository to store the name of your model.

Then update your workflow to run on pushes to your main branch:

```yml
on:
  push:
    branches:
      - main
```

Then update the `cog push` step in your workflow to fall back to the default model name if the input is empty. This will allow you to manually trigger the workflow with a custom model name, or automatically trigger the workflow with the default model name:

```yml
      - name: Push to Replicate
        run: cog push r8.im/${{ inputs.model_name || vars.DEFAULT_MODEL_NAME }}
```

[](#troubleshooting-disk-space)Troubleshooting: Disk space
----------------------------------------------------------

If your model is large, the default GitHub Actions runner may not have enough disk space. The [jlumbroso/free-disk-space](https://github.com/jlumbroso/free-disk-space) action included in the workflow above saves about 30GB of disk space, but that may not be enough for your model.

If you need even more space, you can can [set up a larger hosted runner on GitHub](https://docs.github.com/en/actions/using-github-hosted-runners/about-larger-runners/managing-larger-runners#adding-a-larger-runner-to-an-organization), then update your workflow to use your new runner:

```yml
jobs:
  push_to_replicate:
    name: Push to Replicate
    runs-on: my-custom-runner-with-lots-of-disk-space
```

Note: You’ll need a GitHub Team or GitHub Enterprise Cloud plan to use larger runners.

[](#next-steps)Next steps
-------------------------

Hooray! You’ve now got a workflow that pushes your model to Replicate. You’re on the path to a more automated future, where you can iterate quickly on AI models and ship them just like normal software.