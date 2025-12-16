import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { FileUploadService, UploadProgress } from '../../../../core/services/file-upload.service';
import { WasteService } from '../../../../core/services/waste.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MaterialCategory } from '../../../../core/models/waste-listing.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-listing-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeadingComponent],
  templateUrl: './listing-create.component.html',
  styleUrl: './listing-create.component.scss',
})
export class ListingCreateComponent {
  readonly categories = this.wasteService.categories;
  uploads: UploadProgress[] = [];
  additionalUploads: UploadProgress[] = [];
  mainPhotoPreview: string | null = null;
  mainPhotoFileName: string | null = null;
  mainPhotoUploading = false;
  mainPhotoProgress = 0;
  submissionMessage = '';
  pending = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    material: ['', Validators.required],
    category: ['metals' as MaterialCategory, Validators.required],
    quantityTons: [0, [Validators.required, Validators.min(1)]],
    location: ['', Validators.required],
    coords: this.fb.nonNullable.control<[number, number]>([36.8, 10.17]),
    pricePerTon: [0, Validators.required],
    availableFrom: ['', Validators.required],
    expiresOn: ['', Validators.required],
    pickupRequirements: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly fileUploadService: FileUploadService,
    private readonly wasteService: WasteService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onMainPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or WEBP)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.mainPhotoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload file
    this.mainPhotoUploading = true;
    this.mainPhotoProgress = 0;
    this.fileUploadService.upload(file).subscribe({
      next: (progress) => {
        this.mainPhotoProgress = progress.progress;
        if (progress.completed) {
          this.mainPhotoFileName = progress.fileName;
          this.mainPhotoUploading = false;
          console.log('Main photo uploaded successfully:', {
            originalName: file.name,
            savedFileName: progress.fileName,
            preview: this.mainPhotoPreview ? 'Yes' : 'No'
          });
        }
      },
      error: (error) => {
        console.error('Main photo upload error:', error);
        this.mainPhotoUploading = false;
        this.mainPhotoPreview = null;
        this.mainPhotoFileName = null;
        alert('Failed to upload main photo. Please try again.');
      }
    });
  }

  removeMainPhoto(): void {
    this.mainPhotoPreview = null;
    this.mainPhotoFileName = null;
    this.mainPhotoProgress = 0;
  }

  uploadDocuments(files: FileList | null): void {
    if (!files) {
      return;
    }
    Array.from(files).forEach((file) => {
      this.fileUploadService.upload(file).subscribe((progress) => {
        const idx = this.additionalUploads.findIndex((u) => u.fileName === progress.fileName);
        if (idx >= 0) {
          this.additionalUploads[idx] = progress;
        } else {
          this.additionalUploads = [...this.additionalUploads, progress];
        }
      });
    });
  }

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.uploadDocuments(input?.files ?? null);
  }

  removeUpload(fileName: string): void {
    this.additionalUploads = this.additionalUploads.filter((u) => u.fileName !== fileName);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Validate main photo is uploaded
    if (!this.mainPhotoFileName) {
      alert('Please upload a main photo for your listing');
      return;
    }

    this.pending = true;
    this.submissionMessage = '';
    const payload = this.form.getRawValue();
    const user = this.authService.snapshot();
    const completedAdditionalUploads = this.additionalUploads.filter((u) => u.completed);
    
    // Store just the filename - the URL will be constructed when displaying
    const thumbnail = this.mainPhotoFileName || '';
    
    if (!thumbnail) {
      alert('Please upload a main photo for your listing');
      this.pending = false;
      return;
    }
    
    console.log('Submitting listing with:');
    console.log('- Main photo filename:', this.mainPhotoFileName);
    console.log('- Thumbnail value:', thumbnail);
    console.log('- Additional documents:', completedAdditionalUploads.map((u) => u.fileName));
    console.log('- Full payload thumbnail field:', thumbnail);

    // Combine main photo with additional documents (store just filenames)
    const allDocuments = this.mainPhotoFileName 
      ? [this.mainPhotoFileName, ...completedAdditionalUploads.map((u) => u.fileName)]
      : completedAdditionalUploads.map((u) => u.fileName);

    this.wasteService
      .addListing({
        ...payload,
        category: payload.category,
        matchedRole: 'buyer', // Sellers list for buyers
        certifications: [],
        seller: user?.company || 'Your company',
        documents: allDocuments,
        thumbnail: thumbnail,
      })
      .pipe(finalize(() => (this.pending = false)))
      .subscribe((listing) => {
        this.submissionMessage = `Listing ${listing.title} published successfully.`;
        setTimeout(() => {
          this.router.navigate(['/listings']);
        }, 1500);
      });
  }
}
