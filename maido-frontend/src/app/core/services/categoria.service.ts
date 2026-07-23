import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private base = 'http://localhost:8080/api/v1/categorias';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.base);
  }

  getAllAdmin(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.base}/todas`);
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.base}/${id}`);
  }

  create(body: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.base, body);
  }

  update(id: number, body: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
