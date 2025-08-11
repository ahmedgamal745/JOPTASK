import { Injectable } from '@angular/core';
import { DEFAULT_DESCRIPTION, DEFAULT_JOB_DESCRIPTIONS } from '../../shared/sharedData/descData';

@Injectable({
  providedIn: 'root'
})
export class JobDescriptionService {
  getDefaultDescription(jobTitle: string): string {
    // Find a matching description (case-insensitive)
    const normalizedTitle = jobTitle.trim().toLowerCase();
    const match = Object.entries(DEFAULT_JOB_DESCRIPTIONS).find(
      ([title]) => title.toLowerCase() === normalizedTitle
    );
    
    return match?.[1] || DEFAULT_DESCRIPTION;
  }

  getAllDefaultDescriptions() {
    return DEFAULT_JOB_DESCRIPTIONS;
  }
}
