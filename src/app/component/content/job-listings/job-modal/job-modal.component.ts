import { Component, inject } from '@angular/core';
import { JobStore } from '../../../../core/stores/job/job.store';
import { CommonModule } from '@angular/common';

import { JobApplicationFormComponent } from "../job-application-form/job-application-form.component";
@Component({
  selector: 'app-job-modal',
  imports: [CommonModule,JobApplicationFormComponent],
  templateUrl: './job-modal.component.html',
  styleUrl: './job-modal.component.css'
})
export class JobModalComponent {
   jobStore = inject(JobStore);

  
}