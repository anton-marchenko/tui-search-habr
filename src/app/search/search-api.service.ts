import { inject, Injectable } from '@angular/core';
import {
  ExtraSearchSourceDto,
  SearchResult,
  SearchItemDto,
} from './search.model';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { catchError, map, of, startWith, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';

type MainSearchResultDto = Record<string, readonly SearchItemDto[]>;

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  private readonly baseUrl =
    'https://my-json-server.typicode.com/anton-marchenko/tui-search-jsons';
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
        startWith<SearchResult>({
          Posts: [{ loading: true }],
          Articles: [{ loading: true }],
        })
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
          [source.sectionName]: [{ loading: true }],
        }),
        catchError(() => {
          return of<SearchResult>({
            [source.sectionName]: [],
          });
        })
      );
  }

  public getExtraSearchSources$() {
    return this.http
      .get<ExtraSearchSourceDto[]>(`${this.baseUrl}/extra-search-sources`)
      .pipe(
        timeout(900), // Отменит запрос если он дольше 900мс
        map(items => items.sort((a, b) => a.priority - b.priority)), // сразу отсортируем как будут в выдаче выводиться секции
        catchError(() => of<ExtraSearchSourceDto[]>([])) // отключит все внешние поиски в случае ошибки
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
