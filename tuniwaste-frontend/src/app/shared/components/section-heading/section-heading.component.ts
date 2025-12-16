import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SectionAction {
  label: string;
  routerLink?: string;
  externalLink?: string;
  variant?: 'primary' | 'ghost';
}

@Component({
  selector: 'app-section-heading',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss',
})
export class SectionHeadingComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() highlight = '';
  @Input() actions: SectionAction[] = [];
}
