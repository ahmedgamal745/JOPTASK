import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
 @Output() filterChange = new EventEmitter<{title: string, location: string, experienceLevel: string}>();
  @ViewChild('jobTitleInput') jobTitleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('locationInput') locationInput?: ElementRef<HTMLInputElement>;
  
  selectedExperienceLevel: string = '';

  onExperienceLevelChange(level: string) {
    this.selectedExperienceLevel = level;
    this.emitFilters();
  }

  emitFilters() {
    this.filterChange.emit({
      title: this.jobTitleInput?.nativeElement.value || '',
      location: this.locationInput?.nativeElement.value || '',
      experienceLevel: this.selectedExperienceLevel
    });
  }
}
