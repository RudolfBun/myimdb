import { Category } from './movie';

export interface SearchResult {
  year?: string;
  category?: Category;
  title?: string;
}
