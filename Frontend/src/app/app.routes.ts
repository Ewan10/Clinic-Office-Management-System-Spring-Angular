import { Routes } from "@angular/router";
import { SignUpComponent } from "./components/authentication/sign-up/sign-up.component";
import { LoginComponent } from "./components/authentication/login/login.component";
import { PatientsComponent } from "./components/patients/patients/patients.component";
import { AuthGuard } from "./services/auth.guard";
import { PatientViewComponent } from "./components/patients/patient-view/patient-view.component";
import { PatientEditComponent } from "./components/patients/patient-edit/patient-edit.component";
import { PatientRegistrationComponent } from "./components/patients/patient-registration/patient-registration.component";
import { AppointmentsViewComponent } from "./components/appointments/appointments-view/appointments-view.component";
import { EditAppointmentsComponent } from "./components/appointments/edit-appointment/edit-appointments.component";
import { MakeAppointmentComponent } from "./components/appointments/make-appointment/make-appointment.component";
import { HomeComponent } from "./components/home/home.component";

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: '', canActivate: [AuthGuard],
        children: [
            { path: 'patients', component: PatientsComponent },
            { path: 'patients/view/:id', component: PatientViewComponent },
            { path: 'patients/edit/:id', component: PatientEditComponent },
            { path: 'patients/register', component: PatientRegistrationComponent },
            { path: 'appointments', component: AppointmentsViewComponent },
            { path: 'appointments/edit/:id', component: EditAppointmentsComponent },
            { path: 'appointments/makeAppointment', component: MakeAppointmentComponent },
        ],
    },
    { path: 'signUp', component: SignUpComponent },
    { path: 'login', component: LoginComponent },
];

export const routes = appRoutes;