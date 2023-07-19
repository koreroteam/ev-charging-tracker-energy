import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

    //baseURL: string = "https://ev-charge-api.herokuapp.com/api/v1";

    //local setup
    baseURL: string = environment.apiUrl;

    constructor(private http: HttpClient) {}

    registerUser(user: any): Observable<any> {
        const headers = { 'content-type': 'application/json' }
        const body = JSON.stringify(user);
        console.log(body)
        return this.http.post(this.baseURL + '/users', body, { 'headers': headers })
    }

    login(user: any): Observable<any> {
        const headers = { 'content-type': 'application/json' }
        const body = JSON.stringify(user);
        console.log(body)
        return this.http.post(this.baseURL + '/login', body, { 'headers': headers })
    }

}