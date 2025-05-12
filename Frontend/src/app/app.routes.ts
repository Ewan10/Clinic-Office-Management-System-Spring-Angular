import { Routes } from "@angular/router";
import { SignUpComponent } from "./authentication/sign-up/sign-up.component";
import { LoginComponent } from "./authentication/login/login.component";
import { PatientsComponent } from "./patients/patients/patients.component";
import { AuthGuard } from "./services/auth.guard";
import { PatientViewComponent } from "./patients/patient-view/patient-view.component";
import { PatientEditComponent } from "./patients/patient-edit/patient-edit.component";
import { PatientRegistrationComponent } from "./patients/patient-registration/patient-registration.component";
import { AppointmentsViewComponent } from "./appointments/appointments-view/appointments-view.component";
import { EditAppointmentsComponent } from "./appointments/edit-appointment/edit-appointments.component";
import { MakeAppointmentComponent } from "./appointments/make-appointment/make-appointment.component";
import { HomeComponent } from "./home/home.component";

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