import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
 @Output() companySearch = new EventEmitter<string>();

  onCompanySearch(companyName: string) {
    this.companySearch.emit(companyName);
  }
}
