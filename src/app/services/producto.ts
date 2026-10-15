import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
    id?: number;
    nombre: string;
    precio: number;
    stock: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = 'http://localhost:8001/api/productos';

    constructor(private http: HttpClient) { }

    // 1. Listar (GET /api/productos)
    listar(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.apiUrl);
    }

    // 2. Crear (POST /api/productos)
    crear(producto: Producto): Observable<Producto> {
        return this.http.post<Producto>(this.apiUrl, producto);
    }

    // 3. Obtener por ID (GET /api/productos/{id})
    obtenerPorId(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/${id}`);
    }

    // 4. Actualizar (PUT /api/productos/{id})
    actualizar(id: number, producto: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
    }

    // 5. Eliminar (DELETE /api/productos/{id})
    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}