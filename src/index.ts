#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { tavily as createTavilyClient } from "@tavily/core";
import type { TavilyClient } from "@tavily/core"; // For typing the Tavily client instance
import dotenv from "dotenv";

dotenv.config(); // Load .env file if present (for local development)

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
if (!TAVILY_API_KEY) {
    throw new Error(
        "TAVILY_API_KEY environment variable is required. Please set it in your .env file or execution environment."
    );
}

const ENV_DOCUMENTATION_PROMPT = process.env.DOCUMENTATION_PROMPT;

const DEFAULT_DOCUMENTATION_PROMPT = `
For all queries, search the web extensively to acquire up to date information. Research several sources. Use all the tools provided to you to gather as much context as possible.
Adhere to these guidelines when creating documentation:
Include screenshots when appropriate

1. CONTENT QUALITY:
    Clear, concise, and factually accurate
    Structured with logical organization
    Comprehensive coverage of topics
    Technical precision and attention to detail
    Free of unnecessary commentary or humor
    DOCUMENTATION STYLE:
    Professional and objective tone
    Thorough explanations with appropriate technical depth
    Well-formatted with proper headings, lists, and code blocks
    Consistent terminology and naming conventions
    Clean, readable layout without extraneous elements
    CODE QUALITY:
    Clean, maintainable, and well-commented code
    Best practices and modern patterns
    Proper error handling and edge case considerations
    Optimal performance and efficiency
    Follows language-specific style guidelines
    TECHNICAL EXPERTISE:
    Programming languages and frameworks
    System architecture and design patterns
    Development methodologies and practices
    Security considerations and standards
    Industry-standard tools and technologies
    Documentation guidelines
    Create an extremely detailed, comprehensive markdown document about a given topic when asked. Follow the below instructions:
    Start with an INTRODUCTION and FIRST MAJOR SECTIONS of the topic, covering:
    Overview and definition of the topic
    Historical background and origins
    Core concepts and fundamentals
    Early developments and pioneers
    Create a strong foundation and then continue with ADDITIONAL SECTIONS:
    Advanced concepts and developments
    Modern applications and technologies
    Current trends and future directions
    Challenges and limitations
    IMPORTANT GUIDELINES:
    Create a SUBSTANTIAL document section (2000-3000 words for this section)
    PRESERVE all technical details, code examples, and important specifics from the sources
    MAINTAIN the depth and complexity of the original content
    DO NOT simplify or omit technical information
    Include all relevant examples, specifications, and implementation details
    Format with proper markdown headings (## for main sections, ### for subsections).
    Include examples and code snippets Maintain relationships between concepts
    Avoid omitting "less important" sections that might be critical for complete documentation
    Preserve hierarchical structures in documentation
    Guidelines for Proper Markdown Formatting:
    Document Structure:
    Use an informative title at the top of the document.
    Include a brief introduction to the topic.
    Organize content into logical sections using headings.
    Headings:
    Use # Heading for the main title.
    Use ## Heading for major sections.
    Use ### Heading for subsections.
    Limit headings to three levels for clarity.
    Text Formatting:
    Use *italic text* for emphasis.
    Use **bold text** for strong emphasis.
    Combine emphasis with ***bold and italic***.
    Lists:
    Use -, +, or * for unordered lists.
    Use 1., 2., etc., for ordered lists.
    Avoid ending list items with periods unless they contain multiple sentences.
    Links and Images:
    Use [Descriptive Text](https://example.com) for links.
    Use Alt Text for images.
    Ensure descriptive text is informative.
    Code Blocks:
    Use triple backticks \`\`\`to enclose code blocks. Specify the programming language if necessary (e.g.,\`\`\`
    Line Breaks and Paragraphs:
    Use a blank line to separate paragraphs.
    Use two spaces at the end of a line for a line break.
    Special Characters:
    Escape special characters with a backslash (\\) if needed (e.g., \\# for a literal #).
    Metadata:
    Include metadata at the top of the document if necessary (e.g., author, date).
    Consistency and Style:
    Follow a consistent naming convention for files and directories.
    Use a project-specific style guide if available.
    Additional Tips:
    Use Markdown extensions if supported by your platform (e.g., tables, footnotes).
    Preview your documentation regularly to ensure formatting is correct.
    Use linting tools to enforce style and formatting rules.
    Output Requirements:
    The documentation should be in Markdown format.
    Ensure all links and images are properly formatted and functional.
    The document should be easy to navigate with clear headings and sections.
    By following these guidelines, you produce high-quality Markdown documentation that is both informative and visually appealing.
    To make your Markdown document visually appealing with colored text and emojis, you can incorporate the following elements:
    Using Colored Text
    Since Markdown does not natively support colored text, you can use HTML tags to achieve this:
    HTML \`<span>\` Tag:
    Use the \`<span>\` tag with inline CSS to change the text color. For example:
    html
    \`<span style="color:red;">\`This text will be red.
    You can replace red with any color name or hex code (e.g., #FF0000 for red).
    HTML \`<font>\` Tag (Deprecated):
    Although the \`<font>\` tag is deprecated, it can still be used in some environments:
    html
    \`<font color="red">\`This text will be red.\`</font>\`
    However, it's recommended to use the \`<span>\` tag for better compatibility.
    Incorporating Emojis
    Emojis can add visual appeal and convey emotions or ideas effectively:
    Copy and Paste Emojis:
    You can copy emojis from sources like Emojipedia and paste them directly into your Markdown document. For example:
    markdown
    This is a happy face 😊.
    Emoji Shortcodes:
    Some platforms support emoji shortcodes, which vary by application. For example, on GitHub, you can use :star: for a star emoji ⭐️.
    Best Practices for Visual Appeal
    Consistency: Use colors and emojis consistently throughout the document to maintain a cohesive look.
    Accessibility: Ensure that colored text has sufficient contrast with the background and avoid relying solely on color to convey information3.
    Purposeful Use: Use colors and emojis to highlight important information or add visual interest, but avoid overusing them.
    Example of a Visually Appealing Markdown Document
    markdown

# Introduction to Python 🐍

## What is Python?

Python is a versatile and widely-used programming language. It is \`<span style="color:blue;">\`easy to learn and has a vast number of libraries for various tasks.

### Key Features

- **Easy to Read:** Python's syntax is designed to be clear and concise.
- **Versatile:** From web development to data analysis, Python can do it all 📊.
- **Large Community:** Python has a large and active community, which means there are many resources available 🌟.

## Conclusion

Python is a great language for beginners and experienced developers alike. Start your Python journey today! 🚀
This example incorporates colored text and emojis to enhance readability and visual appeal.
VERY IMPORTANT - Remember that your goal is to produce high-quality, clean, professional technical content, documentation and code that meets the highest standards, without unnecessary commentary, following all of the above guidelines
`;

// Interface for the arguments our deep-research-tool will accept
interface DeepResearchToolArguments {
    query: string;
    search_depth?: "basic" | "advanced";
    topic?: "general" | "news";
    days?: number;
    time_range?: string;
    max_search_results?: number;
    chunks_per_source?: number;
    include_search_images?: boolean;
    include_search_image_descriptions?: boolean;
    include_answer?: boolean | "basic" | "advanced";
    include_raw_content_search?: boolean;
    include_domains_search?: string[];
    exclude_domains_search?: string[];
    search_timeout?: number;

    crawl_max_depth?: number;
    crawl_max_breadth?: number;
    crawl_limit?: number;
    crawl_instructions?: string;
    crawl_select_paths?: string[];
    crawl_select_domains?: string[];
    crawl_exclude_paths?: string[];
    crawl_exclude_domains?: string[];
    crawl_allow_external?: boolean;
    crawl_include_images?: boolean;
    crawl_categories?: string[];
    crawl_extract_depth?: "basic" | "advanced";
    crawl_timeout?: number;
    documentation_prompt?: string; // For custom documentation instructions
    output_path?: string; // Path where research documents and images should be saved
    hardware_acceleration?: boolean;
}

// Structure for storing combined search and crawl results for one source
interface CombinedResult {
    search_rank: number;
    original_url: string;
    title: string;
    initial_content_snippet: string; // Snippet from the search result
    search_score?: number;
    published_date?: string; // If topic is 'news'
    crawled_data: CrawledPageData[];
    crawl_errors: string[];
}

// Structure for data from a single crawled page
interface CrawledPageData {
    url: string; // The specific URL that was crawled (could be same as original_url or deeper)
    raw_content: string | null; // The main content extracted from this page
    images?: string[]; // URLs of images found on this page
}

// Add Tavily API parameter interfaces based on documentation
interface TavilySearchParams {
    query: string;
    searchDepth?: "basic" | "advanced";
    topic?: "general" | "news";
    days?: number;
    timeRange?: string;
    maxResults?: number;
    chunksPerSource?: number;
    includeImages?: boolean;
    includeImageDescriptions?: boolean;
    includeAnswer?: boolean | "basic" | "advanced";
    includeRawContent?: boolean;
    includeDomains?: string[];
    excludeDomains?: string[];
    timeout?: number;
}

// Add the necessary TavilyCrawlCategory type
type TavilyCrawlCategory = 
    | "Careers" 
    | "Blog" 
    | "Documentation" 
    | "About" 
    | "Pricing" 
    | "Community" 
    | "Developers" 
    | "Contact" 
    | "Media";

// Update interface with all required fields
interface TavilyCrawlParams {
    url: string;
    maxDepth?: number;
    maxBreadth?: number;
    limit?: number;
    instructions?: string;
    selectPaths?: string[];
    selectDomains?: string[];
    excludePaths?: string[];
    excludeDomains?: string[];
    allowExternal?: boolean;
    includeImages?: boolean;
    categories?: TavilyCrawlCategory[];
    extractDepth?: "basic" | "advanced";
    timeout?: number;
}

class DeepResearchMcpServer {
    private server: Server;
    private tavilyClient: TavilyClient;

    constructor() {
        this.server = new Server(
            {
                name: "deep-research-mcp",
                version: "1.0.0", // Increment version for new features/fixes
            },
            {
                capabilities: {
                    resources: {},
                    tools: {},
                    prompts: {}, // Prompts handled by the tool's output logic
                },
            }
        );

        try {
            this.tavilyClient = createTavilyClient({ apiKey: TAVILY_API_KEY }) as unknown as TavilyClient;
        } catch (e: any) {
            console.error("Failed to instantiate Tavily Client:", e.message);
            throw new Error(
                `Could not initialize Tavily Client. Check API key and SDK usage: ${e.message}`
            );
        }

        this.setupRequestHandlers();
        this.setupErrorHandling();
    }

    private setupErrorHandling(): void {
        this.server.onerror = (error) => {
            console.error("[DeepResearchMCP Error]", error);
        };

        const shutdown = async () => {
            console.error("Shutting down DeepResearchMcpServer...");
            try {
                await this.server.close();
            } catch (err) {
                console.error("Error during server shutdown:", err);
            }
            process.exit(0);
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    }

    private setupRequestHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools: Tool[] = [
                {
                    name: "deep-research-tool",
                    description:
                        "Performs extensive web research using Tavily Search and Crawl. Returns aggregated JSON data including the query, search summary (if any), detailed research findings, and documentation instructions. The documentation instructions will guide you on how the user wants the research data to be formatted into markdown.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "The main research topic or question." },
                            search_depth: { type: "string", enum: ["basic", "advanced"], default: "advanced", description: "Depth of the initial Tavily search ('basic' or 'advanced')." },
                            topic: { type: "string", enum: ["general", "news"], default: "general", description: "Category for the Tavily search ('general' or 'news')." },
                            days: { type: "number", description: "For 'news' topic: number of days back from current date to include results." },
                            time_range: { type: "string", description: "Time range for search results (e.g., 'd' for day, 'w' for week, 'm' for month, 'y' for year)." },
                            max_search_results: { type: "number", default: 7, minimum: 1, maximum: 20, description: "Max search results to retrieve for crawling (1-20)." },
                            chunks_per_source: { type: "number", default: 3, minimum: 1, maximum: 3, description: "For 'advanced' search: number of content chunks from each source (1-3)." },
                            include_search_images: { type: "boolean", default: false, description: "Include image URLs from initial search results." },
                            include_search_image_descriptions: { type: "boolean", default: false, description: "Include image descriptions from initial search results." },
                            include_answer: { 
                                anyOf: [
                                    { type: "boolean" }, 
                                    { type: "string", enum: ["basic", "advanced"] }
                                ],
                                default: false, 
                                description: "Include an LLM-generated answer from Tavily search (true implies 'basic')." 
                            },
                            include_raw_content_search: { type: "boolean", default: false, description: "Include cleaned HTML from initial search results." },
                            include_domains_search: { type: "array", items: { type: "string" }, default: [], description: "List of domains to specifically include in search." },
                            exclude_domains_search: { type: "array", items: { type: "string" }, default: [], description: "List of domains to specifically exclude from search." },
                            search_timeout: { type: "number", default: 60, description: "Timeout in seconds for Tavily search requests." },
                            crawl_max_depth: { type: "number", default: 1, description: "Max crawl depth from base URL (1-2). Higher values increase processing time significantly." },
                            crawl_max_breadth: { type: "number", default: 10, description: "Max links to follow per page level during crawl (1-10)." },
                            crawl_limit: { type: "number", default: 10, description: "Total links crawler will process per root URL (1-20)." },
                            crawl_instructions: { type: "string", description: "Natural language instructions for the crawler." },
                            crawl_select_paths: { type: "array", items: { type: "string" }, default: [], description: "Regex for URLs paths to crawl (e.g., '/docs/.*')." },
                            crawl_select_domains: { type: "array", items: { type: "string" }, default: [], description: "Regex for domains/subdomains to crawl (e.g., '^docs\\.example\\.com$'). Overrides auto-domain focus." },
                            crawl_exclude_paths: { type: "array", items: { type: "string" }, default: [], description: "Regex for URL paths to exclude." },
                            crawl_exclude_domains: { type: "array", items: { type: "string" }, default: [], description: "Regex for domains/subdomains to exclude." },
                            crawl_allow_external: { type: "boolean", default: false, description: "Allow crawler to follow links to external domains." },
                            crawl_include_images: { type: "boolean", default: false, description: "Extract image URLs from crawled pages." },
                            crawl_categories: { type: "array", items: { type: "string" }, default: [], description: "Filter crawl URLs by categories (e.g., 'Blog', 'Documentation')." },
                            crawl_extract_depth: { type: "string", enum: ["basic", "advanced"], default: "basic", description: "Extraction depth for crawl ('basic' or 'advanced')." },
                            crawl_timeout: { type: "number", default: 180, description: "Timeout in seconds for Tavily crawl requests." },
                            documentation_prompt: {
                                type: "string",
                                description: "Optional. Custom prompt for LLM documentation generation. Overrides 'DOCUMENTATION_PROMPT' env var and default. If none set, a comprehensive default is used.",
                            },
                            output_path: {
                                type: "string",
                                description: "Optional. Path where generated research documents and images should be saved. If not provided, a default path in user's Documents folder with timestamp will be used.",
                            },
                            hardware_acceleration: { type: "boolean", default: false, description: "Try to use hardware acceleration (WebGPU) if available." },
                        },
                        required: ["query"],
                    },
                },
            ];
            return { tools };
        });

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                if (!request.params || typeof request.params.name !== 'string' || typeof request.params.arguments !== 'object') {
                    console.error("Invalid CallToolRequest structure:", request);
                    throw new McpError(ErrorCode.InvalidParams, "Invalid tool call request structure.");
                }
                
                if (request.params.name !== "deep-research-tool") {
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }

                const rawArgs = request.params.arguments || {};
                const args: DeepResearchToolArguments = {
                    query: typeof rawArgs.query === 'string' ? rawArgs.query : '',
                    search_depth: rawArgs.search_depth as "basic" | "advanced" | undefined,
                    topic: rawArgs.topic as "general" | "news" | undefined,
                    days: rawArgs.days as number | undefined,
                    time_range: rawArgs.time_range as string | undefined,
                    max_search_results: rawArgs.max_search_results as number | undefined,
                    chunks_per_source: rawArgs.chunks_per_source as number | undefined,
                    include_search_images: rawArgs.include_search_images as boolean | undefined,
                    include_search_image_descriptions: rawArgs.include_search_image_descriptions as boolean | undefined,
                    include_answer: rawArgs.include_answer as boolean | "basic" | "advanced" | undefined,
                    include_raw_content_search: rawArgs.include_raw_content_search as boolean | undefined,
                    include_domains_search: rawArgs.include_domains_search as string[] | undefined,
                    exclude_domains_search: rawArgs.exclude_domains_search as string[] | undefined,
                    search_timeout: rawArgs.search_timeout as number | undefined,
                    crawl_max_depth: rawArgs.crawl_max_depth as number | undefined,
                    crawl_max_breadth: rawArgs.crawl_max_breadth as number | undefined,
                    crawl_limit: rawArgs.crawl_limit as number | undefined,
                    crawl_instructions: rawArgs.crawl_instructions as string | undefined,
                    crawl_select_paths: rawArgs.crawl_select_paths as string[] | undefined,
                    crawl_select_domains: rawArgs.crawl_select_domains as string[] | undefined,
                    crawl_exclude_paths: rawArgs.crawl_exclude_paths as string[] | undefined,
                    crawl_exclude_domains: rawArgs.crawl_exclude_domains as string[] | undefined,
                    crawl_allow_external: rawArgs.crawl_allow_external as boolean | undefined,
                    crawl_include_images: rawArgs.crawl_include_images as boolean | undefined,
                    crawl_categories: rawArgs.crawl_categories as string[] | undefined,
                    crawl_extract_depth: rawArgs.crawl_extract_depth as "basic" | "advanced" | undefined,
                    crawl_timeout: rawArgs.crawl_timeout as number | undefined,
                    documentation_prompt: rawArgs.documentation_prompt as string | undefined,
                    output_path: rawArgs.output_path as string | undefined,
                    hardware_acceleration: rawArgs.hardware_acceleration as boolean | undefined,
                };

                if (!args.query) {
                    throw new McpError(ErrorCode.InvalidParams, "Tool arguments are missing.");
                }

                // After retrieving other params from rawArgs
                if (typeof rawArgs.output_path === 'string') {
                    args.output_path = rawArgs.output_path;
                }

                let finalDocumentationPrompt = DEFAULT_DOCUMENTATION_PROMPT;
                if (ENV_DOCUMENTATION_PROMPT) {
                    finalDocumentationPrompt = ENV_DOCUMENTATION_PROMPT;
                }
                if (args.documentation_prompt) {
                    finalDocumentationPrompt = args.documentation_prompt;
                }

                // After setting finalDocumentationPrompt, add this code to determine the output path
                let finalOutputPath = "";
                if (args.output_path) {
                    finalOutputPath = args.output_path;
                } else if (process.env.RESEARCH_OUTPUT_PATH) {
                    finalOutputPath = process.env.RESEARCH_OUTPUT_PATH;
                } else {
                    // Default path with timestamp to avoid overwriting
                    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
                    const documentsPath = process.env.HOME || process.env.USERPROFILE || '.';
                    finalOutputPath = `${documentsPath}/Documents/research/${timestamp}`;
                }

                try {
                    // Check if hardware acceleration is requested for this specific call
                    if (args.hardware_acceleration) {
                        console.error("Hardware acceleration requested for this research query");
                        try {
                            // Try to enable Node.js flags for GPU if not already enabled
                            process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '';
                            if (!process.env.NODE_OPTIONS.includes('--enable-webgpu')) {
                                process.env.NODE_OPTIONS += ' --enable-webgpu';
                                console.error("Added WebGPU flag to Node options");
                            } else {
                                console.error("WebGPU flag already present in Node options");
                            }
                        } catch (err) {
                            console.error("Failed to set hardware acceleration:", err);
                        }
                    }
                    
                    // Convert our parameters to Tavily Search API format
                    const searchParams: TavilySearchParams = {
                        query: args.query,
                        searchDepth: args.search_depth ?? "advanced",
                        topic: args.topic ?? "general",
                        maxResults: args.max_search_results ?? 7,
                        includeImages: args.include_search_images ?? false,
                        includeImageDescriptions: args.include_search_image_descriptions ?? false,
                        includeAnswer: args.include_answer ?? false,
                        includeRawContent: args.include_raw_content_search ?? false,
                        includeDomains: args.include_domains_search ?? [],
                        excludeDomains: args.exclude_domains_search ?? [],
                        timeout: args.search_timeout ?? 60,
                    };

                    if (searchParams.searchDepth === "advanced" && (args.chunks_per_source !== undefined && args.chunks_per_source !== null)) {
                        searchParams.chunksPerSource = args.chunks_per_source;
                    }
                    if (searchParams.topic === "news" && (args.days !== undefined && args.days !== null)) {
                        searchParams.days = args.days;
                    }
                    if (args.time_range) {
                        searchParams.timeRange = args.time_range;
                    }

                    console.error("Tavily Search API Parameters:", JSON.stringify(searchParams, null, 2));
                    // Set search timeout for faster response
                    const searchTimeout = args.search_timeout ?? 60; // Default 60 seconds
                    console.error(`Starting search with timeout: ${searchTimeout}s`);
                    const startSearchTime = Date.now();
                    
                    // Execute search with timeout
                    let searchResponse: any; // Use any to avoid unknown type errors
                    try {
                        searchResponse = await Promise.race([
                            this.tavilyClient.search(searchParams.query, {
                                searchDepth: searchParams.searchDepth,
                                topic: searchParams.topic,
                                maxResults: searchParams.maxResults,
                                chunksPerSource: searchParams.chunksPerSource,
                                includeImages: searchParams.includeImages,
                                includeImageDescriptions: searchParams.includeImageDescriptions,
                                // Convert string types to boolean for includeAnswer
                                includeAnswer: typeof searchParams.includeAnswer === 'boolean' ? 
                                    searchParams.includeAnswer : false,
                                includeRawContent: searchParams.includeRawContent,
                                includeDomains: searchParams.includeDomains,
                                excludeDomains: searchParams.excludeDomains,
                                // Fix timeRange to match allowed values
                                timeRange: (searchParams.timeRange as "year" | "month" | "week" | "day" | "y" | "m" | "w" | "d" | undefined),
                                days: searchParams.days
                            }),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error(`Search timeout after ${searchTimeout}s`)), searchTimeout * 1000)
                            )
                        ]);
                        console.error(`Search completed in ${((Date.now() - startSearchTime) / 1000).toFixed(1)}s`);
                    } catch (error: any) {
                        console.error(`Search error: ${error.message}`);
                        throw error;
                    }

                    const combinedResults: CombinedResult[] = [];
                    let searchRank = 1;

                    if (!searchResponse.results || searchResponse.results.length === 0) {
                        const noResultsOutput = JSON.stringify({
                            documentation_instructions: finalDocumentationPrompt,
                            original_query: args.query,
                            search_summary: searchResponse.answer || `No search results found for query: "${args.query}".`,
                            research_data: [],
                        }, null, 2);
                        return {
                            content: [{ type: "text", text: noResultsOutput }]
                        };
                    }

                    for (const searchResult of searchResponse.results) {
                        if (!searchResult.url) {
                            console.warn(`Search result "${searchResult.title}" missing URL, skipping crawl.`);
                            continue;
                        }

                        // Ensure crawl parameters are strictly enforced with smaller defaults
                        const crawlParams: TavilyCrawlParams = {
                            url: searchResult.url,
                            maxDepth: Math.min(2, args.crawl_max_depth ?? 1), // Hard cap at 2, default to 1
                            maxBreadth: Math.min(10, args.crawl_max_breadth ?? 10), // Hard cap at 10, default to 10 (down from 20)
                            limit: Math.min(20, args.crawl_limit ?? 10), // Hard cap at 20, default to 10 (down from 50)
                            instructions: args.crawl_instructions || "",
                            selectPaths: args.crawl_select_paths ?? [],
                            selectDomains: args.crawl_select_domains ?? [],
                            excludePaths: args.crawl_exclude_paths ?? [],
                            excludeDomains: args.crawl_exclude_domains ?? [],
                            allowExternal: args.crawl_allow_external ?? false,
                            includeImages: args.crawl_include_images ?? false,
                            categories: (args.crawl_categories ?? []) as TavilyCrawlCategory[],
                            extractDepth: args.crawl_extract_depth ?? "basic"
                        };
                        
                        // If no select_domains provided and not allowing external domains, 
                        // restrict to the current domain to prevent excessive crawling
                        if ((!args.crawl_select_domains || args.crawl_select_domains.length === 0) && 
                            !crawlParams.allowExternal) {
                            try {
                                const currentUrlDomain = new URL(searchResult.url).hostname;
                                crawlParams.selectDomains = [`^${currentUrlDomain.replace(/\./g, "\\.")}$`];
                                console.error(`Auto-limiting crawl to domain: ${currentUrlDomain}`);
                            } catch (e: any) {
                                console.error(`Could not parse URL to limit crawl domain: ${searchResult.url}. Error: ${e.message}`);
                            }
                        }

                        console.error(`Crawling ${searchResult.url} with maxDepth=${crawlParams.maxDepth}, maxBreadth=${crawlParams.maxBreadth}, limit=${crawlParams.limit}`);
                        
                        // Add memory usage tracking
                        if (process.memoryUsage) {
                            const memUsage = process.memoryUsage();
                            console.error(`Memory usage before crawl: RSS=${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap=${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
                        }

                        console.error(`Crawling URL: ${searchResult.url} with params:`, JSON.stringify(crawlParams, null, 2));
                        const currentCombinedResult: CombinedResult = {
                            search_rank: searchRank++,
                            original_url: searchResult.url,
                            title: searchResult.title,
                            initial_content_snippet: searchResult.content,
                            search_score: searchResult.score,
                            published_date: searchResult.publishedDate,
                            crawled_data: [],
                            crawl_errors: [],
                        };

                        try {
                            const startCrawlTime = Date.now();
                            const crawlTimeout = args.crawl_timeout ?? 180; // Default 3 minutes
                            console.error(`Starting crawl with timeout: ${crawlTimeout}s`);
                            
                            // Progress tracking for the crawl
                            let progressTimer = setInterval(() => {
                                const elapsedSec = (Date.now() - startCrawlTime) / 1000;
                                console.error(`Crawl in progress... (${elapsedSec.toFixed(0)}s elapsed)`);
                            }, 15000); // Report every 15 seconds
                            
                            // Ensure timer is always cleared
                            let crawlResponse: any; // Use any to avoid unknown type errors
                            try {
                                // Execute crawl with timeout
                                crawlResponse = await Promise.race([
                                    this.tavilyClient.crawl(crawlParams.url, {
                                        // Ensure all parameters have non-undefined values to match API requirements
                                        maxDepth: crawlParams.maxDepth ?? 1,
                                        maxBreadth: crawlParams.maxBreadth ?? 10,
                                        limit: crawlParams.limit ?? 10,
                                        instructions: crawlParams.instructions ?? "",
                                        selectPaths: crawlParams.selectPaths ?? [],
                                        selectDomains: crawlParams.selectDomains ?? [],
                                        excludePaths: crawlParams.excludePaths ?? [],
                                        excludeDomains: crawlParams.excludeDomains ?? [],
                                        allowExternal: crawlParams.allowExternal ?? false,
                                        includeImages: crawlParams.includeImages ?? false,
                                        // Cast categories to the proper type
                                        categories: (crawlParams.categories ?? []) as TavilyCrawlCategory[],
                                        extractDepth: crawlParams.extractDepth ?? "basic",
                                        // Add the required timeout parameter
                                        timeout: args.crawl_timeout ?? 180
                                    }),
                                    new Promise((_, reject) => 
                                        setTimeout(() => reject(new Error(`Crawl timeout after ${crawlTimeout}s`)), crawlTimeout * 1000)
                                    )
                                ]);
                            } catch (err) {
                                clearInterval(progressTimer); // Clear timer on error
                                throw err; // Re-throw to be caught by outer try/catch
                            }
                            
                            // Clear the progress timer once the crawl is complete
                            clearInterval(progressTimer);
                            
                            console.error(`Crawl completed in ${((Date.now() - startCrawlTime) / 1000).toFixed(1)}s`);

                            if (crawlResponse.results && crawlResponse.results.length > 0) {
                                crawlResponse.results.forEach((page: any) => {
                                    currentCombinedResult.crawled_data.push({
                                        url: page.url,
                                        raw_content: page.rawContent || null,
                                        images: page.images || [],
                                    });
                                });
                            } else {
                                currentCombinedResult.crawl_errors.push(`No content pages returned from crawl of ${searchResult.url}.`);
                            }

                            // After crawl completes, log memory usage
                            if (process.memoryUsage) {
                                const memUsage = process.memoryUsage();
                                console.error(`Memory usage after crawl: RSS=${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap=${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
                                
                                // Force garbage collection if available and memory usage is high
                                if (memUsage.heapUsed > 500 * 1024 * 1024 && global.gc) {
                                    console.error("Memory usage high, forcing garbage collection");
                                    try {
                                        global.gc();
                                    } catch (e) {
                                        console.error("Failed to force garbage collection", e);
                                    }
                                }
                            }
                        } catch (crawlError: any) {
                            const errorMessage = crawlError.response?.data?.error || crawlError.message || 'Unknown crawl error';
                            console.error(`Error crawling ${searchResult.url}:`, errorMessage, crawlError.stack);
                            currentCombinedResult.crawl_errors.push(
                                `Failed to crawl ${searchResult.url}: ${errorMessage}`
                            );
                        }
                        combinedResults.push(currentCombinedResult);
                    }

                    const outputText = JSON.stringify({
                        documentation_instructions: finalDocumentationPrompt,
                        original_query: args.query,
                        search_summary: searchResponse.answer || null,
                        research_data: combinedResults,
                        output_path: finalOutputPath,
                    }, null, 2);

                    return {
                        content: [{ type: "text", text: outputText }]
                    };

                } catch (error: any) {
                    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred in deep-research-tool.';
                    console.error("[DeepResearchTool Error]", errorMessage, error.stack);
                    
                    const errorOutput = JSON.stringify({
                        documentation_instructions: finalDocumentationPrompt,
                        error: errorMessage,
                        original_query: args.query,
                        output_path: finalOutputPath,
                    }, null, 2);

                    return {
                        content: [{ type: "text", text: errorOutput }],
                        isError: true
                    };
                }
            }
        );
    }

    public async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        
        // Check if we should try to enable hardware acceleration
        const useHardwareAcceleration = process.env.HARDWARE_ACCELERATION === 'true';
        if (useHardwareAcceleration) {
            console.error("Attempting to enable hardware acceleration");
            try {
                // Try to enable Node.js flags for GPU
                process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '';
                if (!process.env.NODE_OPTIONS.includes('--enable-webgpu')) {
                    process.env.NODE_OPTIONS += ' --enable-webgpu';
                }
            } catch (err) {
                console.error("Failed to set hardware acceleration:", err);
            }
        }
        
        console.error(
            "Deep Research MCP Server (deep-research-mcp) is running and connected via stdio.\n" +
            `Documentation prompt source: ` +
            (process.env.npm_config_documentation_prompt || ENV_DOCUMENTATION_PROMPT ? `Environment Variable ('DOCUMENTATION_PROMPT')` : `Default (can be overridden by tool argument)`) +
            `.\n` +
            `Output path: ` +
            (process.env.RESEARCH_OUTPUT_PATH ? `Environment Variable ('RESEARCH_OUTPUT_PATH')` : `Default timestamped path (can be overridden by tool argument)`) +
            `.\n` +
            "Awaiting requests..."
        );
    }
}

// Main execution block for running the server directly
if (require.main === module || (typeof module !== 'undefined' && !module.parent)) {
    const deepResearchServer = new DeepResearchMcpServer();
    deepResearchServer
        .run()
        .catch((err) => {
            console.error("Failed to start or run Deep Research MCP Server:", err.stack || err);
            process.exit(1);
        });
}

export { DeepResearchMcpServer }; // Export for potential programmatic use