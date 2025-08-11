import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../content/header/header.component";
import { FiltersComponent } from "../../content/filters/filters.component";
import { JobListingsComponent } from "../../content/job-listings/job-listings.component";
import { JobStore } from '../../../core/stores/job/job.store';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ HeaderComponent, FiltersComponent, JobListingsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
jobStore = inject(JobStore);

  ngOnInit() {
    this.jobStore.loadJobs();
  }
}
