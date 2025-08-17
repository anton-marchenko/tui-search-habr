import { inject, Injectable } from '@angular/core';
import { from, merge, Observable, of } from 'rxjs';
import { SearchApiService } from './search-api.service';
import {
  catchError,
  mergeMap,
  scan,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { SearchResult, SearchResultState } from './search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly searchApiService = inject(SearchApiService);
  private readonly extraSearchSources$ = this.searchApiService
    .getExtraSearchSources$()
    .pipe(shareReplay(1));

  public makeSearch$(query: string): Observable<SearchResultState> {
    const mainSearch$ = this.searchApiService.makeMainSearch$(query);
    const extraSearch$ = this.makeExtraSearch$(query);

    const initialValue: SearchResult = {};

    // смержим потоки данных основного и внешних поисков
    return merge(mainSearch$, extraSearch$).pipe(
      // соберем данные в единый объект - результат поисковой выдачи
      scan(
        (acc, curr) => ({
          ...acc,
          data: {
            ...acc.data,
            ...curr,
          },
        }),
        {
          status: 'ready',
          data: initialValue,
        } as const
      ),
      // обработаем сценарий ошибки основного поиска
      catchError(() =>
        of({
          status: 'error',
        } as const)
      )
    );
  }

  public loadExtraSearchSources(): void {
    this.extraSearchSources$.subscribe();
  }

  private makeExtraSearch$(query: string) {
    const initialValue: SearchResult = {};

    return this.getExtraSearchResults$(query).pipe(
      // из нескольких потоков
      // соберем результаты в единый объект
      scan(
        (acc, curr) => ({
          ...acc,
          ...curr,
        }),
        initialValue
      )
    );
  }

  private getExtraSearchResults$(query: string) {
    // берем конфиг внешних поисков
    return this.extraSearchSources$.pipe(
      // формируем пачку запросов на бек
      switchMap(sources => from(sources)),
      // отправим пачку запросов параллельно
      mergeMap(source =>
        this.searchApiService.makeSearchFromExtraSource$(query, source)
      )
    );
  }
}
