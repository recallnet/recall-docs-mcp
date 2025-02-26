import { z } from 'zod';

export interface Document {
  id: string;
  title: string;
  content: string;
  url: string;
  tags?: string[];
}

export interface SearchResult {
  document: Document;
  relevanceScore: number;
}

// Define as a plain object with Zod schemas
export const SearchQuerySchema = {
  query: z.string(),
  limit: z.number().optional().default(5)
};

export const GetDocumentSchema = {
  id: z.string()
};