import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { FileUploadService, UploadProgress } from '../../../../core/services/file-upload.service';
import { WasteService } from '../../../../core/services/waste.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MaterialCategory } from '../../../../core/models/waste-listing.model';

@Component({
  selector: 'app-listing-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeadingComponent],
  templateUrl: './listing-edit.component.html',
  styleUrl: './listing-edit.component.scss',
})
export class ListingEditComponent implements OnInit {
  readonly categories = this.wasteService.categories;
  uploads: UploadProgress[] = [];
  submissionMessage = '';
  pending = false;
  listingId = '';

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
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.listingId = params.get('id') || '';
        return this.wasteService.getListingById(this.listingId);
      })
    ).subscribe(listing => {
      if (!listing) {
        this.router.navigate(['/listings']);
        return;
      }
      
      const user = this.authService.snapshot();
      if (!user || listing.seller !== user.company) {
        // Not authorized
        this.router.navigate(['/listings']);
        return;
      }

      this.form.patchValue({
        title: listing.title,
        material: listing.material,
        category: listing.category,
        quantityTons: listing.quantityTons,
        location: listing.location,
        coords: listing.coords,
        pricePerTon: listing.pricePerTon,
        availableFrom: listing.availableFrom,
        expiresOn: listing.expiresOn,
        pickupRequirements: listing.pickupRequirements,
      });

      // Simulate existing documents as completed uploads
      this.uploads = listing.documents.map(doc => ({
        progress: 100,
        fileName: doc,
        completed: true
      }));
    });
  }

  uploadDocuments(files: FileList | null): void {
    if (!files) {
      return;
    }
    Array.from(files).forEach((file) => {
      this.fileUploadService.upload(file).subscribe((progress) => {
        const idx = this.uploads.findIndex((u) => u.fileName === progress.fileName);
        if (idx >= 0) {
          this.uploads[idx] = progress;
        } else {
          this.uploads = [...this.uploads, progress];
        }
      });
    });
  }

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.uploadDocuments(input?.files ?? null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending = true;
    this.submissionMessage = '';
    const payload = this.form.getRawValue();

    this.wasteService
      .updateListing(this.listingId, {
        ...payload,
        category: payload.category,
        documents: this.uploads.filter((u) => u.completed).map((u) => u.fileName),
      })
      .pipe(finalize(() => (this.pending = false)))
      .subscribe((listing) => {
        this.submissionMessage = `Listing updated successfully.`;
        setTimeout(() => {
          this.router.navigate(['/listings', this.listingId]);
        }, 1500);
      });
  }
}

