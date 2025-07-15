In this tutorial you’ll use Python to build and deploy a Discord chat bot application that uses [Flux Schnell](https://replicate.com/black-forest-labs/flux-schnell) to generate images from text prompts.

[](#prerequisites)Prerequisites
-------------------------------

*   Install [Python 3.5](https://www.python.org/downloads/) or later.
*   A command-line shell (e.g. Terminal on Mac, gnome-terminal on Linux, or PowerShell on Windows)
*   Sign up for an [account on Replicate](https://replicate.com/signin?next=/docs/tutorials/dicord-bot).
*   Sign up for an [account on Discord](https://discord.com/register).

[](#set-up-a-discord-bot-account)Set up a Discord Bot account
-------------------------------------------------------------

Follow [discord.py’s guide](https://discordpy.readthedocs.io/en/stable/discord.html) to set up a Discord Bot account. Give it a name like `flux-bot`. At the end of the first section, you’ll need to turn on the “message content intent” option on the bot page. That permission is needed for your bot to read the content of messages, to get the prompts!

In the second half of the guide – inviting your bot – when it tells you to “tick the permissions required for your bot to function”, you’ll want to give the bot permission to “Send messages”.

[](#write-some-code)Write some code
-----------------------------------

This section walks you through steps required to set up a codebase.

Tip

**Want to skip ahead?** If you’d rather not copy and paste all the code below, then you can clone the [replicate/replicate-discord-bot](https://github.com/replicate/replicate-discord-bot) GitHub repo to start with a working project template.

### [](#create-a-project-directory)Create a project directory

```sh
mkdir flux-bot
cd flux-bot
```

### [](#define-python-dependencies)Define Python dependencies

Next you’ll define some of the Python package dependencies needed by your project.

Install the [poetry](https://python-poetry.org/docs#installation) command-line tool and create a new `pyproject.toml` file:

```sh
poetry init -n
```

Then add dependencies:

```sh
poetry add discord.py python-dotenv replicate
```

### [](#configure-environment-and-secrets)Configure environment and secrets

Create a file named `.env`. This text file will be used to store secrets for your development environment. Paste in the following:

```plaintext
REPLICATE_API_TOKEN=<your-token>
DISCORD_TOKEN=<your-token>
```

Visit [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens?new-token-name=discord-bot) to copy and paste your API token. If you didn’t subscribe before, you’ll need to now to get hold of the token.

The Discord token is the token you copied when creating your bot from the Discord guide. If you don’t have it, you can generate a new one by visiting [discord.com/applications](https://discord.com/developers/applications), selecting your bot application, selecting “Bot” from the side menu, and clicking “Reset Token”.

Note

The `.env` file contains secrets, so it should not be shared with anyone. If you’re planning to turn your project into a Git repository, be sure to create a [`.gitignore` file](https://git-scm.com/docs/gitignore) and add `.env` to it.

### [](#write-the-bot)Write the bot

Create a new file called `bot.py` and paste the following code into it:

```python
from discord import Intents
from discord.ext import commands
from dotenv import load_dotenv
import os
import replicate
load_dotenv()
intents = Intents.default()
intents.message_content = True
bot = commands.Bot(
    command_prefix="!",
    description="Runs models on Replicate!",
    intents=intents,
)
@bot.command()
async def flux(ctx, *, prompt):
    """Generate an image from a text prompt using the Flux Schnell model"""
    msg = await ctx.send(f""{prompt}"\n> Generating...")
    output = replicate.run(
        "black-forest-labs/flux-schnell",
        input={"prompt": prompt}
    )
    # Convert the FileOutput to bytes for Discord's upload_file
    file_data = output[0].read()
    await msg.delete()
    await ctx.send(f""{prompt}"", file=discord.File(file_data, "flux.png"))
bot.run(os.environ["DISCORD_TOKEN"])
```

This file defines the command for your bot (`!flux`) and how it works. When you want to make changes to your bot later, this will be the file you come back to.

[](#run-your-bot-locally)Run your bot locally
---------------------------------------------

Now that you’ve written the code for your bot, it’s time to run it!

The Discord API uses a system called [Gateway](https://discord.com/developers/docs/topics/gateway) which supports real-time communication over WebSockets. This means you can run your bot from any computer, even if it’s not exposed to the public internet. No need to configure any webhooks!

Run this command to start your bot locally:

```sh
poetry run python bot.py
```

[](#use-the-bot)Use the bot
---------------------------

Check your bot is running by typing `!help` into one of the channels on your Discord server. Your bot should respond with the list of commands it can run, including `!flux`.

Now try generating an image:

```text
!flux an astronaut riding a horse
```

Your bot should write a message saying “Generating…”, and then a few seconds later it should swap out that message for the newly generated image.

[](#deploy-your-bot-optional)Deploy your bot (optional)
-------------------------------------------------------

Running your bot locally is convenient, especially when you’re actively working on it. The downside, however, is that it can only run when you’re online. If you’re building a bot for a server, you probably want it to be online even when you aren’t.

There are lots of ways to deploy an application like this. Some of the easiest are services like [Vercel](https://vercel.com/), [Fly](https://fly.io/) or [Heroku](https://heroku.com). In this tutorial, you’ll use Fly to deploy the bot to the cloud.

To get started, see [Fly’s “speedrun” guide](https://fly.io/speedrun/) to install the `flyctl` command-line tool and create a Fly account.

Then create a new file called `Dockerfile` and paste the following code into it:

```docker
FROM python:3.10
RUN pip install poetry
WORKDIR /code
COPY poetry.lock pyproject.toml /code/
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi
COPY . /code
CMD python bot.py
```

Then create a new Fly application:

```sh
flyctl launch
```

That command will generate a new file called `fly.toml`, but it’s designed for running web apps so you’ll need to make a few changes. Remove the `[[services]]` block and everything below it. Your modified file should look something like this:

```toml
app = "name-of-your-fly-app"
kill_signal = "SIGINT"
kill_timeout = 5
processes = []
[env]
[experimental]
  allowed_public_ports = []
  auto_rollback = true
```

Then configure your Fly app using the secrets from your local `.env` file:

```sh
flyctl secrets set REPLICATE_API_TOKEN=... DISCORD_TOKEN=...
```

That’s it! Your bot is now running in the cloud.

[](#next-steps)Next steps
-------------------------

Now might be a good time to tinker with the bot a bit. Some ideas:

*   Generate multiple images instead of a single one, and show them all.
*   Add another command that runs [a different model](https://replicate.com/explore).
*   Take the image output and run it through another model, like an [upscaler](https://replicate.com/collections/super-resolution).
*   Turn it into a game. Perhaps [a game of telephone](https://twitter.com/TelephoneAI), or [a game of Pictionary](https://en.wikipedia.org/wiki/Pictionary).

[Get creative and share what you’ve built in our Discord!](https://discord.gg/replicate)