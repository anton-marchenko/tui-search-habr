import { Injectable } from '@angular/core';
import { EXTRA_SEARCH_SERVICES } from './mock-data';
import { catchError, map, of, ReplaySubject, timeout } from 'rxjs';
import { ExtraSearchServiceDto } from '../search.model';

@Injectable({
  providedIn: 'root',
})
export class ExtraSearchPriorityService {
  private readonly searchTimeout = 500;
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
    // todo mock backend json github
    return of(EXTRA_SEARCH_SERVICES).pipe(
      timeout(this.searchTimeout), // backend SLA
      // tap(x => console.log('1=', JSON.stringify(x))),
      map(items => items.sort((a, b) => a.priority - b.priority)),
      catchError(() => of<ExtraSearchServiceDto[]>([])) // graceful degradation (extra search just will be hidden)
    );
  }
}
