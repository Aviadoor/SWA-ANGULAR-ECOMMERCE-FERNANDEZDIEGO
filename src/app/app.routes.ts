import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { ProductosComponent } from './components/productos/productos';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'productos', component: ProductosComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];