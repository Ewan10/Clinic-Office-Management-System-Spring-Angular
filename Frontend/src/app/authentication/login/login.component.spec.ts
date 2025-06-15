import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NgForm } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const mockResponse = {
    user:
      { expiresIn: 22039444, userName: 'oneUser', token: '123abc', _token: '' }
  };

  const mockForm = {
    value: {
      username: 'oneUser',
      _password: 'passiento'
    }
  } as NgForm;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['onLogin']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login an existing user', () => {
    authServiceSpy.onLogin.and.returnValue(of(mockResponse.user));

    component.onLogin(mockForm);

    expect(component.user).toEqual(mockResponse.user);
    expect(component.isLoading).toBeFalse();
    expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockResponse.user));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  })
});
