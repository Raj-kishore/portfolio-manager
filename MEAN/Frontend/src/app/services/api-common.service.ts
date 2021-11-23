import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const URL = 'http://localhost:5000/portfolios';

@Injectable({
  providedIn: 'root'
})
export class ApiCommonService {
  
  constructor(private http: HttpClient) { }

  getPortfolios() {
    return this.http.get<any>(URL);
  }
  getTransactions(data:any){
    return this.http.post<any>(URL, data);
  }


}
