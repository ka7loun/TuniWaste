import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface UploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
}

interface UploadResponse {
  fileName: string;
  originalName: string;
  size: number;
  path: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  upload(file: File): Observable<UploadProgress> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<UploadResponse>(`${environment.apiUrl}/files/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: HttpEvent<UploadResponse>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = event.total
              ? Math.round((100 * event.loaded) / event.total)
              : 0;
            return {
              fileName: file.name,
              progress,
              completed: false,
            };
          } else if (event.type === HttpEventType.Response) {
            const response = event.body;
            // Extract filename from response - could be fileName or path
            let fileName = response?.fileName || response?.path || file.name;
            
            // If it's a path, extract just the filename
            if (fileName.includes('/')) {
              fileName = fileName.split('/').pop() || fileName;
            }
            
            // Remove any leading/trailing slashes
            fileName = fileName.trim().replace(/^\/+|\/+$/g, '');
            
            console.log('File upload completed:', {
              originalName: file.name,
              responseFileName: response?.fileName,
              responsePath: response?.path,
              finalFileName: fileName
            });
            
            return {
              fileName: fileName,
              progress: 100,
              completed: true,
            };
          }
          return {
            fileName: file.name,
            progress: 0,
            completed: false,
          };
        })
      );
  }
}
