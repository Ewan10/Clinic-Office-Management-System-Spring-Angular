import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { ErrorHandlerService } from './error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let httpMock: HttpTestingController;
    let mockUser: { userName: string, password: string };
    let mockResponse: { expiresIn: Date | number, userName: string, token: string, _token: string };
    let errorResponse: HttpErrorResponse;
    let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

    beforeEach(() => {
        mockUser = { userName: 'testUser', password: 'testPass' };
        mockResponse = { expiresIn: new Date(Date.now() + 3600 * 1000), userName: 'testUser', token: '12345', _token: '12345' };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthenticationService,
                { provide: ErrorHandlerService, useValue: jasmine.createSpyObj('ErrorHandlerService', ['handleError']) }
            ]
        });
        service = TestBed.inject(AuthenticationService);
        errorHandlerSpy = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
        httpMock = TestBed.inject(HttpTestingController);

        errorResponse = new HttpErrorResponse({
            error: 'Invalid credentials',
            status: 401,
            statusText: 'Unauthorized'
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send POST request with user data to /login', () => {
        service.onLogin(mockUser).subscribe();

        const req = httpMock.expectOne(service['url'] + '/login');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockUser);
        req.flush(mockResponse);
    })

    it('should call handleAuthentication with the response', () => {
        spyOn(service as any, 'handleAuthentication');

        service.onLogin(mockUser).subscribe();
        const req = httpMock.expectOne(service['url'] + '/login');
        req.flush(mockResponse);
        expect((service as any).handleAuthentication).toHaveBeenCalledWith(mockResponse);
    });

    it('should call errorHandler.handleError on HTTP error', () => {
        service.onLogin(mockUser).subscribe({
            error: () => {
                expect(service['errorHandler'].handleError).toHaveBeenCalledWith(jasmine.objectContaining({
                    status: 401,
                    error: 'Invalid credentials',
                }),
                    'Failed to log in the user'
                );
            }
        });
        const req = httpMock.expectOne(service['url'] + '/login');
        req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });

    it('should do nothing if there is no user in localStorage', () => {
        spyOn(localStorage, 'getItem').and.returnValue(null);
        const userSpy = spyOn(service.user, 'next');

        service.autologin();
        expect(userSpy).not.toHaveBeenCalled();
    });

    it('should set user from localStorage if user data already exists in localStorage', () => {

        spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockResponse));
        const userSpy = spyOn(service.user, 'next');

        service.autologin();
        expect(userSpy).toHaveBeenCalled();
        const loadedUser = userSpy.calls.mostRecent().args[0];
        expect(loadedUser.userName).toBe(mockResponse.userName);
        expect(loadedUser._token).toBe(mockResponse.token);
    });

    it('should remove user from localStorage if JSON is invalid', () => {
        spyOn(localStorage, 'getItem').and.returnValue('invalid json');
        const removeSpy = spyOn(localStorage, 'removeItem');

        service.autologin();
        expect(removeSpy).toHaveBeenCalledWith('user');
    });

    it('should send POST request to signUp endpoint', () => {
        service.onSignUp(mockUser).subscribe(res => {
            expect(res).toEqual(mockResponse);

            const req = httpMock.expectOne(service['url'] + '/signUp');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockUser);

            req.flush(mockResponse);
        });
    });

    it('should call handleError on HTTP error', () => {
        service.onSignUp(mockUser).subscribe({
            error: () => {
                expect(service['errorHandler'].handleError).toHaveBeenCalledWith(jasmine.any(HttpErrorResponse),
                    'Failed to sign up the user');
            }
        });

        const req = httpMock.expectOne(service['url'] + '/signUp');
        req.flush(errorResponse.error, { status: errorResponse.status, statusText: errorResponse.statusText });
    })
});