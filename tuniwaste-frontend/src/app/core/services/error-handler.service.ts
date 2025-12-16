import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../shared/components/toast/toast.service';

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastService) {}

  handleError(error: any, context?: string): ErrorInfo {
    let errorInfo: ErrorInfo = {
      message: 'An unexpected error occurred. Please try again.',
    };

    if (error instanceof HttpErrorResponse) {
      errorInfo.status = error.status;
      errorInfo.code = error.error?.code || `HTTP_${error.status}`;

      switch (error.status) {
        case 400:
          errorInfo.message = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorInfo.message = 'Your session has expired. Please log in again.';
          break;
        case 403:
          errorInfo.message = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorInfo.message = error.error?.message || 'The requested resource was not found.';
          break;
        case 409:
          errorInfo.message = error.error?.message || 'A conflict occurred. The resource may already exist.';
          break;
        case 422:
          errorInfo.message = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 500:
          errorInfo.message = 'A server error occurred. Please try again later.';
          break;
        case 503:
          errorInfo.message = 'Service is temporarily unavailable. Please try again later.';
          break;
        default:
          errorInfo.message = error.error?.message || `An error occurred (${error.status}). Please try again.`;
      }

      errorInfo.details = error.error;
    } else if (error?.message) {
      errorInfo.message = error.message;
      errorInfo.code = error.code || 'UNKNOWN_ERROR';
    } else if (typeof error === 'string') {
      errorInfo.message = error;
    }

    // Log error for debugging
    console.error(`Error${context ? ` in ${context}` : ''}:`, errorInfo, error);

    // Show toast notification
    this.toastService.show(errorInfo.message, 'error');

    return errorInfo;
  }

  extractErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

