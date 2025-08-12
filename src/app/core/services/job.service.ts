import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { constantApi } from '../constant/constantApi';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private http: HttpClient) { }

  getJobs(page: number, perPage: number = 11): Observable<any> {
    const params = new HttpParams()
      .set('pagination_type', 'paginate')
      .set('per_page', perPage.toString())
      .set('page', page.toString());

    return this.http.get(constantApi, { params });
  }

  getAllJobs(): Observable<any> {
  const params = new HttpParams()
      .set('pagination_type', 'paginate')
      .set('per_page', '1000')
      .set('page', '1');

    return this.http.get(constantApi, { params });
  }
}