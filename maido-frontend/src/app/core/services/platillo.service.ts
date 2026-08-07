import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Platillo, Page } from '../models/models';

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

  getPage(page: number, size: number): Observable<Page<Platillo>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Platillo>>(`${this.base}/page`, { params });
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

  getAdminPage(page: number, size: number): Observable<Page<Platillo>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Platillo>>(`${this.base}/admin/page`, { params });
  }

  restore(id: number): Observable<Platillo> {
    return this.http.put<Platillo>(`${this.base}/${id}/restaurar`, {});
  }

  toggleDisponible(id: number): Observable<Platillo> {
    return this.http.put<Platillo>(`${this.base}/${id}/toggle-disponible`, {});
  }

  uploadImage(file: File): Observable<string> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.base}/upload`, fd, { responseType: 'text' });
  }
}
