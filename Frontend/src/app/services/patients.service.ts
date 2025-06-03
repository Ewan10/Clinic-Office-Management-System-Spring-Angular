import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthenticationService } from "./authentication.service";
import { catchError, exhaustMap, map, take, timeout } from "rxjs/operators";
import { BehaviorSubject, Observable } from "rxjs";
import { ErrorHandlerService } from "./error-handler.service";
import { PatientBasic, PatientDetailed, Prescription } from "../models";

@Injectable({
    providedIn: 'root'
})
export class PatientsService {
    authService = inject(AuthenticationService);
    http = inject(HttpClient);
    errorHandler = inject(ErrorHandlerService);
    private patientsSubject = new BehaviorSubject<PatientDetailed | null>(null);
    patients$ = this.patientsSubject.asObservable();

    url = environment.url;
    patient: PatientDetailed | null = null;

    setPatient(patient: PatientDetailed) {
        this.patient = patient;
        this.patientsSubject.next(patient);
    }

    getPatient(): PatientDetailed | null {
        return this.patient;
    }

    registerPatient(patient: PatientDetailed): Observable<HttpResponse<PatientDetailed>> {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.post<PatientDetailed>(this.url + '/patients/register', patient,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
                        observe: 'response'
                    });
            }),
            catchError((error) => this.errorHandler.handleError(error, 'Failed to register patient'))
        )
    }

    viewAll() {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.get<{ [key: string]: PatientBasic }>(this.url + '/patients',
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
                    }).pipe(
                        timeout(3000)
                    );
            }),
            catchError((error) => this.errorHandler.handleError(error)),
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
                return this.http.get<PatientDetailed>(this.url + `/patients/view/${id}`,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
                    });
            }),
            catchError((error) => this.errorHandler.handleError(error, 'Failed to load patient.')),
        )
    }

    updatePatient(patient: PatientDetailed): Observable<HttpResponse<PatientDetailed>> {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.put<PatientDetailed>(this.url + `/patients/edit/${patient.id}`, patient,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
                        observe: 'response'
                    });
            }),
            catchError((error) => this.errorHandler.handleError(error, 'Failed to update patient')),
        )
    }

    createPrescription(patientId: number, prescription: any): Observable<HttpResponse<Prescription>> {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                return this.http.post<Prescription>(this.url + `/patients/view/${patientId}/prescriptions`, prescription,
                    {
                        headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
                        observe: 'response'
                    });
            }),
            catchError((error) => this.errorHandler.handleError(error, 'Failed to create prescription')),
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
            catchError((error) => this.errorHandler.handleError(error, 'Failed to delete patient')),
        )
    }
}