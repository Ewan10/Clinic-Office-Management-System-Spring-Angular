import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, TimeoutError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleError(error: HttpErrorResponse | TimeoutError, message?: string) {
    let errorMessage = 'An unknown error occurred!';

    if (message) {
      errorMessage = message;
    } else if (error instanceof TimeoutError) {
      errorMessage = 'Request timed out. Please try again later.';
    }
    else if (error instanceof HttpErrorResponse && error.status === 0) {
      errorMessage = 'Network error: Unable to reach the backend server. Please check your connection.';
    }
    else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Please provide valid syntax of the input data.';
          break;
        case 401:
          errorMessage = 'Unauthorized access: Please log in to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested resource could not be found.';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
};
