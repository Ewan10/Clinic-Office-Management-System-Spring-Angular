import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { Appointment, AppointmentsService } from "./appointments.service";
import { AuthenticationService } from "./authentication.service";
import { ErrorHandlerService } from "./error-handler.service";
import { User } from "../models/user.model";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";

describe('AppointmentsService', () => {
    let service: AppointmentsService;
    let httpMock: HttpTestingController;
    let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
    let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

    const mockUser = new User(new Date(Date.now() + 3600000), 'testuser', 'validtoken');

    const mockAppointments = [{
        id: 1, date: '2025-06-20', time: '10:20HM', room: 300,
        doctor: 'Dr Altogarcia',
        patientFirstName: 'Veron',
        patientLastName: 'Batista'
    }
    ] as Appointment[];

    const mockAppointmnet = {
        id: 1, date: '2025-06-20', time: '10:20HM', room: 300,
        doctor: 'Dr Altogarcia',
        patientFirstName: 'Veron',
        patientLastName: 'Batista'
    } as Appointment;

    function expectErrorHandlerCalled<T>(
        observable: Observable<T>,
        expectedUrl: string,
        expectedMessage: string,
        httpMock: HttpTestingController,
        errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>,
        httpError = 'Error',
        status = 500,
        statusText = 'Server Error') {
        observable.subscribe({
            next: () => fail('expected error'),
            error: () => {
                expect(errorHandlerSpy.handleError).toHaveBeenCalledWith(
                    jasmine.any(HttpErrorResponse),
                    expectedMessage
                );
            }
        });
        const req = httpMock.expectOne(expectedUrl);
        req.flush(httpError, { status, statusText });
    }

    function expectHttpSuccess<T>(
        httpMethod: Observable<T | HttpResponse<T>>,
        expectedUrl: string,
        expectedMethod: string,
        expectedResponse: T,
        expectedHeaders: {},
        responseWrapped: boolean,
        httpMock: HttpTestingController,
        done: DoneFn,
        statusText = 'OK'
    ) {
        httpMethod.subscribe({
            next: (response) => {
                const data = responseWrapped ? (response as HttpResponse<T>).body : response;
                expect(data).toEqual(expectedResponse);
                done();
            },
            error: () => {
                fail('Expected successful response, but got an error');
                done();
            }
        });
        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe(expectedMethod);

        for (const [key, value] of Object.entries(expectedHeaders)) {
            expect(req.request.headers.get(key)).toBe(value as string);
        }

        if (responseWrapped) {
            req.flush(mockAppointmnet, { status: 201, statusText });
        }
        else {
            req.flush(expectedResponse);
        }
    }

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthenticationService', [], {
            user: new BehaviorSubject(mockUser)
        });
        const errorSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AppointmentsService,
                { provide: AuthenticationService, useValue: authSpy },
                { provide: ErrorHandlerService, useValue: errorSpy }
            ]
        });
        service = TestBed.inject(AppointmentsService);
        httpMock = TestBed.inject(HttpTestingController);
        authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
        errorHandlerSpy = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch appointments with authorization header', (done) => {
        expectHttpSuccess(
            service.viewAll(),
            `${service['url']}/appointments`,
            'GET',
            mockAppointments,
            { 'Authorization': `Bearer ${mockUser.token}` },
            false,
            httpMock,
            done
        );
    });

    it('should call errorHandler.handleError on HTTP error for viewAll', (done) => {
        expectErrorHandlerCalled(service.viewAll(),
            service['url'] + '/appointments',
            'Failed to load appointments',
            httpMock,
            errorHandlerSpy
        );
        done();
    });

    it('should fetch a specific appointment with authorization header', (done) => {
        service.viewAppointment(1).subscribe(appointment => {
            expect(appointment).toEqual(mockAppointmnet);
            done();
        });
        const req = httpMock.expectOne(`${service.url}/appointments/1`);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockUser.token}`);
        req.flush(mockAppointmnet);
    });

    it('should call errorHandler.handleError on HTTP error for viewAppointment', (done) => {
        expectErrorHandlerCalled(service.viewAppointment(1),
            service['url'] + '/appointments/1',
            'Failed to load appointment.',
            httpMock,
            errorHandlerSpy,
            'Error',
            404,
            'Not Found'
        );
        done();
    });

    it('should register a new appointment with authorization header', (done) => {
        expectHttpSuccess(
            service.registerAppointment(mockAppointmnet),
            `${service['url']}/appointments/makeAppointment`,
            'POST',
            mockAppointmnet,
            { 'Authorization': `Bearer ${mockUser.token}` },
            true,
            httpMock,
            done
        );
    });

    it('should update a new appointment with authorization header', (done) => {
        expectHttpSuccess(
            service.updateAppointment(mockAppointmnet),
            `${service['url']}/appointments/edit/${mockAppointmnet.id}`,
            'PUT',
            mockAppointmnet,
            { 'Authorization': `Bearer ${mockUser.token}` },
            true,
            httpMock,
            done
        );
    });

    it('should delete an appointment with authorization header', (done) => {
        expectHttpSuccess(
            service.deleteAppointment(mockAppointmnet.id),
            `${service['url']}/appointments/${mockAppointmnet.id}`,
            'DELETE',
            null,
            { 'Authorization': `Bearer ${mockUser.token}` },
            false,
            httpMock,
            done
        );
    });

});
