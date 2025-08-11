import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'main', 
    pathMatch: 'full' 
  },
  { 
    path: 'main', 
    loadComponent: () => import('./component/main/main/main.component').then(m => m.MainComponent)
  }
];
