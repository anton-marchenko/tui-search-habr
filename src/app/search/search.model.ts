export interface ExtraSearchSourceDto {
  sourceId: string;
  sectionName: string;
  priority: number;
}

export interface SearchItemDto {
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
  | { status: 'ready'; data: SearchResult | null }
  | { status: 'error' } // Ошибка основного поиска
  | { status: 'pendingTyping' } // Ожидание ввода пользователем поискового запроса
  | { status: 'tooShortQuery' }; // Введен слишком короткий поисковый запрос
