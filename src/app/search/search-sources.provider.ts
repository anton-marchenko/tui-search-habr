import { inject, InjectionToken, Provider } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, timeout } from 'rxjs';
import { ExtraSearchSourceDto } from './search.model';
import { API_BASE_URL } from './search.constants';
import { HttpClient } from '@angular/common/http';

export const EXTRA_SEARCH_SOURCES = new InjectionToken<
  Observable<ExtraSearchSourceDto[]>
>('Extra search sources');

export const EXTRA_SEARCH_SOURCES_PROVIDER: Provider = {
  provide: EXTRA_SEARCH_SOURCES,
  useFactory: extraSearchSourcesFactory,
};

function extraSearchSourcesFactory(): Observable<ExtraSearchSourceDto[]> {
  const http = inject(HttpClient);

  return http
    .get<ExtraSearchSourceDto[]>(`${API_BASE_URL}/extra-search-sources`)
    .pipe(
      timeout(900), // Отменит запрос если он дольше 900мс
      map(items => items.sort((a, b) => a.priority - b.priority)),
      catchError(() => of<ExtraSearchSourceDto[]>([])), // отключит extra-search
      shareReplay({
        bufferSize: 1,
        refCount: true,
      })
    );
}
