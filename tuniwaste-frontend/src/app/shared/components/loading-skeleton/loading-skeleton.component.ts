import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss',
})
export class LoadingSkeletonComponent {
  @Input() type: 'text' | 'card' | 'list' | 'circle' | 'image' = 'text';
  @Input() lines = 3;
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() count = 1;

  getArray(length: number): number[] {
    return Array(length).fill(0).map((_, i) => i);
  }
}

