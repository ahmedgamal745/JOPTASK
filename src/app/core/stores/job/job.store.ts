import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { Job } from '../../interfaces/data';
import { JobService } from '../../services/job.service';
import { JobDescriptionService } from '../../services/job-description.service';

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
};

type JobState = {
  jobs: Job[];
  filteredJobs: Job[];
  isLoading: boolean;
  filters: FilterCriteria;
  pagination: PaginationState;
};

const initialState: JobState = {
  jobs: [],
  filteredJobs: [],
  isLoading: false,
  filters: {
    title: '',
    location: '',
    experienceLevel: '',
    company: '',
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 4,
    totalItems: 0,
  },
};

export const JobStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ filteredJobs, pagination }) => ({
    // Computed signals for pagination
    totalPages: computed(() => Math.ceil(filteredJobs().length / pagination().itemsPerPage)),
    paginatedJobs: computed(() => {
      const start = (pagination().currentPage - 1) * pagination().itemsPerPage;
      return filteredJobs().slice(start, start + pagination().itemsPerPage);
    }),
  })),
  withMethods((store, jobService = inject(JobService), descService = inject(JobDescriptionService)) => ({
    // Fetch jobs
    loadJobs: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => jobService.getJobs().pipe(
          tap((res) => {
            const jobs = res.data.map((job: { description: any; title: string; }) => ({
              ...job,
              description: job.description || descService.getDefaultDescription(job.title),
            }));
            patchState(store, { jobs, filteredJobs: jobs, isLoading: false, pagination: { ...store.pagination(), totalItems: jobs.length } });
          }),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of([]);
          }),
        )),
      ),
    ),

    // Update filters
    updateFilters: (updates: Partial<FilterCriteria>) => {
      const newFilters = { ...store.filters(), ...updates };
      patchState(store, { filters: newFilters });

      // Filter jobs
      const filtered = store.jobs().filter(job => {
        const matchesTitle = newFilters.title ? job.title.toLowerCase().includes(newFilters.title.toLowerCase()) : true;
        const matchesLocation = newFilters.location ? job.page.location.country_and_city?.toLowerCase().includes(newFilters.location.toLowerCase()) : true;
        const matchesExperience = newFilters.experienceLevel 
          ? getExperienceLevel(job.minimum_years_of_experience) === newFilters.experienceLevel 
          : true;
        const matchesCompany = newFilters.company 
          ? job.page.alias.split(' ')[0].toLowerCase().includes(newFilters.company.toLowerCase()) 
          : true;

        return matchesTitle && matchesLocation && matchesExperience && matchesCompany;
      });

      patchState(store, { 
        filteredJobs: filtered,
        pagination: { ...store.pagination(), currentPage: 1, totalItems: filtered.length },
      });
    },

    // Pagination controls
    setPage: (page: number) => {
      patchState(store, { 
        pagination: { ...store.pagination(), currentPage: page },
      });
    },
  })),
);

// Helper (move to a shared file if reused)
function getExperienceLevel(years: number): string {
  if (years === 0) return 'entry';
  if (years === 1) return 'mid';
  if (years === 2 || years === 3) return 'senior';
  return 'executive';
}