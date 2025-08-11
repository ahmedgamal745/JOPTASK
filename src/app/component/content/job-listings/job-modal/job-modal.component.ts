import { Component, inject } from '@angular/core';
import { JobStore } from '../../../../core/stores/job/job.store';
import { CommonModule } from '@angular/common';
import { FirstWordPipe } from '../../../../shared/pipes/first-word-pipe.pipe';
@Component({
  selector: 'app-job-modal',
  imports: [CommonModule ,FirstWordPipe ],
  templateUrl: './job-modal.component.html',
  styleUrl: './job-modal.component.css'
})
export class JobModalComponent {
   store = inject(JobStore);

  // Update method to accept undefined and provide default value
  getExperienceText(years: number | undefined): string {
    const yearsValue = years ?? 0; // Default to 0 if undefined
    if (yearsValue === 0) return 'Entry Level';
    if (yearsValue === 1) return 'Mid Level';
    if (yearsValue === 2 || yearsValue === 3) return 'Senior Level';
    return 'Executive';
  }

  // Helper method for safe property access
  getSafeExperienceYears(): number {
    return this.store.selectedJob()?.minimum_years_of_experience ?? 0;
  }
}
