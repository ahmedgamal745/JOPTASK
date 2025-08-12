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
  maxFileSize = 3 * 1024 * 1024; 
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
  this.applicationForm.markAllAsTouched();

  if (this.applicationForm.invalid) {
    this.toastr.error('Please fill all required fields correctly');
    return;
  }

  if (this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;
  

  const formData = new FormData();
  formData.append('name', this.applicationForm.get('name')?.value);
  formData.append('email', this.applicationForm.get('email')?.value);
  formData.append('phone', this.applicationForm.get('phone')?.value);
  formData.append('country', this.applicationForm.get('country')?.value);
  formData.append('education', this.applicationForm.get('education')?.value);
  formData.append('currentPosition', this.applicationForm.get('currentPosition')?.value);
  formData.append('currentCompany', this.applicationForm.get('currentCompany')?.value);
  
  
  const cvFile = this.applicationForm.get('cvFile')?.value;
  if (cvFile) {
    formData.append('cvFile', cvFile);
  }


  const coverLetter = this.applicationForm.get('coverLetter')?.value;
  if (coverLetter) {
    formData.append('coverLetter', coverLetter);
  }

  this.jobStore.submitJobApplication(formData).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.applicationForm.reset();
    },
    error: () => {
      this.isSubmitting = false;
    }
  });
}


  isFieldInvalid(field: string): boolean {
    const control = this.applicationForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  
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