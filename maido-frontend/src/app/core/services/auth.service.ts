import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8080/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, body);
  }

  register(body: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/register`, body);
  }
}
