import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;

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
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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

  it('should set errorMessage and reset isLoading on login failure', () => {
    authServiceSpy.onLogin.and.returnValue(throwError(() => 'Invalid credentials'));

    const form = {
      value: { username: 'Veron', _password: 'iofio' }
    } as NgForm;

    jasmine.clock().install();
    component.onLogin(form);

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid credentials');

    jasmine.clock().tick(2000);
    expect(component.errorMessage).toBeNull();
    jasmine.clock().uninstall();
  });

  it('should emit user in autologin if localStorage has valid user', () => {
    const mockUser = {
      userName: 'john',
      _token: 'abc123',
      expiresIn: new Date(Date.now() + 10000).toISOString()
    };
    localStorage.setItem('user', JSON.stringify(mockUser));

    const spy = jasmine.createSpy();
    component.userBehSub.subscribe(spy);

    component.autologin();
    const emittedUser = spy.calls.mostRecent().args[0];

    expect(emittedUser).toEqual(jasmine.any(User));
    expect(emittedUser.userName).toBe('john');
    expect(emittedUser.token).toBe('abc123');
  });

  it('should not emit if localStorage has no user', () => {
    localStorage.removeItem('user');
    const spy = jasmine.createSpy();
    component.userBehSub.subscribe(user => {
      if (user !== null) {
        spy(user);
      }
    });
    component.autologin();
    expect(spy).not.toHaveBeenCalled();
  });


});
