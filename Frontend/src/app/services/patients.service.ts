import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthenticationService } from "./authentication.service";
import { catchError, exhaustMap, map, take, timeout } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { ErrorHandlerService } from "./error-handler.service";

export interface Patient {
    id: number,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    healthInsuranceNumber: number,
    age: number,
    gender: string,
    history: string
}

@Injectable({
    providedIn: 'root'
})
export class PatientsService {
    constructor(
        private http: HttpClient,
        private authService: AuthenticationService,
        private errorHanlder: ErrorHandlerService
    ) { }

    private patientsSubject = new BehaviorSubject<Patient[]>([]);
    patients$ = this.patientsSubject.asObservable();

    url = environment.url;
    patient: Patient | null = null;

    setPatient(patient: Patient) {
        this.patient = patient;
    }

    getPatient(): Patient | null {
        return this.patient;
    }

    registerPatient(patient: Patient): Observable<HttpResponse<Patient>> {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.post<Patient>(this.url + '/patients/register', patient,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
                        observe: 'response'
                    });
            }),
            catchError((error) => this.errorHanlder.handleError(error, 'Failed to register patient'))
        )
    }

    viewAll() {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.get<{ [key: string]: Patient }>(this.url + '/patients',
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
                    }).pipe(
                        timeout(3000)
                    );
            }),
            catchError((error) => this.errorHanlder.handleError(error)),
            map((response) => {
                const patients = [];
                for (const key in response) {
                    if (response.hasOwnProperty(key)) {
                        patients.push({ ...response[key] })
                    }
                }
                return patients;
            })
        );
    }

    viewPatient(id: any) {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.get<Patient>(this.url + `/patients/view/${id}`,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
                    });
            }),
            catchError((error) => this.errorHanlder.handleError(error, 'Failed to load patient.')),
        )
    }

    updatePatient(patient: Patient): Observable<HttpResponse<Patient>> {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.put<Patient>(this.url + `/patients/edit/${patient.id}`, patient,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
                        observe: 'response'
                    });
            }),
            catchError((error) => this.errorHanlder.handleError(error, 'Failed to update patient')),
        )
    }

    deletePatient(id: number) {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.delete<string>(this.url + `/patients/${id}`,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
                    })
            }),
            catchError((error) => this.errorHanlder.handleError(error, 'Failed to delete patient')),
        )
    }
}