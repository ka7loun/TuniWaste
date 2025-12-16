import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { USER_ROLES, UserRole } from '../../../../core/models/user-role.type';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  statusMessage = '';
  pending = false;
  readonly roles = USER_ROLES;

  readonly form = this.fb.group({
    company: [''],
    contact: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['generator' as UserRole, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.statusMessage = '';
    if (mode === 'login') {
      this.form.get('company')?.clearValidators();
      this.form.get('contact')?.clearValidators();
    } else {
      this.form.get('company')?.addValidators(Validators.required);
      this.form.get('contact')?.addValidators(Validators.required);
    }
    this.form.get('company')?.updateValueAndValidity();
    this.form.get('contact')?.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending = true;
    this.statusMessage = '';

    if (this.mode === 'login') {
      this.authService
        .login(
          this.form.value.email ?? '',
          this.form.value.password ?? '',
          this.form.value.role ?? 'generator'
        )
        .pipe(finalize(() => (this.pending = false)))
        .subscribe({
          next: (user) => {
            this.statusMessage = `Welcome back ${user.company}.`;
            setTimeout(() => {
              // Check if user is verified, if not redirect to verification
              if (user.verified) {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/verification']);
              }
            }, 1000);
          },
          error: (error) => {
            this.statusMessage = error || 'Login failed. Please try again.';
          },
        });
    } else {
      this.authService
        .register({
          company: this.form.value.company ?? '',
          contact: this.form.value.contact ?? '',
          email: this.form.value.email ?? '',
          password: this.form.value.password ?? '',
          role: this.form.value.role ?? 'generator',
        })
        .pipe(finalize(() => (this.pending = false)))
        .subscribe({
          next: (user) => {
            this.statusMessage = `Account created for ${user.company}. Redirecting to verification...`;
            setTimeout(() => {
              this.router.navigate(['/verification']);
            }, 1500);
          },
          error: (error) => {
            this.statusMessage = error || 'Registration failed. Please try again.';
          },
        });
    }
  }
}
