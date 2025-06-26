[](#what-is-mcp)What is MCP?
----------------------------

The Model Context Protocol (MCP) is an open standard developed by Anthropic that defines how applications share context with large language models (LLMs).

MCP extends the capabilities of apps like [Claude Desktop](https://claude.ai/download), [Cursor](https://www.cursor.com/), or [GitHub Copilot](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp) by feeding them [OpenAPI schemas](/docs/reference/openapi) that describe tools or services, like Replicate’s HTTP API.

MCP lets you give natural language instructions to a language model, and it can discover and run APIs automatically on your behalf.

Here are some examples of the kinds of prompts you can use:

> Search Replicate for upscaler models and compare them

> Show me the latest Replicate models created by @fofr

> Generate an image using black-forest-labs/flux-schnell

> Upscale that image using the best upscaler model

[](#replicates-mcp-server)Replicate’s MCP server
------------------------------------------------

Replicate’s MCP server is published as an [npm package](https://www.npmjs.com/package/replicate-mcp) that is automatically updated whenever we add new features to Replicate’s HTTP API:

[npm.im/replicate-mcp](https://www.npmjs.com/package/replicate-mcp)

The server supports all of the operations in Replicate’s HTTP API. Once you’ve got it wired up you can use natural language chat to do things like:

*   Search for models (using [`models.search`](/docs/reference/http#models.search) under the hood)
*   Compare models (using [`models.list`](/docs/reference/http#models.list) under the hood)
*   Fetch model metadata (using [`models.get`](/docs/reference/http#models.get) under the hood)
*   Run models (using [`predictions.create`](/docs/reference/http#predictions.create) under the hood)
*   Fetch predictions (using [`predictions.get`](/docs/reference/http#predictions.get) under the hood)
*   [etc…](/docs/reference/http)

[](#running-the-mcp-server)Running the MCP server
-------------------------------------------------

The `replicate-mcp` npm package is a self-contained HTTP server that you can run using the Node.js `npx` command, which downloads and executes npm packages by name without you having to install them first.

Use this command to start the MCP server:

```plaintext
npx -y replicate-mcp
```

☝️ This command will fire up a local HTTP server, but in practice you won’t usually run it this way. Instead, you’ll add some JSON configuration to your Claude, Cursor, or VS Code settings that will quietly and automatically run these local MCP servers on your machine.

Stop your server by pressing `Ctrl+c` in the terminal:

```plaintext
^c
```

Then read on to learn how to configure your apps to run the MCP server automatically.

[](#using-replicate-mcp-with-claude-desktop)Using Replicate MCP with Claude Desktop
-----------------------------------------------------------------------------------

[Claude Desktop](https://claude.ai/download) supports local MCP servers out of the box. Note that this only works with the Claude desktop app, not the web app.

Here’s how to set it up:

1.  Create a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=replicate-mcp-claude) and copy it.
    
2.  Open Claude Desktop.
    
3.  Click the Claude menu and select **Settings…** (not the in-app account settings).
    
4.  In the Settings window, click **Developer** in the sidebar, then click **Edit Config**. This will open (or create) a `claude_desktop_config.json` file.
    
5.  Add the following JSON to the file, substituting your Replicate API token for `your-token-here`:
    
    ```json
    {
      "mcpServers": {
        "replicate": {
          "command": "npx",
          "args": ["-y", "replicate-mcp"],
          "env": {
            "REPLICATE_API_TOKEN": "your-token-here"
          }
        }
      }
    }
    ```
6.  Restart Claude Desktop. Click the **Search and Tools** icon in the input box. You should see `replicate` listed as a tool:
    

![Claude Tools](/_content/assets/mcp-claude-tools.CutSK3Lq_ZRke3J.webp)

Now that you’ve got the MCP server running, you can use it to search for models, run predictions, and fetch model metadata.

Try these prompts in Claude Desktop:

> Search Replicate for upscaler models and compare them

> Show me the latest Replicate models created by @fofr

> Generate an image using black-forest-labs/flux-schnell

> Upscale that image using the best upscaler model

![Claude Chat](/_content/assets/mcp-claude-chat.CfCmb2p4_Z1gnLo0.webp)

[](#using-replicate-mcp-with-cursor)Using Replicate MCP with Cursor
-------------------------------------------------------------------

[Cursor](https://www.cursor.com/) supports the Model Context Protocol (MCP), allowing you to connect external tools and data sources—like Replicate’s HTTP API—directly to your code editor. With Replicate’s MCP server, you can search for models, run predictions, and fetch model metadata from within Cursor using natural language.

Start by creating a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=replicate-mcp-cursor) and copy it.

### [](#quick-setup)Quick setup

As of version 1.0, Cursor lets you install MCP servers using a link. Click the button below to install the MCP server in Cursor:

[![Add replicate MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=replicate&config=eyJjb21tYW5kIjoibnB4IC15IHJlcGxpY2F0ZS1tY3AiLCJlbnYiOnsiUkVQTElDQVRFX0FQSV9UT0tFTiI6InlvdXItdG9rZW4taGVyZSJ9fQ%3D%3D)

### [](#manual-setup)Manual setup

If you’d prefer to set up Cursor manually, here’s how:

1.  In your project, create a `.cursor/mcp.json` file with the following content:
    
    ```json
    {
      "mcpServers": {
        "replicate": {
          "command": "npx",
          "args": ["-y", "replicate-mcp"],
          "env": {
            "REPLICATE_API_TOKEN": "your-token-here"
          }
        }
      }
    }
    ```
    
    Replace `your-token-here` with your Replicate API token.
    
2.  Open Cursor. The MCP server will be started automatically when you use a tool that requires it, or you can start it manually from the MCP settings page.
    
3.  In Cursor, open the **MCP settings** (search for “MCP” in the command palette or find it in the settings sidebar). You should see `replicate` listed as an available tool.
    

![Cursor MCP](/_content/assets/mcp-cursor.B2H2azRC_1L58Lp.webp)

Now you can use Replicate tools in Cursor’s Composer Agent:

> Search Replicate for upscaler models and compare them

> Generate an image using black-forest-labs/flux-schnell

> Upscale that image using the best upscaler model

You can also configure MCP servers globally by creating a `~/.cursor/mcp.json` file, making Replicate’s tools available in all your Cursor workspaces.

For more details, see the [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).

[](#using-replicate-mcp-with-github-copilot-in-vs-code)Using Replicate MCP with GitHub Copilot in VS Code
---------------------------------------------------------------------------------------------------------

You can use Replicate’s MCP server with GitHub Copilot Chat in Visual Studio Code to access Replicate’s API tools directly from chat. To set it up:

1.  Install [Visual Studio Code](https://code.visualstudio.com/) version 1.99 or later and make sure you have access to Copilot Chat.
    
2.  Create a [Replicate API token](https://replicate.com/account/api-tokens?new-token-name=replicate-mcp-copilot) and copy it.
    
3.  In your project, create a `.vscode/mcp.json` file with the following content:
    
    ```json
    {
      "servers": {
        "replicate": {
          "command": "npx",
          "args": ["-y", "replicate-mcp"],
          "env": {
            "REPLICATE_API_TOKEN": "your-token-here"
          }
        }
      }
    }
    ```
    
    Replace `your-token-here` with your Replicate API token.
    
4.  Open the `.vscode/mcp.json` file in VS Code and click the **Start** button that appears to launch the MCP server.
    
5.  Open Copilot Chat, select **Agent** from the chat menu, and use Replicate tools in natural language (e.g., “Search Replicate for upscaler models”).
    

You can also configure the MCP server to run globally in VS Code by adding the configuration to your user `settings.json`. For instructions, see the [GitHub Copilot documentation on using existing MCP configurations](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp#using-existing-mcp-configurations).

For more details and advanced configuration, see the [official GitHub Copilot documentation](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp).