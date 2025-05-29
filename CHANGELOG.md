# Changelog

All notable changes to the Deep Research MCP Server will be documented in this file.

## [1.2.1] - 2025-05-29

### Added
- Environment variable support for timeout and performance configuration
- `SEARCH_TIMEOUT` environment variable for configuring search request timeouts
- `CRAWL_TIMEOUT` environment variable for configuring crawl request timeouts
- `MAX_SEARCH_RESULTS` environment variable for setting maximum search results
- `CRAWL_MAX_DEPTH` environment variable for setting maximum crawl depth
- `CRAWL_LIMIT` environment variable for setting maximum URLs to crawl per source
- **NEW: File Writing Tool** - `write-research-file` tool for saving research content to files
- `FILE_WRITE_ENABLED` environment variable to enable/disable file writing (default: disabled)
- `ALLOWED_WRITE_PATHS` environment variable for directory restrictions (default: user home)
- `FILE_WRITE_LINE_LIMIT` environment variable for write operation limits (default: 200 lines)
- Secure file writing with path validation, directory creation, and permission controls
- Enhanced startup logging showing current timeout, limit, and file writing configurations
- Updated example configuration with new environment variables

### Fixed
- Timeout configuration now properly respects environment variables in addition to tool parameters
- LibreChat timeout issues can now be resolved by setting appropriate environment variables

### Changed
- Tool parameter precedence: tool arguments > environment variables > defaults
- Improved documentation with detailed timeout, performance, and file writing configuration guides
- Added comprehensive security documentation for file writing feature

### Security
- File writing feature disabled by default for security
- Directory-based access controls for file operations
- Path validation and sanitization to prevent directory traversal
- Configurable line limits to prevent abuse

## [1.2.0] - 2024-05-29

### Fixed
- Fixed issue with console logging interfering with MCP protocol by replacing all `console.log` and `console.debug` calls with `console.error`
- Fixed proper response structure to match MCP specifications, removing the extra `tools` wrapper from responses
- Fixed type errors in Tavily SDK parameters, ensuring correct typing for `includeAnswer` and `timeRange`
- Fixed parameter handling for crawl API, ensuring required parameters are always provided

### Added
- Added progress tracking during long-running operations
- Added memory usage tracking and optimization
- Added hardware acceleration option with `hardware_acceleration` parameter
- Added proper domain validation to prevent excessive crawling
- Added timeout handling for both search and crawl operations

### Changed
- Reduced default crawl limits for better performance:
  - Maximum depth reduced to 2 (from unlimited)
  - Default breadth reduced to 10 (from 20)
  - Default limit reduced to 10 URLs (from 50)
- Improved error handling and reporting
- Updated documentation to reflect parameter changes

## [1.1.0] - 2024-05-01

### Added
- Initial public release
- Integration with Tavily Search and Crawl APIs
- MCP compliant tool interface
- Structured JSON output for LLM consumption
- Configurable documentation prompt
- Configurable output path