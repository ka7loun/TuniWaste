import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WasteListing } from '../../../core/models/waste-listing.model';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
})
export class ListingCardComponent {
  @Input() listing!: WasteListing;
  @Output() selectListing = new EventEmitter<WasteListing>();
  imageErrorCount = 0;

  onImageLoad(): void {
    this.imageErrorCount = 0;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && this.imageErrorCount < 2) {
      this.imageErrorCount++;
      console.error('Image failed to load:', {
        attemptedUrl: img.src,
        listingId: this.listing.id,
        listingTitle: this.listing.title,
        thumbnail: this.listing.thumbnail,
        errorCount: this.imageErrorCount
      });
      
      // Only set placeholder if we haven't already tried it
      if (!img.src.includes('data:image') && !img.src.includes('placeholder')) {
        // Use a data URI placeholder instead of external URL
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
      }
    }
  }
}
