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
import { debounceTime, Observable, of, startWith, switchMap } from 'rxjs';
import { SearchItemComponent } from './search-item/search-item.component';
import { SearchResultState } from './search.model';
import { SearchService } from './search.service';
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
    SearchMessageComponent,
  ],
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  private readonly searchService = inject(SearchService);

  protected readonly popular = ['Ant', 'Taiga', 'Git'];

  protected readonly control = new FormControl('');

  protected readonly resultState$: Observable<SearchResultState> =
    this.control.valueChanges.pipe(
      debounceTime(200),
      /**
       * Хотим обработать состояние неактивного поиска
       * в момент когда ставим курсор в поисковую строку.
       * При этом может быть два разных сценария:
       *
       * 1) в поисковой строке пусто
       * 2) в поисковой строке уже есть значение от предыдущих поисков
       */
      startWith(''),
      switchMap(query => {
        const state = {
          pendingTyping: {
            status: 'pendingTyping',
          },
          /**
           * Так работает компонент tui-search-results.
           * Если поле ввода пустое, а в results передать data: null
           * то отобразится блок с популярными и историей.
           */
          historyAndPopular: { status: 'ready', data: null },
          tooShortQuery: { status: 'tooShortQuery' },
        } as const;

        if (!query && this.control.value) {
          /**
           * Для не пустой поисковой строки:
           * покажем сообщение о том что нужно продолжить печатать запрос.
           *
           * Сработает при сценарии:
           * - что-то вбили в поиск,
           * - ушли из поисковой строки
           * - и снова вернулись в нее
           */
          return of(state.pendingTyping);
        }

        if (!query) {
          /**
           * Для пустой поисковой строки:
           * покажем блок популярных запросов и истории поиска
           */
          return of(state.historyAndPopular);
        }

        if (query.length < 3) {
          /**
           * Покажем сообщение о том что слишком короткий поисковый запрос
           */
          return of(state.tooShortQuery);
        }

        return this.searchService.makeSearch$(query);
      })
    );

  protected open = false;

  ngOnInit(): void {
    /**
     * Запросим источники внешнего поиска заранее,
     * чтобы когда мы начали вводить свой первый поисковый запрос
     * источники уже были подгружены
     */
    this.searchService.loadExtraSearchSources();
  }
}
