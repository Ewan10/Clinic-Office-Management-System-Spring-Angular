import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from './error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

describe('ErrorHandlerService', () => {
  let errorService: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    errorService = TestBed.inject(ErrorHandlerService);
  });

  function getErrorMessage(observable) {
    let errorMessage: string;
    observable.subscribe({
      error: (error) => errorMessage = error.message
    });
    return errorMessage;
  }

  it('should be created', () => {
    expect(errorService).toBeTruthy();
  });

  it('should return custom message if provided', () => {
    const customMessage = 'Custom error occurred';
    const error = new HttpErrorResponse({ status: 400 });
    const result = errorService.handleError(error, customMessage);
    expect(getErrorMessage(result)).toBe(customMessage);
  });

  it('should return timeout error message', () => {
    const error = new TimeoutError();
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Request timed out. Please try again later.');
  });

  it('should return network error message for status 0', () => {
    const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Network error: Unable to reach the backend server. Please check your connection.');
  });

  it('should return message for client-side error event', () => {
    const errorEvent = new ErrorEvent('TestError', { message: 'Client-side error' });
    const error = new HttpErrorResponse({ error: errorEvent, status: 500 });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Error: Client-side error');
  });

  it('should return message for 400 Bad Request', () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Bad Request: Please provide valid syntax of the input data.');
  });

  it('should return message for 401 Unauthorized', () => {
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Unauthorized access: Please log in to access this resource.');
  });

  it('should return message for 404 Not Found', () => {
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('The requested resource could not be found.');
  });

  it('should return message for 500 Internal Server Error', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Internal Server Error: Please try again later.');
  });

  it('should return fallback message for unknown error status', () => {
    const error = new HttpErrorResponse({ status: 418, statusText: 'I\'m a teapot', error: 'Something weird' });
    const result = errorService.handleError(error);
    expect(getErrorMessage(result)).toBe('Error: Http failure response for (unknown url): 418 I\'m a teapot');
  });

});
