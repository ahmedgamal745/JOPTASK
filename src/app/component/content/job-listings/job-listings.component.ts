import { Component, computed, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { Job } from '../../../core/interfaces/data';
import { CommonModule } from '@angular/common';
import { FirstWordPipe } from '../../../shared/pipes/first-word-pipe.pipe';
import { JobStore } from '../../../core/stores/job/job.store';

@Component({
  selector: 'app-job-listings',
  standalone: true,
  imports: [CommonModule, FirstWordPipe],
  templateUrl: './job-listings.component.html',
  styleUrl: './job-listings.component.css'
})
export class JobListingsComponent {
  // Inputs converted to required signals
  jobs = input.required<Job[]>();
  filteredJobs = input.required<Job[]>();
  isLoading = input.required<boolean>();
  currentPage = input.required<number>();
  itemsPerPage = input.required<number>();
  totalItems = input.required<number>();

  // Output for pagination events
  @Output() pageChange = new EventEmitter<number>();

  // Inject the JobStore for modal functionality
  jobStore = inject(JobStore);

  // Computed properties
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));
  paginatedJobs = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredJobs().slice(start, start + this.itemsPerPage());
  });
  showingStart = computed(() => (this.currentPage() - 1) * this.itemsPerPage() + 1);
  showingEnd = computed(() => Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  getExperienceLevelDisplayText(years: number | undefined): string {
    const yearsValue = years ?? 0; // Handle undefined case
    if (yearsValue === 0) return 'Entry Level';
    if (yearsValue === 1) return 'Mid Level';
    if (yearsValue === 2 || yearsValue === 3) return 'Senior Level';
    return 'Executive';
  }

  openJobModal(job: Job) {
    this.jobStore.openJobModal(job);
  }
}
