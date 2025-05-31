import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiSearchResults } from '@taiga-ui/experimental';
import { TuiInputSearch, TuiNavigation } from '@taiga-ui/layout';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { SearchItemComponent } from '../search-item/search-item.component';
import { SearchResultState } from '../search.model';
import { SearchService } from './search.service';

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TuiInputSearch,
    TuiNavigation,
    TuiSearchResults,
    TuiTextfield,
    SearchItemComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private searchService = inject(SearchService);

  protected readonly popular = ['Ant', 'Taiga', 'Git'];

  protected readonly control = new FormControl('');

  protected readonly canShowSearchResults$: Observable<boolean> =
    this.control.valueChanges.pipe(
      startWith(''),
      map(query => {
        if (!query) {
          return true;
        }

        return query.length > this.searchService.minQueryLength;
      })
    );

  protected readonly resultState$: Observable<SearchResultState> =
    this.control.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        if (!query) {
          return of(null);
        }

        return this.searchService.makeSearch$(query);
      })
    );

  protected open = false;
}
