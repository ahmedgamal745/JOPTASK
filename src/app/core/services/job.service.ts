import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { constantApi } from '../constant/constantApi';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private http:HttpClient) { }


  getJobs():Observable<any>{
    return this.http.get(`${constantApi}`)
  }
}
