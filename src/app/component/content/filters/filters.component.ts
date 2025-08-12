import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filters',
  standalone: true,
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  @Output() filterChange = new EventEmitter<{
    title: string;
    location: string;
    experienceLevel: string;
  }>();

  currentFilters = {
    title: '',
    location: '',
    experienceLevel: ''
  };
  

  onInputChange(field: keyof typeof this.currentFilters, value: string) {
    this.currentFilters[field] = value;
    this.emitFilters();
  }

  clearFilter(field: keyof typeof this.currentFilters) {
    this.currentFilters[field] = '';
    this.emitFilters();
  }

  private emitFilters() {
    this.filterChange.emit({ ...this.currentFilters });
  }
}