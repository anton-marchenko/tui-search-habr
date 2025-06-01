import { AsyncPipe, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiSearchResults } from '@taiga-ui/experimental';
import { TuiInputSearch, TuiNavigation } from '@taiga-ui/layout';
import {
  debounceTime,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { SearchItemComponent } from './search-item/search-item.component';
import { SearchResultState } from './search.model';
import { SearchService } from './search.service';
import {
  EXTRA_SEARCH_SOURCES,
  EXTRA_SEARCH_SOURCES_PROVIDER,
} from './search-sources.provider';
import { SearchMessageComponent } from './search-message/search-message.component';

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [
    AsyncPipe,
    JsonPipe,
    ReactiveFormsModule,
    TuiInputSearch,
    TuiNavigation,
    TuiSearchResults,
    TuiTextfield,
    SearchItemComponent,
    SearchMessageComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EXTRA_SEARCH_SOURCES_PROVIDER, SearchService],
})
export class SearchComponent implements OnInit {
  private readonly searchService = inject(SearchService);
  private readonly extraSearchSources$ = inject(EXTRA_SEARCH_SOURCES);

  protected readonly popular = ['Ant', 'Taiga', 'Git'];

  protected readonly control = new FormControl('');

  private readonly minQueryLength = 3;

  protected readonly resultState$: Observable<SearchResultState> =
    this.control.valueChanges.pipe(
      /**
       * Хотим обработать состояние неактивного поиска
       * в момент когда ставим курсор в поисковую строку.
       * При этом может быть два разных сценария:
       *
       * 1) в поисковой строке пусто
       * 2) в поисковой строке уже есть значение от предыдущих поисков
       */
      startWith(''),
      // debounceTime(300),
      switchMap(query => {
        if (!query && this.control.value) {
          /**
           * Покажем сообщение о том что нужно продолжить печатать запрос
           * для не пустой поисковой строки
           */
          return of({
            status: 'pendingTyping',
          } as const);
        }

        if (!query) {
          /**
           * Для пустой поисковой строки
           * покажем блок популярных запросов и истории поиска
           */
          return of({ status: 'ready', data: null } as const);
        }

        if (!this.canSearchStart(query)) {
          /**
           * Покажем сообщение о том что слишком короткий поисковый запрос
           */
          return of({ status: 'tooShortQuery' } as const);
        }

        return this.searchService.makeSearch$(query);
      })
    );

  protected open = false;

  ngOnInit(): void {
    /**
     * Запросим источники внешнего поиска заранее,
     * чтобы не тратить на это время при вводе поискового запроса
     */
    this.extraSearchSources$.subscribe();
  }

  private canSearchStart(query = ''): boolean {
    return query.length >= this.minQueryLength;
  }
}
