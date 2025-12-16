import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { AuthService, AuthUser } from '../../../../core/services/auth.service';
import { Transaction } from '../../../../core/models/transaction.model';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeadingComponent, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  readonly user$ = this.authService.user$;
  readonly transactions$: Observable<Transaction[]>;

  readonly profileForm = this.fb.group({
    company: [''],
    contact: [''],
    email: [''],
    role: [''],
    phone: [''],
    notifications: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    transactionService: TransactionService
  ) {
    this.transactions$ = transactionService.transactions$;
    const user = this.authService.snapshot();
    if (user) {
      this.patchProfile(user);
    }

    this.user$.subscribe((authUser) => {
      if (authUser) {
        this.patchProfile(authUser);
      }
    });
  }

  patchProfile(user: AuthUser): void {
    this.profileForm.patchValue({
      company: user.company,
      contact: user.contact,
      email: user.email,
      role: user.role,
    });
  }

  save(): void {
    // Placeholder for backend integration
  }
}
