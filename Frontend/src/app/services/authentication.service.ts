import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../authentication/user.model';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user = new BehaviorSubject<User>(null);
  url = environment.url;
  constructor(private http: HttpClient,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) { }

  onSignUp(user) {
    return this.http.post<User>(this.url + '/signUp', user)
      .pipe(
        tap(response => {
          this.handleAuthentication(response);
        }),
        catchError((error) => this.errorHandler.handleError(error, 'Failed to sign up the user'))
      );
  }

  onLogin(user) {
    return this.http.post<User>(this.url + '/login', user)
      .pipe(
        tap(response => {
          this.handleAuthentication(response);
        }),
        catchError((error) => this.errorHandler.handleError(error, 'Failed to log in the user'))
      );
  }

  private handleAuthentication(user: User) {
    this.user.next(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

  }

  autologin() {
    const userString = localStorage.getItem('user');
    if (!userString) {
      return;
    }
    try {
      const user: { userName: string, token: string, expiresIn: string } = JSON.parse(userString);
      const loadedUser = new User(new Date(user.expiresIn), user.userName, user.token);

      if (loadedUser._token) {
        this.user.next(loadedUser);
      }
    } catch (error) {
      localStorage.removeItem('user');
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigateByUrl('/');
  }

}
