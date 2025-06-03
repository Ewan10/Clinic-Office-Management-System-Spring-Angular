import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { exhaustMap, take, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { ErrorHandlerService } from './error-handler.service';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number,
  date: string,
  time: string,
  room: number,
  doctor: string,
  patientFirstName: string,
  patientLastName: string
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private authService = inject(AuthenticationService);
  private errorHandler = inject(ErrorHandlerService);
  private http = inject(HttpClient);

  url = environment.url;

  viewAll() {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.get<Appointment[]>(this.url + '/appointments',
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
          });
      }),
      catchError((error) => this.errorHandler.handleError(error, 'Failed to load appointments')),
    );
  }

  viewAppointment(id: number) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.get<Appointment>(this.url +
          `/appointments/${id}`,
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
          });
      }),
      catchError((error) => this.errorHandler.handleError(error, 'Failed to load appointment.')),
    );
  }

  registerAppointment(appointment: Appointment): Observable<HttpResponse<Appointment>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.post<Appointment>(this.url + '/appointments/makeAppointment', appointment,
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
            observe: 'response'
          });
      }),
      catchError((error) => this.errorHandler.handleError(error, 'Failed to register new appointment')),
    )
  }

  updateAppointment(appointment: Appointment): Observable<HttpResponse<Appointment>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.put<Appointment>(this.url + `/appointments/edit/${appointment.id}`, appointment,
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }),
            observe: 'response'
          });
      }),
      catchError((error) => this.errorHandler.handleError(error, 'Failed to update the appointment')),
    )
  }

  getappointmentName(id: number) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.get<{ firstName: string, lastName: string }>(this.url + `/appointments/${id}`,
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
          });
      }),
    );
  }

  getappointmentId(lastName: string, firstName: string) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.get<{ appointmentId: number }>(this.url + `/appointments/makeAppointment/${lastName}/${firstName}`,
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
          });
      }),
    );
  }

  deleteAppointment(id: number) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return this.http.delete<string>(this.url + `/appointments/${id}`,
          {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${user.token}` })
          });
      }),
      catchError((error) => this.errorHandler.handleError(error, 'Failed to delete the appointment')),
    )
  }

}
