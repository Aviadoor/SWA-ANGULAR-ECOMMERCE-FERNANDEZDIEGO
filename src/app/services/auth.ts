import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8001/api/auth';

    constructor(private http: HttpClient) { }

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('username', username);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUsername(): string | null {
        return localStorage.getItem('username');
    }
}