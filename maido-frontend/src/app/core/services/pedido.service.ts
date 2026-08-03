import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse, Page } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private base = 'http://localhost:8080/api/v1/pedidos';

  constructor(private http: HttpClient) {}

  create(body: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.base, body);
  }

  getAll(params?: { usuarioId?: number; estado?: string; inicio?: string; fin?: string }): Observable<PedidoResponse[]> {
    let p = new HttpParams();
    if (params?.usuarioId) p = p.set('usuarioId', params.usuarioId);
    if (params?.estado)    p = p.set('estado', params.estado);
    if (params?.inicio)    p = p.set('inicio', params.inicio);
    if (params?.fin)       p = p.set('fin', params.fin);
    return this.http.get<PedidoResponse[]>(this.base, { params: p });
  }

  getPage(page: number, size: number): Observable<Page<PedidoResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<PedidoResponse>>(`${this.base}/page`, { params });
  }

  getById(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.base}/${id}`);
  }

  cambiarEstado(id: number, estado: string): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.base}/${id}/estado`, { estado });
  }
}
