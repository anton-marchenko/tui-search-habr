import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-search-message',
  templateUrl: './search-message.component.html',
  styleUrl: './search-message.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchMessageComponent {}
