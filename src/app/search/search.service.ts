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

    return merge(...[mainSearch$, extraSearch$]).pipe(
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
    return this.extraSearchSources$.pipe(
      switchMap(sources => from(sources)),
      mergeMap(source =>
        this.searchApiService.makeSearchFromExtraSource$(query, source)
      )
    );
  }
}
