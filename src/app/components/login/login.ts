import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMensaje = '';

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    this.errorMensaje = '';
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.errorMensaje = 'Usuario o contraseña incorrectos';
      }
    });
  }
}