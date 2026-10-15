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
  
  // Formulario de Producto
  productoActual: Producto = { nombre: '', precio: 0, stock: 0 };
  editando = false;

  // Formulario de Pedido
  nombreCliente: string = '';
  productoSeleccionadoId: number | null = null;
  cantidadSeleccionada: number = 1;
  itemsPedido: Array<{ producto: { id: number; nombre?: string; precio?: number }; cantidad: number }> = [];

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

  // --- CRUD DE PRODUCTOS ---
  guardarProducto(): void {
    this.mensajeAlerta = '';
    if (this.editando && this.productoActual.id) {
      this.productoService.actualizar(this.productoActual.id, this.productoActual).subscribe({
        next: () => {
          this.cargarProductos();
          this.limpiarFormularioProducto();
        },
        error: (err) => this.manejarErrorPermisos(err)
      });
    } else {
      this.productoService.crear(this.productoActual).subscribe({
        next: () => {
          this.cargarProductos();
          this.limpiarFormularioProducto();
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

  limpiarFormularioProducto(): void {
    this.productoActual = { nombre: '', precio: 0, stock: 0 };
    this.editando = false;
  }

  // --- GESTIÓN DE PEDIDOS ---
  agregarItemAlPedido(): void {
    if (!this.productoSeleccionadoId || this.cantidadSeleccionada <= 0) return;

    const prod = this.productos.find(p => p.id === Number(this.productoSeleccionadoId));
    if (!prod) return;

    // Evitar duplicar el mismo producto en el detalle
    const existe = this.itemsPedido.find(item => item.producto.id === prod.id);
    if (existe) {
      existe.cantidad += this.cantidadSeleccionada;
    } else {
      this.itemsPedido.push({
        producto: { id: prod.id!, nombre: prod.nombre, precio: prod.precio },
        cantidad: this.cantidadSeleccionada
      });
    }

    this.cantidadSeleccionada = 1;
    this.productoSeleccionadoId = null;
  }

  removerItemPedido(index: number): void {
    this.itemsPedido.splice(index, 1);
  }

  calcularSubtotalItem(item: any): number {
    return (item.producto.precio || 0) * item.cantidad;
  }

  calcularTotalPedido(): number {
    return this.itemsPedido.reduce((acc, item) => acc + this.calcularSubtotalItem(item), 0);
  }

  registrarPedido(): void {
    if (!this.nombreCliente.trim() || this.itemsPedido.length === 0) {
      this.mensajeAlerta = 'Debe ingresar el nombre del cliente y al menos un producto en el pedido.';
      return;
    }

    this.mensajeAlerta = '';
    const nuevoPedido = {
      cliente: this.nombreCliente,
      detalles: this.itemsPedido.map(item => ({
        producto: { id: item.producto.id },
        cantidad: item.cantidad
      }))
    };

    this.pedidoService.crear(nuevoPedido).subscribe({
      next: () => {
        this.cargarPedidos();
        this.cargarProductos(); // Recargar productos para reflejar el descuento de stock
        this.nombreCliente = '';
        this.itemsPedido = [];
      },
      error: (err) => this.manejarErrorPermisos(err)
    });
  }

  eliminarPedido(id?: number): void {
    if (!id) return;
    this.mensajeAlerta = '';
    this.pedidoService.eliminar(id).subscribe({
      next: () => this.cargarPedidos(),
      error: (err) => this.manejarErrorPermisos(err)
    });
  }

  manejarErrorPermisos(err: any): void {
    if (err.status === 403 || err.status === 401) {
      this.mensajeAlerta = 'Acceso denegado (403): Tu usuario solo tiene permisos de lectura (ROLE_USER).';
    } else {
      this.mensajeAlerta = typeof err.error === 'string' ? err.error : 'Ocurrió un error al procesar la solicitud.';
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}