import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Static login for testing - any email/password will work
    this.loginForm = this.fb.group({
      email: ['admin@tuniwaste.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      const { email, password } = this.loginForm.value;

      console.log('LoginComponent: Attempting login for', email);

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('LoginComponent: Login successful', response);
          // Check if user is admin
          const user = this.authService.getCurrentUser();
          if (user && user.role === 'admin') {
            console.log('LoginComponent: User is admin, navigating to dashboard');
            this.router.navigate(['/dashboard']);
          } else {
            console.error('LoginComponent: User is not an admin', user);
            this.error = 'Access denied. Admin role required.';
            this.authService.logout();
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('LoginComponent: Login error', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error,
          });
          
          if (err.status === 401 || err.status === 400) {
            this.error = err.error?.message || 'Invalid email or password.';
          } else if (err.status === 0) {
            this.error = 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000';
          } else {
            this.error = err.error?.message || err.message || 'Login failed. Please try again.';
          }
          this.loading = false;
        },
      });
    }
  }
}
