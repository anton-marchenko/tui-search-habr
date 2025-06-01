import { inject, Injectable } from '@angular/core';
import {
  ExtraSearchSourceDto,
  SearchItemResult,
  SearchResult,
  SearchItemDto,
} from './search.model';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { catchError, map, of, startWith } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './search.constants';

type MainSearchResultDto = Record<string, readonly SearchItemDto[]>;

const LOADING_ITEM: SearchItemResult = {
  loading: true,
  data: {
    title: 'xxxxxxxxxxxx',
    href: '',
  },
};

const MAIN_SEARCH_LOADING_STATE: SearchResult = {
  Posts: [LOADING_ITEM],
  Articles: [LOADING_ITEM],
};

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private readonly baseUrl = API_BASE_URL;
  private readonly http = inject(HttpClient);

  makeMainSearch$(query: string) {
    return this.http
      .get<MainSearchResultDto>(`${this.baseUrl}/main-search?q=${query}`)
      .pipe(
        map(result =>
          Object.entries(result).reduce(
            (acc, [key, data]) => ({
              ...acc,
              [key]: data.map(item => ({ data: item })),
            }),
            {} as SearchResult
          )
        ),
        map(result => this.filter(query, result)), // search immitation (because json-server can only filter arrays, not objects)
        startWith<SearchResult>(MAIN_SEARCH_LOADING_STATE)
      );
  }

  public makeSearchFromExtraSource$(
    query: string,
    source: ExtraSearchSourceDto
  ) {
    return this.http
      .get<
        SearchItemDto[]
      >(`${this.baseUrl}/extra-search__${source.sourceId}?q=${query}`)
      .pipe(
        map(value => ({
          [source.sectionName]: value.map(data => ({ data })),
        })),
        startWith<SearchResult>({
          [source.sectionName]: [LOADING_ITEM],
        }),
        catchError(() => {
          return of<SearchResult>({
            [source.sectionName]: [],
          });
        })
      );
  }

  private filter(query: string, data: SearchResult): SearchResult {
    return Object.entries(data).reduce(
      (result, [key, value]) => ({
        ...result,
        [key]: value.filter(item => {
          if (!item.data) {
            return false;
          }

          const { title, href, subtitle = '' } = item.data;
          return TUI_DEFAULT_MATCHER(title + href + subtitle, query);
        }),
      }),
      {}
    );
  }
}
