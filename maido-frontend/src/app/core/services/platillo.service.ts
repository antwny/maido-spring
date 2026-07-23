import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Platillo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PlatilloService {
  private base = 'http://localhost:8080/api/v1/platillos';

  constructor(private http: HttpClient) {}

  getAll(categoriaId?: number, nombre?: string): Observable<Platillo[]> {
    let params = new HttpParams();
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    if (nombre) params = params.set('nombre', nombre);
    return this.http.get<Platillo[]>(this.base, { params });
  }

  getById(id: number): Observable<Platillo> {
    return this.http.get<Platillo>(`${this.base}/${id}`);
  }

  create(formData: FormData): Observable<Platillo> {
    return this.http.post<Platillo>(this.base, formData);
  }

  update(id: number, formData: FormData): Observable<Platillo> {
    return this.http.put<Platillo>(`${this.base}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadImage(file: File): Observable<string> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.base}/upload`, fd, { responseType: 'text' });
  }
}
