import { inject, Injectable } from '@angular/core';
import { ExtraSearchServiceDto, SearchItemResult, SearchResult } from '../search.model';
import { EXTRA_SEARCH_DATA, MAIN_SEARCH_DATA } from './mock-data';
import { TUI_DEFAULT_MATCHER } from '@taiga-ui/cdk';
import { catchError, delay, map, of, startWith } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  private readonly http = inject(HttpClient);

  makeMainSearch$(query: string) {
    const q1 = of(query).pipe(
      delay(3000),
      map(value => this.filter(value, MAIN_SEARCH_DATA)),
      // map((x) => {
      //   throw new Error('xxx');

      //   return x;
      // }),
      startWith<SearchResult>(MAIN_SEARCH_LOADING_STATE)
    );

    return q1;
  }

  public makeSearchFromExtraService$(
    query: string,
    source: ExtraSearchServiceDto
  ) {
    const result$ = of(query).pipe(
      delay(source.delay),
      map(value => {
        if (source.id === 22) {
          throw new Error('xxx');
        }

        return this.filter(value, {
          [source.name]: EXTRA_SEARCH_DATA[source.name],
        });
      }),
      startWith<SearchResult>({
        [source.name]: [LOADING_ITEM],
      }),
      catchError(() => {
        return of<SearchResult>({
          [source.name]: [],
        });
      })
    );

    return result$;
  }

  private filter(
    query: string,
    data: SearchResult
  ): SearchResult {
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
