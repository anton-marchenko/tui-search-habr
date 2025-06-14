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
        // иммитируем бековую фильтрацию
        // потому что json-server не умеет по вложенным объектам фильровать
        map(result => this.filter(query, result)),
        // При старте основного поиска рисуем скелетоны
        // для секций постов и статей
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
        // добавим результат в секцию по ее имени
        map(value => ({
          [source.sectionName]: value.map(data => ({ data })),
        })),
        // отрисуем скелетон
        startWith<SearchResult>({
          [source.sectionName]: [{ loading: true }],
        }),
        // скроем секцию в случае ошибки
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
        // Отменим слишком долгий запрос (дольше 900мс)
        timeout(900),
        // сразу отсортируем порядок секций
        map(items => items.sort((a, b) => a.priority - b.priority)),
        // отключим вообще внешние поиски в случае ошибки
        catchError(() => of<ExtraSearchSourceDto[]>([]))
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
