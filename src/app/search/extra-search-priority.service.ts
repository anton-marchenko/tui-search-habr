import { inject, Injectable } from '@angular/core';
import { catchError, map, of, ReplaySubject, timeout } from 'rxjs';
import { ExtraSearchServiceDto } from '../search.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExtraSearchPriorityService {
  private readonly baseUrl =
    'https://my-json-server.typicode.com/anton-marchenko/tui-search-jsons';
  private readonly http = inject(HttpClient);
  private cached = false;

  private readonly sourceSub = new ReplaySubject<ExtraSearchServiceDto[]>(1);
  public readonly extraSearchServices$ = this.sourceSub.asObservable();

  loadDataOnce() {
    if (this.cached) {
      return;
    }

    this.cached = true;

    this.fetchData$().subscribe({
      next: data => this.sourceSub.next(data),
    });
  }

  private fetchData$() {
    return this.http
      .get<ExtraSearchServiceDto[]>(`${this.baseUrl}/extra-search-sources`)
      .pipe(
        timeout(900), // Отменит запрос если он дольше 900мс
        map(items => items.sort((a, b) => a.priority - b.priority)),
        catchError(() => of<ExtraSearchServiceDto[]>([])) // отключит extra-search
      );
  }
}
