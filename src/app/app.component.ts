import { TuiRoot } from '@taiga-ui/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { ExtraSearchPriorityService } from './search/extra-search-priority.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiAvatar, TuiNavigation, SearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly extraSearchPriorityService = inject(
    ExtraSearchPriorityService
  );
  title = 'search';

  ngOnInit(): void {
    this.extraSearchPriorityService.loadDataOnce();
  }
}
