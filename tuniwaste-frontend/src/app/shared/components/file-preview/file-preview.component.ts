import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-preview.component.html',
  styleUrl: './file-preview.component.scss',
})
export class FilePreviewComponent implements OnInit {
  @Input() file!: File | { fileName: string; path?: string };
  @Input() showRemove = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() remove = new EventEmitter<void>();

  previewUrl: SafeUrl | null = null;
  isImage = false;
  isPdf = false;
  fileName = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.file instanceof File) {
      this.fileName = this.file.name;
      this.isImage = this.file.type.startsWith('image/');
      this.isPdf = this.file.type === 'application/pdf';

      if (this.isImage) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
        };
        reader.readAsDataURL(this.file);
      }
    } else {
      this.fileName = this.file.fileName;
      const ext = this.fileName.split('.').pop()?.toLowerCase();
      this.isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
      this.isPdf = ext === 'pdf';

      if (this.isImage && this.file.path) {
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(this.file.path);
      }
    }
  }

  getFileIcon(): string {
    if (this.isImage) return 'image';
    if (this.isPdf) return 'file-text';
    return 'file';
  }
}

