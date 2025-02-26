import * as cheerio from 'cheerio';
import axios from 'axios';
import { Document, SearchResult } from './types';

export class WebDocScraper {
  private baseUrl: string;
  private documents: Document[] = [];
  private scrapedUrls = new Set<string>();
  private maxPages: number;

  constructor(baseUrl: string, maxPages: number = 100) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    this.maxPages = maxPages;
  }

  async scrapeWebsite(): Promise<void> {
    console.error(`Starting to scrape ${this.baseUrl}`);
    try {
      await this.scrapeUrl(this.baseUrl);
      console.error(`Completed scraping. Indexed ${this.documents.length} pages.`);
    } catch (error) {
      console.error('Error scraping website:', error);
    }
  }

  private async scrapeUrl(url: string, depth: number = 0): Promise<void> {
    if (
      this.scrapedUrls.has(url) || 
      this.documents.length >= this.maxPages ||
      depth > 3 || // Limit recursion depth
      !url.startsWith(this.baseUrl) // Only scrape URLs within the base domain
    ) {
      return;
    }

    this.scrapedUrls.add(url);
    console.error(`Scraping ${url}`);

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Extract content
      // Remove navigation, headers, footers, etc.
      $('nav, header, footer, script, style').remove();
      
      // Get the main content
      const mainContent = $('main').length ? $('main').text() : $('body').text();
      const cleanedContent = this.cleanText(mainContent);
      
      // Get the title
      const title = $('title').text() || url.split('/').pop() || '';
      
      // Create a unique ID
      const id = this.urlToId(url);
      
      // Add to documents
      this.documents.push({
        id,
        title: this.cleanText(title),
        content: cleanedContent,
        url
      });

      // Find and follow links
      const links = $('a[href]')
        .map((_, link) => {
          const href = $(link).attr('href') || '';
          if (href.startsWith('/')) {
            return new URL(href, this.baseUrl).href;
          } else if (href.startsWith(this.baseUrl)) {
            return href;
          }
          return null;
        })
        .get()
        .filter(Boolean);

      // Recursively scrape found links
      for (const link of links) {
        if (link && !this.scrapedUrls.has(link)) {
          await this.scrapeUrl(link, depth + 1);
        }
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  private urlToId(url: string): string {
    return url
      .replace(this.baseUrl, '')
      .replace(/\/$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase() || 'home';
  }

  search(query: string, limit: number = 5): SearchResult[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    let results = this.documents.map(doc => {
      // Simple relevance scoring
      const contentLower = doc.content.toLowerCase();
      const titleLower = doc.title.toLowerCase();
      
      let score = 0;
      
      // Exact phrase match is highly relevant
      if (contentLower.includes(query.toLowerCase())) {
        score += 10;
      }
      
      // Title matches are very relevant
      if (titleLower.includes(query.toLowerCase())) {
        score += 15;
      }
      
      // Individual term matches
      for (const term of queryTerms) {
        if (term.length > 2) { // Ignore short terms
          if (contentLower.includes(term)) {
            score += 3;
          }
          if (titleLower.includes(term)) {
            score += 5;
          }
          
          // Boost score for exact word matches
          const wordRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (wordRegex.test(contentLower)) {
            score += 2;
          }
          if (wordRegex.test(titleLower)) {
            score += 3;
          }
        }
      }
      
      return { document: doc, relevanceScore: score };
    });
    
    // Filter out zero-score results and sort by relevance
    results = results
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.slice(0, limit);
  }

  getDocument(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  getDocumentByUrl(url: string): Document | undefined {
    return this.documents.find(doc => doc.url === url);
  }

  getAllDocuments(): Document[] {
    return this.documents;
  }
}