import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of, debounceTime, distinctUntilChanged, throwError } from 'rxjs';
import { Job } from '../../interfaces/data';
import { JobService } from '../../services/job.service';
import { JobDescriptionService } from '../../services/job-description.service';
import { ToastrService } from 'ngx-toastr';

type FilterCriteria = {
  title: string;
  location: string;
  experienceLevel: string;
  company: string;
};

type PaginationState = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
};

type ApplicationFormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  education: string;
  currentPosition: string;
  currentCompany: string;
  cvFile: File | null;
  coverLetter: string;
};

type SavedApplication = {
  [key: string]: any;
  jobTitle: string;
  company: string;
  appliedDate: string;
  applicationId: string;
};

type JobState = {
  jobs: Job[]; 
  allJobs: Job[]; 
  filteredJobs: Job[]; 
  paginatedFilteredJobs: Job[]; 
  isLoading: boolean;
  isFiltering: boolean; 
  filters: FilterCriteria;
  pagination: PaginationState;
  originalPagination: PaginationState; 
  selectedJob: Job | null;
  isModalOpen: boolean;
  isInApplyMode: boolean;
  applicationForm: ApplicationFormState;
  applicationSubmitted: boolean;
  applicationErrors: Record<string, string>;
  savedApplications: SavedApplication[];
};

const initialState: JobState = {
  jobs: [],
  allJobs: [],
  filteredJobs: [],
  paginatedFilteredJobs: [],
  isLoading: false,
  isFiltering: false,
  filters: {
    title: '',
    location: '',
    experienceLevel: '',
    company: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 11,
    totalItems: 0,
    totalPages: 0
  },
  originalPagination: {
    currentPage: 1,
    itemsPerPage: 11,
    totalItems: 0,
    totalPages: 0
  },
  selectedJob: null,
  isModalOpen: false,
  isInApplyMode: false,
  applicationForm: {
    name: '',
    email: '',
    phone: '',
    country: '',
    education: '',
    currentPosition: '',
    currentCompany: '',
    cvFile: null,
    coverLetter: ''
  },
  applicationSubmitted: false,
  applicationErrors: {},
  savedApplications: []
};

export const JobStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ filteredJobs, paginatedFilteredJobs, pagination, isFiltering, jobs, savedApplications }) => ({
    displayJobs: computed(() => isFiltering() ? paginatedFilteredJobs() : jobs()),
    showingStart: computed(() => (pagination().currentPage - 1) * pagination().itemsPerPage + 1),
    showingEnd: computed(() => Math.min(
      pagination().currentPage * pagination().itemsPerPage,
      pagination().totalItems
    )),
    applicationsCount: computed(() => savedApplications().length)
  })),
  withMethods((store, jobService = inject(JobService), descService = inject(JobDescriptionService), toastr = inject(ToastrService)) => {
    const methods = {
      loadJobs: rxMethod<{ page?: number, perPage?: number }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(({ page = store.pagination().currentPage, perPage = store.pagination().itemsPerPage }) => 
            jobService.getJobs(page, perPage).pipe(
              tap((response) => {
                const jobs = response.data.map((job: any) => ({
                  ...job,
                  description: job.description || descService.getDefaultDescription(job.title),
                }));
                
                patchState(store, { 
                  jobs, 
                  isLoading: false,
                  pagination: {
                    ...store.pagination(),
                    currentPage: response.meta.current_page,
                    itemsPerPage: response.meta.per_page,
                    totalItems: response.meta.total,
                    totalPages: response.meta.last_page
                  },
                  originalPagination: {
                    currentPage: response.meta.current_page,
                    itemsPerPage: response.meta.per_page,
                    totalItems: response.meta.total,
                    totalPages: response.meta.last_page
                  }
                });
              }),
              catchError(() => {
                patchState(store, { isLoading: false });
                return of([]);
              })
            )
          )
        )
      ),

      loadAllJobs: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => 
            jobService.getAllJobs().pipe(
              tap((response) => {
                const allJobs = response.data.map((job: any) => ({
                  ...job,
                  description: job.description || descService.getDefaultDescription(job.title),
                }));
                
                patchState(store, { 
                  allJobs,
                  isLoading: false
                });
                
                methods.applyFilters();
              }),
              catchError(() => {
                patchState(store, { isLoading: false });
                return of([]);
              })
            )
          )
        )
      ),

      updateFilters: (updates: Partial<FilterCriteria>) => {
        const newFilters = { ...store.filters(), ...updates };
        patchState(store, { filters: newFilters });

        const isFiltering = Object.values(newFilters).some(val => val !== '');

        if (isFiltering && store.allJobs().length === 0) {
          patchState(store, { isFiltering: true });
          methods.loadAllJobs();
        } else if (isFiltering) {
          patchState(store, { isFiltering: true });
          methods.applyFilters();
        } else {
          patchState(store, { 
            isFiltering: false,
            filteredJobs: [],
            paginatedFilteredJobs: [],
            filters: initialState.filters,
            pagination: store.originalPagination()
          });
          methods.loadJobs({ page: 1 });
        }
      },

      applyFilters: () => {
        const filters = store.filters();
        const allJobs = store.allJobs();
        
        if (allJobs.length === 0) return;

        const filtered = allJobs.filter(job => {
          const matchesTitle = filters.title ? 
            job.title.toLowerCase().includes(filters.title.toLowerCase()) : true;
          
          const matchesLocation = filters.location ? 
            (job.page?.location?.country_and_city?.toLowerCase().includes(filters.location.toLowerCase()) ?? false) : true;
          
          const matchesExperience = filters.experienceLevel ? 
            getExperienceLevel(job.minimum_years_of_experience) === filters.experienceLevel : true;
          
          const matchesCompany = filters.company ? 
            (job.page?.alias?.toLowerCase().includes(filters.company.toLowerCase()) ?? false) : true;

          return matchesTitle && matchesLocation && matchesExperience && matchesCompany;
        });

        const totalFilteredItems = filtered.length;
        const totalFilteredPages = Math.ceil(totalFilteredItems / store.pagination().itemsPerPage);
        
        patchState(store, { 
          filteredJobs: filtered,
          pagination: { 
            ...store.pagination(), 
            currentPage: 1,
            totalItems: totalFilteredItems,
            totalPages: totalFilteredPages
          },
        });

        methods.paginateFilteredJobs();
      },

      paginateFilteredJobs: () => {
        const { currentPage, itemsPerPage } = store.pagination();
        const filtered = store.filteredJobs();
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedJobs = filtered.slice(startIndex, endIndex);
        
        patchState(store, { 
          paginatedFilteredJobs: paginatedJobs 
        });
      },

      setPage: (page: number) => {
        const validatedPage = Math.max(1, Math.min(page, store.pagination().totalPages));
        
        if (validatedPage !== store.pagination().currentPage) {
          patchState(store, {
            pagination: {
              ...store.pagination(),
              currentPage: validatedPage
            }
          });

          if (store.isFiltering()) {
            methods.paginateFilteredJobs();
          } else {
            patchState(store, { isLoading: true });
            methods.loadJobs({ page: validatedPage });
          }
        }
      },

      onPageInputChange: rxMethod<Event>(
        pipe(
          debounceTime(500),
          distinctUntilChanged(),
          tap((event) => {
            const input = event.target as HTMLInputElement;
            const page = parseInt(input.value);
            if (!isNaN(page)) {
              methods.setPage(page);
            }
          })
        )
      ),

      openJobDetails: (job: Job) => {
        patchState(store, {
          selectedJob: job,
          isModalOpen: true,
          isInApplyMode: false,
          applicationSubmitted: false
        });
      },

      startApplication: () => {
        patchState(store, { 
          isInApplyMode: true,
          applicationForm: initialState.applicationForm,
          applicationErrors: {}
        });
      },

      cancelApplication: () => {
        patchState(store, { 
          isInApplyMode: false 
        });
      },

      openJobModal: (job: Job) => {
        patchState(store, {
          selectedJob: job,
          isModalOpen: true,
          isInApplyMode: false,
          applicationSubmitted: false,
          applicationForm: initialState.applicationForm,
          applicationErrors: {}
        });
      },

      closeJobModal: () => {
        patchState(store, {
          selectedJob: null,
          isModalOpen: false,
          isInApplyMode: false
        });
      },

      updateApplicationForm: (update: Partial<ApplicationFormState>) => {
        patchState(store, {
          applicationForm: { ...store.applicationForm(), ...update }
        });
      },

      validateApplication: () => {
        const form = store.applicationForm();
        const errors: Record<string, string> = {};
        
        if (!form.name) errors['name'] = 'Name is required';
        if (!form.email) {
          errors['email'] = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
          errors['email'] = 'Invalid email format';
        }
        if (!form.phone) errors['phone'] = 'Phone is required';
        if (!form.country) errors['country'] = 'Country is required';
        if (!form.education) errors['education'] = 'Education is required';
        if (!form.currentPosition) errors['currentPosition'] = 'Current position is required';
        if (!form.currentCompany) errors['currentCompany'] = 'Current company is required';
        if (!form.cvFile) {
          errors['cvFile'] = 'CV is required';
        } else if (form.cvFile.size > 3 * 1024 * 1024) {
          errors['cvFile'] = 'File size must be less than 3MB';
        }

        patchState(store, { applicationErrors: errors });
        return Object.keys(errors).length === 0;
      },

      submitJobApplication: (formData: FormData) => {
        patchState(store, { isLoading: true });
        
        try {
          const applicationData: Record<string, any> = {};
          formData.forEach((value, key) => {
            if (value instanceof File) {
              applicationData[key] = {
                name: value.name,
                type: value.type,
                size: value.size
              };
            } else {
              applicationData[key] = value;
            }
          });

          const selectedJob = store.selectedJob();
          if (!selectedJob) {
            throw new Error('No job selected');
          }

          const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
          const newApplication: SavedApplication = {
            ...applicationData,
            jobTitle: selectedJob.title,
            company: selectedJob.page?.alias || 'Unknown Company',
            appliedDate: new Date().toISOString(),
            applicationId: Date.now().toString()
          };

          const updatedApps = [...existingApps, newApplication];
          localStorage.setItem('jobApplications', JSON.stringify(updatedApps));

          patchState(store, {
            isLoading: false,
            applicationSubmitted: true,
            isInApplyMode: false,
            savedApplications: updatedApps
          });

          toastr.success('Application submitted successfully!');
          return of(true);
        } catch (error) {
          console.error('Error saving application:', error);
          toastr.error('Failed to submit application');
          patchState(store, { isLoading: false });
          return throwError(() => error);
        }
      },

      getSavedApplications: () => {
        try {
          const apps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
          patchState(store, { savedApplications: apps });
          return apps;
        } catch (error) {
          console.error('Error reading applications:', error);
          return [];
        }
      },

      getApplicationById: (id: string) => {
        const apps = store.savedApplications();
        return apps.find(app => app.applicationId === id);
      },

      clearSavedApplications: () => {
        localStorage.removeItem('jobApplications');
        patchState(store, { savedApplications: [] });
        toastr.success('All applications cleared');
      },

      deleteApplication: (id: string) => {
        const updatedApps = store.savedApplications().filter(app => app.applicationId !== id);
        localStorage.setItem('jobApplications', JSON.stringify(updatedApps));
        patchState(store, { savedApplications: updatedApps });
        toastr.success('Application deleted');
      },

      getExperienceLevelDisplayText: (years: number): string => {
        if (years === 0) return 'Entry Level';
        if (years === 1) return 'Mid Level';
        if (years === 2 || years === 3) return 'Senior Level';
        return 'Executive';
      },

      resetStore: () => {
        patchState(store, initialState);
        methods.loadJobs({ page: 1 });
      }
    };
    methods.getSavedApplications();

    return methods;
  })
);

function getExperienceLevel(years: number): string {
  if (years === 0) return 'entry';
  if (years === 1) return 'mid';
  if (years === 2 || years === 3) return 'senior';
  return 'executive';
}