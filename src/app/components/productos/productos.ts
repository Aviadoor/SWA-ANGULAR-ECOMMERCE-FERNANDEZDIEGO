import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto, ProductoService } from '../../services/producto';
import { PedidoService } from '../../services/pedido';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  pedidos: any[] = [];
  productoActual: Producto = { nombre: '', precio: 0, stock: 0 };
  editando = false;
  mensajeAlerta = '';
  usuarioActual: string | null = '';

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getUsername();
    this.cargarProductos();
    this.cargarPedidos();
  }

  cargarProductos(): void {
    this.productoService.listar().subscribe({
      next: (data) => (this.productos = data),
      error: () => (this.mensajeAlerta = 'Error al cargar los productos.')
    });
  }

  cargarPedidos(): void {
    this.pedidoService.listar().subscribe({
      next: (data) => (this.pedidos = data),
      error: () => (this.mensajeAlerta = 'Error al cargar los pedidos.')
    });
  }

  guardarProducto(): void {
    this.mensajeAlerta = '';
    if (this.editando && this.productoActual.id) {
      this.productoService.actualizar(this.productoActual.id, this.productoActual).subscribe({
        next: () => {
          this.cargarProductos();
          this.limpiarFormulario();
        },
        error: (err) => this.manejarErrorPermisos(err)
      });
    } else {
      this.productoService.crear(this.productoActual).subscribe({
        next: () => {
          this.cargarProductos();
          this.limpiarFormulario();
        },
        error: (err) => this.manejarErrorPermisos(err)
      });
    }
  }

  seleccionarProducto(p: Producto): void {
    this.productoActual = { ...p };
    this.editando = true;
  }

  eliminarProducto(id?: number): void {
    if (!id) return;
    this.mensajeAlerta = '';
    this.productoService.eliminar(id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => this.manejarErrorPermisos(err)
    });
  }

  limpiarFormulario(): void {
    this.productoActual = { nombre: '', precio: 0, stock: 0 };
    this.editando = false;
  }

  manejarErrorPermisos(err: any): void {
    if (err.status === 403 || err.status === 401) {
      this.mensajeAlerta = 'Acceso denegado (403): Tu usuario solo tiene permisos de lectura (ROLE_USER).';
    } else {
      this.mensajeAlerta = 'Ocurrió un error al procesar la solicitud.';
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}