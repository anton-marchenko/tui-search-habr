import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiSkeleton } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { SearchItemResult } from '../search.model';

@Component({
  selector: 'app-search-item',
  imports: [TuiAvatar, TuiCell, TuiTitle, TuiSkeleton],
  templateUrl: './search-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchItemComponent {
  @Input({ required: true }) public item!: SearchItemResult;
}
