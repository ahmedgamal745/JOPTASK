import { Component, inject } from '@angular/core';
import { JobStore } from '../../../../core/stores/job/job.store';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-job-application-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-application-form.component.html',
  styleUrl: './job-application-form.component.css'
})
export class JobApplicationFormComponent {
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  jobStore = inject(JobStore);

  applicationForm: FormGroup;
  maxFileSize = 3 * 1024 * 1024; // 3MB in bytes
  isSubmitting = false;

  constructor() {
    this.applicationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      education: ['', Validators.required],
      currentPosition: ['', Validators.required],
      currentCompany: ['', Validators.required],
      cvFile: [null, Validators.required],
      coverLetter: ['']
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > this.maxFileSize) {
        this.toastr.error('File size exceeds 3MB limit');
        this.applicationForm.get('cvFile')?.setErrors({ maxSize: true });
        return;
      }
      this.applicationForm.patchValue({ cvFile: file });
      this.applicationForm.get('cvFile')?.markAsTouched();
    }
  }

  onSubmit() {
  // Mark all fields as touched to show validation errors
  this.applicationForm.markAllAsTouched();

  if (this.applicationForm.invalid) {
    this.toastr.error('Please fill all required fields correctly');
    return;
  }

  if (this.isSubmitting) {
    return; // Prevent multiple submissions
  }

  this.isSubmitting = true;
  
  const formData = new FormData();
  Object.keys(this.applicationForm.controls).forEach(key => {
    const control = this.applicationForm.get(key);
    if (control?.value !== null && control?.value !== undefined) {
      formData.append(key, control.value);
    }
  });

  // Here you would typically call your API service
  console.log('Submitting application:', formData);
  
  // Simulate API call
  setTimeout(() => {
    this.isSubmitting = false;
    
    // Randomly determine success/failure for demo purposes
    const isSuccess = Math.random() > 0.3; // 70% chance of success
    
    if (isSuccess) {
      this.toastr.success('Application submitted successfully!');
      this.jobStore.submitApplication();
      this.applicationForm.reset();
    } else {
      this.toastr.error('Failed to submit application. Please try again.');
    }
  }, 1000);
}

  // Helper method to check if a field is invalid
  isFieldInvalid(field: string): boolean {
    const control = this.applicationForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Helper method to get error message for a field
  getErrorMessage(field: string): string {
    const control = this.applicationForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'This field is required';
    } else if (control.errors['email']) {
      return 'Please enter a valid email';
    } else if (control.errors['maxSize']) {
      return 'File size must be less than 3MB';
    }
    
    return '';
  }
}