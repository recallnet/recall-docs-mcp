# Recall Documentation MCP for Cursor

This Model Context Protocol (MCP) tool enables the Cursor AI assistant to search and reference external documentation websites. It automatically scrapes, indexes, and makes searchable any documentation site, creating a powerful knowledge extension for your Cursor IDE.

## Features

- 🌐 **Web Scraping**: Automatically indexes external documentation websites
- 🔍 **Smart Search**: Find relevant documentation based on natural language queries
- 🔗 **Direct References**: Get complete document content with source URLs
- 🤖 **AI Integration**: Seamlessly works with Cursor's AI assistant

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Cursor IDE](https://cursor.sh/)

## Installation

1. Clone this repository:

```bash
git clone https://github.com/recallnet/recall-docs-mcp
cd web-docs-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Configure the documentation website URL in `.env`:

```
DOCS_URL=https://docs.recall.network/
MAX_PAGES=50
```

4. Build the MCP:

```bash
npm run build
```

## Setting Up in Cursor

1. Open Cursor IDE
2. Navigate to Settings → MCP
3. Click "Add new MCP server"
4. Configure as follows:
   - **Name**: Web Documentation MCP
   - **Type**: command
   - **Command**: `node /full/path/to/web-docs-mcp/dist/index.js`
5. Click "Create" and ensure the server shows as "Enabled"

## Usage

Once installed, you can interact with your documentation in two ways:

### 1. Natural Language Queries

Simply ask the Cursor AI assistant questions about your documentation:

```
"How do I authenticate with the Recall Network API?"
"What are the available endpoints in Recall Network?"
"Explain how to set up a node in Recall Network"
```

The AI will use your MCP to search the documentation and provide relevant information.

### 2. Direct Tool Usage

You can also use the MCP tools directly:

```javascript
// Search the documentation
search_docs({
  query: "authentication",
  limit: 5
});

// Get a specific document by ID
get_document({
  id: "api-reference"
});
```

## Customization

### Supporting JavaScript-Rendered Sites

For documentation sites that use heavy client-side rendering, uncomment the Puppeteer-based scraping code in `src/web-scraper.ts` and update the dependencies.

### Adjusting Search Relevance

Modify the scoring algorithm in the `search` method of the `WebDocScraper` class to better match your specific documentation structure.

## Troubleshooting

- **MCP shows "Client closed"**: Make sure the path to your MCP script is correct and Node.js is available in your PATH.
- **No search results**: Check that scraping completed successfully by looking at the console output when starting the MCP.
- **Incomplete content**: Some sites may require additional scraping logic. Check the console logs for details.

## Limitations

- The scraper may not correctly extract content from all websites, especially those with complex JavaScript rendering.
- The search is based on simple keyword matching and doesn't understand semantic meaning.
- There's a maximum number of pages that will be indexed (configurable via MAX_PAGES).

## License

MIT

## Acknowledgements

- [Cursor IDE](https://cursor.sh/) for their excellent AI-powered development environment
- [Model Context Protocol](https://modelcontextprotocol.ai/) for enabling custom tool integration
- [Cheerio](https://cheerio.js.org/) for HTML parsing capabilities