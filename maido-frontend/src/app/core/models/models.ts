export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Platillo {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  categoria: Categoria;
  activo?: boolean;
  disponible?: boolean;
}

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  rol?: string;
  activo?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface LoginResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  direccion?: string;
  telefono?: string;
  mensaje: string;
  autenticado: boolean;
}

export interface DetallePedidoRequest {
  platilloId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoRequest {
  usuarioId: number;
  direccionEntrega: string;
  observaciones?: string;
  detalles: DetallePedidoRequest[];
}

export interface DetalleResponse {
  platilloId: number;
  platilloNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  fechaPedido: string;
  estado: string;
  total: number;
  direccionEntrega: string;
  observaciones?: string;
  detalles: DetalleResponse[];
}

export interface CartItem {
  platillo: Platillo;
  cantidad: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DashboardStats {
  ingresosHoy: number;
  ingresosTotales: number;
  pedidosHoy: number;
  pedidosActivos: number;
  platillosAgotados: number;
}

export interface ReporteResumen {
  ingresos: number;
  totalPedidos: number;
  entregados: number;
  cancelados: number;
}
