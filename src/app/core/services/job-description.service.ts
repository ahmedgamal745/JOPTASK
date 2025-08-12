import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobDescriptionService {
  getDefaultDescription(jobTitle: string): string {
    return `This is a ${jobTitle} position. More details will be provided during the interview process.`;
  }
}