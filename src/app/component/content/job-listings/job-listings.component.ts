import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { Job } from '../../../core/interfaces/data';
import { CommonModule } from '@angular/common';
import { FirstWordPipe } from '../../../shared/pipes/first-word-pipe.pipe';
import { JobStore } from '../../../core/stores/job/job.store';

@Component({
  selector: 'app-job-listings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-listings.component.html',
  styleUrl: './job-listings.component.css'
})
export class JobListingsComponent {
  // Inputs - updated to use displayJobs from the store
  jobs = input.required<Job[]>();
  displayJobs = input.required<Job[]>(); // New input for jobs to display (filtered or regular)
  isLoading = input.required<boolean>();
  currentPage = input.required<number>();
  itemsPerPage = input.required<number>();
  totalItems = input.required<number>();
  isFiltering = input.required<boolean>(); // New input to know if we're filtering

  // Output for pagination events
  @Output() pageChange = new EventEmitter<number>();

  // Inject the JobStore for modal functionality
  jobStore = inject(JobStore);

  // Computed properties
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  paginatedJobs = computed(() => this.displayJobs()); // Use displayJobs instead of filteredJobs
  showingStart = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  showingEnd = computed(() => Math.min(
    this.currentPage() * this.itemsPerPage(),
    this.totalItems()
  ));

  // Generate page numbers for display
  pages = computed<(number | string)[]>(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const range = 2;
    const pages: (number | string)[] = [];
    
    if (current > range + 1) {
      pages.push(1);
      if (current > range + 2) pages.push('...');
    }

    for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
      pages.push(i);
    }

    if (current < total - range) {
      if (current < total - range - 1) pages.push('...');
      pages.push(total);
    }

    return pages;
  });

  getExperienceLevelDisplayText(years: number | undefined): string {
    const yearsValue = years ?? 0;
    if (yearsValue === 0) return 'Entry Level';
    if (yearsValue === 1) return 'Mid Level';
    if (yearsValue === 2 || yearsValue === 3) return 'Senior Level';
    return 'Executive';
  }

  navigateToPage(page: number | string) {
    if (typeof page === 'number') {
      this.pageChange.emit(page);
    }
  }

  openJobModal(job: Job) {
    this.jobStore.openJobModal(job);
  }

  trackByPage(index: number, page: number | string): string {
    return typeof page === 'number' ? page.toString() : `${index}-ellipsis`;
  }
}