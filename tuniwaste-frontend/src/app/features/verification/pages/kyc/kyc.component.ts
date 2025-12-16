import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { FileUploadService, UploadProgress } from '../../../../core/services/file-upload.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss',
})
export class KycComponent implements OnInit {
  step = 1;
  uploads: UploadProgress[] = [];
  submitted = false;

  readonly industryOptions = ['Cement', 'Chemicals', 'Metals', 'Plastics', 'Textiles', 'Other'];
  certificationUploads: UploadProgress[] = [];

  readonly companyForm = this.fb.group({
    legalName: ['', Validators.required],
    registrationNumber: ['', Validators.required],
    taxId: ['', Validators.required],
    industry: ['', Validators.required],
    hqCity: ['', Validators.required],
  });

  readonly complianceForm = this.fb.group({
    handlesHazmat: [false],
    annualWaste: ['', Validators.required],
  });

  readonly contactsForm = this.fb.group({
    complianceOfficer: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly fileUploadService: FileUploadService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already verified or not logged in
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.router.navigate(['/auth']);
      } else if (user.verified) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onCertificationFiles(files: FileList | null): void {
    if (!files) {
      return;
    }
    Array.from(files).forEach((file) => {
      this.fileUploadService.upload(file).subscribe((progress) => {
        const existingIndex = this.certificationUploads.findIndex(
          (item) => item.fileName === progress.fileName
        );
        if (existingIndex >= 0) {
          this.certificationUploads[existingIndex] = progress;
        } else {
          this.certificationUploads = [...this.certificationUploads, progress];
        }
      });
    });
  }

  toggleStep(direction: 'next' | 'previous'): void {
    if (direction === 'next' && this.step < 3) {
      // Validate current step before proceeding
      if (this.step === 1 && this.companyForm.invalid) {
        this.companyForm.markAllAsTouched();
        return;
      }
      if (this.step === 2 && this.complianceForm.invalid) {
        this.complianceForm.markAllAsTouched();
        return;
      }
      this.step += 1;
    } else if (direction === 'previous' && this.step > 1) {
      this.step -= 1;
    }
  }

  handleFiles(files: FileList | null): void {
    if (!files) {
      return;
    }
    Array.from(files).forEach((file) => {
      this.fileUploadService.upload(file).subscribe((progress) => {
        const existingIndex = this.uploads.findIndex(
          (item) => item.fileName === progress.fileName
        );
        if (existingIndex >= 0) {
          this.uploads[existingIndex] = progress;
        } else {
          this.uploads = [...this.uploads, progress];
        }
      });
    });
  }

  submit(): void {
    if (this.companyForm.invalid || this.complianceForm.invalid || this.contactsForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.complianceForm.markAllAsTouched();
      this.contactsForm.markAllAsTouched();
      return;
    }
    
    this.submitted = true;

    // Get uploaded certification files
    const certificationFiles = this.certificationUploads.filter((u) => u.completed).map((u) => u.fileName);

    // Prepare KYC data
    const kycData = {
      company: {
        legalName: this.companyForm.value.legalName ?? '',
        registrationNumber: this.companyForm.value.registrationNumber ?? '',
        taxId: this.companyForm.value.taxId ?? '',
        industry: this.companyForm.value.industry ?? '',
        hqCity: this.companyForm.value.hqCity ?? '',
      },
      compliance: {
        handlesHazmat: this.complianceForm.value.handlesHazmat ?? false,
        annualWaste: this.complianceForm.value.annualWaste ?? '',
        certifications: certificationFiles,
      },
      contacts: {
        complianceOfficer: this.contactsForm.value.complianceOfficer ?? '',
        phone: this.contactsForm.value.phone ?? '',
        email: this.contactsForm.value.email ?? '',
      },
      documents: this.uploads.filter((u) => u.completed).map((u) => u.fileName),
    };

    // Submit to backend
    this.authService.submitKYC(kycData).subscribe({
      next: (user) => {
        // User is now verified, redirect to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('KYC submission error:', error);
        this.submitted = false;
        alert(error || 'Failed to submit KYC. Please try again.');
      },
    });
  }

  onDocumentInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.handleFiles(input?.files ?? null);
  }
}
