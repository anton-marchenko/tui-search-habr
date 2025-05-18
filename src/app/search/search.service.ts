import { inject, Injectable } from '@angular/core';
import { from, merge, Observable, of } from 'rxjs';
import { SearchApiService } from './search-api.service';
import { catchError, mergeMap, scan, switchMap } from 'rxjs/operators';
import { SearchResult, SearchResultState } from '../search.model';
import { ExtraSearchPriorityService } from './extra-search-priority.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public readonly minQueryLength = 2;

  private readonly searchApiService = inject(SearchApiService);
  private readonly extraSearchPriorityService = inject(
    ExtraSearchPriorityService
  );

  public makeSearch$(query: string): Observable<SearchResultState> {
    if (!this.canSearchStart(query)) {
      return of(null);
    }

    const mainSearch$ = this.searchApiService.makeMainSearch$(query);
    const extraSearch$ = this.makeExtraSearch$(query);

    const initialValue: SearchResult = {};

    return merge(...[mainSearch$, extraSearch$]).pipe(
      scan(
        (acc, curr) => {
          return {
            ...acc,
            data: {
              ...acc.data,
              ...curr,
            },
          };
        },
        {
          status: 'ok',
          data: initialValue,
        } as const
      ),
      catchError(() => {
        // catch main search error
        // and hide all results
        return of({
          status: 'error',
        } as const);
      })
    );
  }

  private makeExtraSearch$(query: string) {
    const initialValue: SearchResult = {};

    return this.getExtraSearchResults$(query).pipe(
      scan((acc, curr) => {
        return {
          ...acc,
          ...curr,
        };
      }, initialValue)
    );
  }

  private getExtraSearchResults$(query: string) {
    const service$ = this.extraSearchPriorityService.extraSearchServices$;
    const concurrentLimit = 10;

    return service$.pipe(
      switchMap(services => {
        return from(services);
      }),
      mergeMap(
        service =>
          this.searchApiService.makeSearchFromExtraService$(query, service),
        concurrentLimit
      )
    );
  }

  private canSearchStart(query = ''): boolean {
    return query.length > this.minQueryLength;
  }
}
