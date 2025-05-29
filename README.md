<p align="center">
  <img src="assets/deep-research-mcp-logo.png" alt="Deep Research MCP Logo" width="250" height="250">
</p>

<h1 align="center">Deep Research MCP Server</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@pinkpixel/deep-research-mcp"><img src="https://img.shields.io/npm/v/@pinkpixel/deep-research-mcp.svg" alt="NPM Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

The Deep Research MCP Server is a Model Context Protocol (MCP) compliant server designed to perform comprehensive web research. It leverages Tavily's powerful Search and new Crawl APIs to gather extensive, up-to-date information on a given topic. The server then aggregates this data along with documentation generation instructions into a structured JSON output, perfectly tailored for Large Language Models (LLMs) to create detailed and high-quality markdown documents.

## Features

* **Multi-Step Research:** Combines Tavily's AI-powered web search with deep content crawling for thorough information gathering.
* **Structured JSON Output:** Provides well-organized data (original query, search summary, detailed findings per source, and documentation instructions) optimized for LLM consumption.
* **Configurable Documentation Prompt:** Includes a comprehensive default prompt for generating high-quality technical documentation. This prompt can be:
  * Overridden by setting the `DOCUMENTATION_PROMPT` environment variable.
  * Further overridden by passing a `documentation_prompt` argument directly to the tool.
* **Configurable Output Path:** Specify where research documents and images should be saved through:
  * Environment variable configuration
  * JSON configuration
  * Direct parameter in tool calls
* **Granular Control:** Offers a wide range of parameters to fine-tune both the search and crawl processes.
* **MCP Compliant:** Designed to integrate seamlessly into MCP-based AI agent ecosystems.

## Prerequisites

* [Node.js](https://nodejs.org/) (version 18.x or later recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)

## Installation

### Option 1: Using with NPX (Recommended for quick use)

You can run the server directly using `npx` without a global installation:

```bash
npx @pinkpixel/deep-research-mcp
```

### Option 2: Global Installation (Optional)

```bash
npm install -g @pinkpixel/deep-research-mcp
```

Then you can run it using:

```bash
deep-research-mcp
```

### Option 3: Local Project Integration or Development

1. Clone the repository (if you want to modify or contribute):
   ```bash
   git clone [https://github.com/your-username/deep-research-mcp.git](https://github.com/your-username/deep-research-mcp.git)
   cd deep-research-mcp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The server requires a Tavily API key and can optionally accept a custom documentation prompt.

```json
{
  "mcpServers": {
    "deep-research": {
      "command": "npx",
      "args": [
        "-y",
        "@pinkpixel/deep-research-mcp"
      ],
      "env": {
        "TAVILY_API_KEY": "tvly-YOUR_ACTUAL_API_KEY_HERE", // Required
        "DOCUMENTATION_PROMPT": "Your custom, detailed instructions for the LLM on how to generate markdown documents from the research data...", // Optional - if not provided, the default prompt will be used
        "SEARCH_TIMEOUT": "120", // Optional - timeout in seconds for search requests (default: 60)
        "CRAWL_TIMEOUT": "300", // Optional - timeout in seconds for crawl requests (default: 180)
        "MAX_SEARCH_RESULTS": "10", // Optional - maximum search results to retrieve (default: 7)
        "CRAWL_MAX_DEPTH": "2", // Optional - maximum crawl depth (default: 1)
        "CRAWL_LIMIT": "15", // Optional - maximum URLs to crawl per source (default: 10)
        "FILE_WRITE_ENABLED": "true", // Optional - enable file writing capability (default: false)
        "ALLOWED_WRITE_PATHS": "/home/user/research,/home/user/documents", // Optional - comma-separated allowed directories (default: user home directory)
        "FILE_WRITE_LINE_LIMIT": "300" // Optional - maximum lines per file write operation (default: 200)
      }
    }
  }
}
```

### 1\. Tavily API Key (Required)

Set the `TAVILY_API_KEY` environment variable to your Tavily API key.

**Methods:**

* **`.env` file:** Create a `.env` file in the project root (if running locally for development):
  ```env
  TAVILY_API_KEY="tvly-YOUR_ACTUAL_API_KEY"
  ```
* **Directly in command line:**
  ```bash
  TAVILY_API_KEY="tvly-YOUR_ACTUAL_API_KEY" npx @pinkpixel/deep-research-mcp
  ```
* **System Environment Variable:** Set it in your operating system's environment variables.

### 2\. Custom Documentation Prompt (Optional)

You can override the default comprehensive documentation prompt by setting the `DOCUMENTATION_PROMPT` environment variable.

**Methods (in order of precedence):**

1. **Tool Argument:** The `documentation_prompt` parameter passed when calling the `deep-research-tool` takes highest precedence
2. **Environment Variable:** If no parameter is provided in the tool call, the system checks for a `DOCUMENTATION_PROMPT` environment variable
3. **Default Value:** If neither of the above are set, the comprehensive built-in default prompt is used

**Setting via `.env` file:**

```env
DOCUMENTATION_PROMPT="Your custom, detailed instructions for the LLM on how to generate markdown..."
```

**Or directly in command line:**

```bash
DOCUMENTATION_PROMPT="Your custom prompt..." TAVILY_API_KEY="tvly-YOUR_KEY" npx @pinkpixel/deep-research-mcp
```

### 3\. Output Path Configuration (Optional)

You can specify where research documents and images should be saved. If not configured, a default path in the user's Documents folder with a timestamp will be used.

**Methods (in order of precedence):**

1. **Tool Argument:** The `output_path` parameter passed when calling the `deep-research-tool` takes highest precedence
2. **Environment Variable:** If no parameter is provided in the tool call, the system checks for a `RESEARCH_OUTPUT_PATH` environment variable
3. **Default Path:** If neither of the above are set, a timestamped subfolder in the user's Documents folder is used: `~/Documents/research/YYYY-MM-DDTHH-MM-SS/`

**Setting via `.env` file:**

```env
RESEARCH_OUTPUT_PATH="/path/to/your/research/folder"
```

**Or directly in command line:**

```bash
RESEARCH_OUTPUT_PATH="/path/to/your/research/folder" TAVILY_API_KEY="tvly-YOUR_KEY" npx @pinkpixel/deep-research-mcp
```

### 4\. Timeout and Performance Configuration (Optional)

You can configure timeout and performance settings via environment variables to optimize the tool for your specific use case or deployment environment:

**Available Environment Variables:**

- `SEARCH_TIMEOUT` - Timeout in seconds for Tavily search requests (default: 60)
- `CRAWL_TIMEOUT` - Timeout in seconds for Tavily crawl requests (default: 180)
- `MAX_SEARCH_RESULTS` - Maximum number of search results to retrieve (default: 7)
- `CRAWL_MAX_DEPTH` - Maximum crawl depth from base URL (default: 1)
- `CRAWL_LIMIT` - Maximum number of URLs to crawl per source (default: 10)

**Setting via `.env` file:**

```env
SEARCH_TIMEOUT=120
CRAWL_TIMEOUT=300
MAX_SEARCH_RESULTS=10
CRAWL_MAX_DEPTH=2
CRAWL_LIMIT=15
```

**Or directly in command line:**

```bash
SEARCH_TIMEOUT=120 CRAWL_TIMEOUT=300 TAVILY_API_KEY="tvly-YOUR_KEY" npx @pinkpixel/deep-research-mcp
```

**When to adjust these settings:**

- **Increase timeouts** if you're experiencing timeout errors in LibreChat or other MCP clients
- **Decrease timeouts** for faster responses when working with simpler queries
- **Increase limits** for more comprehensive research (but expect longer processing times)
- **Decrease limits** for faster processing with lighter resource usage

### 5\. File Writing Configuration (Optional)

The server includes a secure file writing tool that allows LLMs to save research findings directly to files. This feature is **disabled by default** for security reasons.

**Security Features:**
- File writing must be explicitly enabled via `FILE_WRITE_ENABLED=true`
- Directory restrictions via `ALLOWED_WRITE_PATHS` (defaults to user home directory)
- Line limits per write operation to prevent abuse
- Path validation and sanitization
- Automatic directory creation

**Configuration:**

```env
FILE_WRITE_ENABLED=true
ALLOWED_WRITE_PATHS=/home/user/research,/home/user/documents,/tmp/research
FILE_WRITE_LINE_LIMIT=500
```

**Usage Example:**
Once enabled, LLMs can use the `write-research-file` tool to save content:

```json
{
  "tool": "write-research-file",
  "arguments": {
    "file_path": "/home/user/research/quantum-computing-report.md",
    "content": "# Quantum Computing Research Report\n\n...",
    "mode": "rewrite"
  }
}
```

**Security Considerations:**
- Only enable file writing in trusted environments
- Use specific directory restrictions rather than allowing system-wide access
- Monitor file operations through server logs
- Consider using read-only directories for sensitive systems

## Running the Server

* **Development (with auto-reload):**
  If you've cloned the repository and are in the project directory:

  ```bash
  npm run dev
  ```

  This uses `nodemon` and `ts-node` to watch for changes and restart the server.
* **Production/Standalone:**
  First, build the TypeScript code:

  ```bash
  npm run build
  ```

  Then, start the server:

  ```bash
  npm start
  ```
* **With NPX or Global Install:**
  (Ensure environment variables are set as described in Configuration)

  ```bash
  npx @pinkpixel/deep-research-mcp
  ```

  or if globally installed:

  ```bash
  deep-research-mcp
  ```

The server will listen for MCP requests on stdio.

## How It Works

1. An LLM or AI agent makes a `CallToolRequest` to this MCP server, specifying the `deep-research-tool` and providing a query and other optional parameters.
2. The `deep-research-tool` first performs a Tavily Search to find relevant web sources.
3. It then uses Tavily Crawl to extract detailed content from each of these sources.
4. All gathered information (search snippets, crawled content, image URLs) is aggregated.
5. The chosen documentation prompt (default, ENV, or tool argument) is included.
6. The server returns a single JSON string containing all this structured data.
7. The calling LLM/agent uses this JSON output, guided by the `documentation_instructions`, to generate a comprehensive markdown document.

## Using the `deep-research-tool`

This is the primary tool exposed by the server.

### Output Structure

The tool returns a JSON string with the following structure:

```json
{
  "documentation_instructions": "string", // The detailed prompt for the LLM to generate the markdown.
  "original_query": "string",         // The initial query provided to the tool.
  "search_summary": "string | null",  // An LLM-generated answer/summary from Tavily's search phase (if include_answer was true).
  "research_data": [                  // Array of findings, one element per source.
    {
      "search_rank": "number",
      "original_url": "string",           // URL of the source found by search.
      "title": "string",                  // Title of the web page.
      "initial_content_snippet": "string",// Content snippet from the initial search result.
      "search_score": "number | undefined",// Relevance score from Tavily search.
      "published_date": "string | undefined",// Publication date (if 'news' topic and available).
      "crawled_data": [                 // Array of pages crawled starting from original_url.
        {
          "url": "string",                // URL of the specific page crawled.
          "raw_content": "string | null", // Rich, extracted content from this page.
          "images": ["string", "..."]     // Array of image URLs found on this page.
        }
      ],
      "crawl_errors": ["string", "..."]   // Array of error messages if crawling this source failed or had issues.
    }
    // ... more sources
  ],
  "output_path": "string"             // Path where research documents and images should be saved.
}
```

### Input Parameters

The `deep-research-tool` accepts the following parameters in its `arguments` object:

#### General Parameters

* `query` (string, **required**): The main research topic or question.
* `documentation_prompt` (string, optional): Custom prompt for LLM documentation generation.
  * *Description:* If provided, this prompt will be used by the LLM. It overrides both the `DOCUMENTATION_PROMPT` environment variable and the server's built-in default prompt. If not provided here, the server checks the environment variable, then falls back to the default.
* `output_path` (string, optional): Path where generated research documents and images should be saved.
  * *Description:* If provided, this path will be used for saving research outputs. It overrides the `RESEARCH_OUTPUT_PATH` environment variable. If neither is set, a timestamped folder in the user's Documents directory will be used.

#### Search Parameters (for Tavily Search API)

* `search_depth` (string, optional, default: `"advanced"`): Depth of the initial Tavily search.
  * *Options:* `"basic"`, `"advanced"`. Advanced search is tailored for more relevant sources.
* `topic` (string, optional, default: `"general"`): Category for the Tavily search.
  * *Options:* `"general"`, `"news"`.
* `days` (number, optional): For `topic: "news"`, the number of days back from the current date to include search results.
* `time_range` (string, optional): Time range for search results (e.g., `"d"` for day, `"w"` for week, `"m"` for month, `"y"` for year).
* `max_search_results` (number, optional, default: `7`): Maximum number of search results to retrieve and consider for crawling (1-20).
* `chunks_per_source` (number, optional, default: `3`): For `search_depth: "advanced"`, the number of content chunks to retrieve from each source (1-3).
* `include_search_images` (boolean, optional, default: `false`): Include a list of query-related image URLs from the initial search.
* `include_search_image_descriptions` (boolean, optional, default: `false`): Include image descriptions along with URLs from the initial search.
* `include_answer` (boolean or string, optional, default: `false`): Include an LLM-generated answer from Tavily based on search results.
  * *Options:* `true` (implies `"basic"`), `false`, `"basic"`, `"advanced"`.
* `include_raw_content_search` (boolean, optional, default: `false`): Include the cleaned and parsed HTML content of each initial search result.
* `include_domains_search` (array of strings, optional, default: `[]`): A list of domains to specifically include in the search results.
* `exclude_domains_search` (array of strings, optional, default: `[]`): A list of domains to specifically exclude from the search results.
* `search_timeout` (number, optional, default: `60`): Timeout in seconds for Tavily search requests.

#### Crawl Parameters (for Tavily Crawl API - applied to each URL from search)

* `crawl_max_depth` (number, optional, default: `1`): Max depth of the crawl from the base URL. `0` means only the base URL, `1` means the base URL and links found on it, etc.
* `crawl_max_breadth` (number, optional, default: `5`): Max number of links to follow per level of the crawl tree (i.e., per page).
* `crawl_limit` (number, optional, default: `10`): Total number of links the crawler will process starting from a single root URL before stopping.
* `crawl_instructions` (string, optional): Natural language instructions for the crawler for how to approach crawling the site.
* `crawl_select_paths` (array of strings, optional, default: `[]`): Regex patterns to select only URLs with specific path patterns for crawling (e.g., `"/docs/.*"`).
* `crawl_select_domains` (array of strings, optional, default: `[]`): Regex patterns to restrict crawling to specific domains or subdomains (e.g., `"^docs\\.example\\.com$"`). If `crawl_allow_external` is false (default) and this is empty, crawling is focused on the domain of the URL being crawled. This overrides that focus.
* `crawl_exclude_paths` (array of strings, optional, default: `[]`): Regex patterns to exclude URLs with specific path patterns from crawling.
* `crawl_exclude_domains` (array of strings, optional, default: `[]`): Regex patterns to exclude specific domains or subdomains from crawling.
* `crawl_allow_external` (boolean, optional, default: `false`): Whether to allow the crawler to follow links to external domains.
* `crawl_include_images` (boolean, optional, default: `true`): Whether to extract image URLs from the crawled pages.
* `crawl_categories` (array of strings, optional, default: `[]`): Filter URLs for crawling using predefined categories (e.g., `"Blog"`, `"Documentation"`, `"Careers"`). Refer to Tavily Crawl API for all options.
* `crawl_extract_depth` (string, optional, default: `"advanced"`): Depth of content extraction during crawl.
  * *Options:* `"basic"`, `"advanced"`. Advanced retrieves more data (tables, embedded content) but may have higher latency.
* `crawl_timeout` (number, optional, default: `180`): Timeout in seconds for each Tavily Crawl request.

## Understanding Documentation Prompt Precedence

The `documentation_prompt` is an essential part of this tool as it guides the LLM in how to format and structure the research findings. The system uses this precedence to determine which prompt to use:

1. If the LLM/agent provides a `documentation_prompt` parameter in the tool call:

   - This takes highest precedence and will be used regardless of other settings
   - This allows end users to customize documentation format through natural language requests to the LLM
2. If no parameter is provided in the tool call, but the `DOCUMENTATION_PROMPT` environment variable is set:

   - The environment variable value will be used
   - This is useful for system administrators or developers to set a consistent prompt across all tool calls
3. If neither of the above are set:

   - The comprehensive built-in default prompt is used
   - This default prompt is designed to produce high-quality technical documentation

This flexibility allows:

- End users to customize documentation through natural language requests to the LLM
- Developers to set system-wide defaults
- A fallback to well-designed defaults if no customization is provided

## Working with Output Paths

The `output_path` parameter determines where research documents and images will be saved. This is especially important when the LLM needs to:

1. Save generated markdown documents
2. Download and save images from the research
3. Create supplementary files or resources

The system follows this precedence to determine the output path:

1. If the LLM/agent provides an `output_path` parameter in the tool call:

   - This takes highest precedence
   - Allows end users to specify a custom save location through natural language requests
2. If no parameter is provided, but the `RESEARCH_OUTPUT_PATH` environment variable is set:

   - The environment variable value will be used
   - Good for system-wide configuration
3. If neither of the above are set:

   - A default path with timestamp is used: `~/Documents/research/YYYY-MM-DDTHH-MM-SS/`
   - This prevents overwriting previous research results

The LLM receives the final resolved output path in the tool's response JSON as the `output_path` field, so it always knows where to save generated content.

**Note for LLMs:** When processing the tool results, check the `output_path` field to determine where to save any files you generate. This path is guaranteed to be present in the response.

## Instructions for the LLM

As an LLM using the output of the `deep-research-tool`, your primary goal is to generate a comprehensive, accurate, and well-structured markdown document that addresses the `original_query`.

**Key Steps:**

1. **Parse the JSON Output:** The tool will return a JSON string. Parse this to access its fields: `documentation_instructions`, `original_query`, `search_summary`, and `research_data`.
2. **Adhere to `documentation_instructions`:** This field contains the **primary set of guidelines** for creating the markdown document. It will either be the server's extensive default prompt (focused on high-quality technical documentation) or a custom prompt provided by the user. **Follow these instructions meticulously** regarding content quality, style, structure, markdown formatting, and handling of technical details.
3. **Utilize `research_data` for Content:**
   * The `research_data` array is your main source of information. Each object in this array represents a distinct web source.
   * For each source, pay attention to its `title`, `original_url`, and `initial_content_snippet` for context.
   * The core information for your document will come from the `crawled_data` array within each source. Specifically, the `raw_content` field of each `crawled_data` object contains the rich text extracted from that page.
   * Synthesize information *across multiple sources* in `research_data` to provide a comprehensive view. Do not just list content from one source after another.
   * If `crawled_data[].images` are present, you can mention them or list their URLs if appropriate and aligned with the `documentation_instructions`.
   * If `crawl_errors` are present for a source, it means that particular source might be incomplete. You can choose to note this subtly if it impacts coverage.
4. **Address the `original_query`:** The final document must comprehensively answer or address the `original_query`.
5. **Leverage `search_summary`:** If the `search_summary` field is present (from Tavily's `include_answer` feature), it can serve as a helpful starting point, an executive summary, or a way to frame the introduction. However, the main body of your document should be built from the more detailed `research_data`.
6. **Synthesize, Don't Just Copy:** Your role is not to dump the `raw_content`. You must process, understand, synthesize, rephrase, and organize the information from various sources into a coherent, well-written document that flows logically, as per the `documentation_instructions`.
7. **Markdown Formatting:** Strictly follow the markdown formatting guidelines provided in the `documentation_instructions` (headings, lists, code blocks, emphasis, links, etc.).
8. **Handling Large Volumes:** The `research_data` can be extensive. If you have limitations on processing large inputs, the system calling you might need to provide you with chunks of the `research_data` or make multiple requests to you to build the document section by section. The `deep-research-tool` itself will always attempt to return all collected data in one JSON output.
9. **Technical Accuracy:** Preserve all technical details, code examples, and important specifics from the source content, as mandated by the `documentation_instructions`. Do not oversimplify.
10. **Visual Appeal (If Instructed):** If the `documentation_instructions` include guidelines for visual appeal (like colored text or emojis using HTML), apply them judiciously.

**Example LLM Invocation Thought Process:**

*Agent to LLM:*
"Okay, I've called the `deep-research-tool` with the query '\<em\>What are the latest advancements in quantum-resistant cryptography?\</em\>' and requested 5 sources with advanced crawling. Here's the JSON output:
`{ ... (JSON output from the tool) ... }`

Now, using the `documentation_instructions` provided within this JSON, and the `research_data`, please generate a comprehensive markdown document on 'The Latest Advancements in Quantum-Resistant Cryptography'. Ensure you follow all formatting and content guidelines from the instructions."

## Example `CallToolRequest` (Conceptual Arguments)

An agent might make a call to the MCP server with arguments like this:

```json
{
  "name": "deep-research-tool",
  "arguments": {
    "query": "Explain the architecture of modern data lakes and data lakehouses.",
    "max_search_results": 5,
    "search_depth": "advanced",
    "topic": "general",
    "crawl_max_depth": 1,
    "crawl_extract_depth": "advanced",
    "include_answer": true,
    "documentation_prompt": "Generate a highly technical whitepaper. Start with an abstract, then introduction, detailed sections for data lakes, data lakehouses, comparison, use cases, and a future outlook. Use academic tone. Include all diagrams mentioned by URL if possible as [Diagram: URL].",
    "output_path": "C:/Users/username/Documents/research/datalakes-whitepaper"
  }
}
```

## Troubleshooting

* **API Key Errors:** Ensure `TAVILY_API_KEY` is correctly set and valid.
* **SDK Issues:** Make sure `@modelcontextprotocol/sdk` and `@tavily/core` are installed and up-to-date.
* **No Output/Errors:** Check the server console logs for any error messages. Increase verbosity if needed for debugging.

## Changelog

### v0.1.2 (2024-05-10)

- Added configurable output path functionality
- Fixed type errors with latest Tavily SDK
- Added comprehensive documentation about output paths
- Added logo and improved documentation

### v0.1.1

- Initial public release

## Contributing

Contributions are welcome! Please feel free to submit issues, fork the repository, and create pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
