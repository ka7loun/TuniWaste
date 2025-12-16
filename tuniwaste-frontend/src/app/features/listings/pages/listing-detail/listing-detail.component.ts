import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { AuthService } from '../../../../core/services/auth.service';
import { WasteService } from '../../../../core/services/waste.service';
import { WasteListing } from '../../../../core/models/waste-listing.model';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, TitleCasePipe, RouterLink, SectionHeadingComponent],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
})
export class ListingDetailComponent implements OnInit {
  listing$: Observable<WasteListing | undefined>;
  isOwner$: Observable<boolean> | undefined;
  isBuyer$: Observable<boolean> | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly wasteService: WasteService,
    private readonly authService: AuthService
  ) {
    this.listing$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        return this.wasteService.getListingById(id || '');
      })
    );
  }

  ngOnInit(): void {
    const user$ = this.authService.user$;
    
    this.isOwner$ = this.listing$.pipe(
      switchMap(listing => user$.pipe(
        map(user => !!user && !!listing && (listing.seller === user.company))
      ))
    );

    this.isBuyer$ = user$.pipe(
      map(user => !!user && user.role === 'buyer')
    );
  }

  deleteListing(id: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.wasteService.deleteListing(id).subscribe(() => {
        this.router.navigate(['/listings']);
      });
    }
  }
}

