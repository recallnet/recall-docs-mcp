#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebDocScraper } from "./web-scraper.js";
import { SearchQuerySchema, GetDocumentSchema } from "./types.js";
import 'dotenv/config';

// Create an MCP server instance
const server = new McpServer({
  name: "web-docs-mcp",
  version: "1.0.0"
});

// URL to documentation site
const docsUrl = process.env.DOCS_URL || 'https://docs.recall.network/';
const maxPages = parseInt(process.env.MAX_PAGES || '50');
const scraper = new WebDocScraper(docsUrl, maxPages);

// Initialize document scraper
console.error(`Initializing Web Doc Scraper for ${docsUrl}`);
(async () => {
  await scraper.scrapeWebsite();
})();

// Register the search tool
server.tool(
  "search_docs",
  "Search through documentation",
  SearchQuerySchema,
  async (params) => {
    try {
      const { query, limit } = params;
      const results = scraper.search(query, limit);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              query,
              resultCount: results.length,
              results: results.map(r => ({
                title: r.document.title,
                id: r.document.id,
                url: r.document.url,
                preview: r.document.content.substring(0, 150) + "...",
                relevance: r.relevanceScore
              }))
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error in search_docs:', error);
      throw error;
    }
  }
);

// Register a tool to get full document content
server.tool(
  "get_document",
  "Get the full content of a specific document",
  GetDocumentSchema,
  async (params) => {
    try {
      const document = scraper.getDocument(params.id);
      
      if (!document) {
        return {
          content: [
            {
              type: "text",
              text: `Document with ID "${params.id}" not found.`,
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              title: document.title,
              url: document.url,
              content: document.content
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('Error in get_document:', error);
      throw error;
    }
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web Documentation MCP Server running on stdio");
}

main().catch(console.error);