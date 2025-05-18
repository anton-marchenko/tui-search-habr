export interface ExtraSearchServiceDto {
  id: number;
  name: string;
  priority: number;
  delay: number; // MOCK
}

interface SearchItemDto {
  title: string;
  subtitle?: string;
  href: string;
  icon?: string;
}

export interface SearchItemResult {
  loading?: boolean;
  data?: SearchItemDto;
}

export type SearchResult = Record<string, readonly SearchItemResult[]>;

export type SearchResultState =
  | { status: 'ok'; data: SearchResult | null }
  | { status: 'error' }
  | null;
