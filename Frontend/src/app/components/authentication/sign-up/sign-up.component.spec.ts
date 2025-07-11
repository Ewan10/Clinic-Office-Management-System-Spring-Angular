import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const mockUser = { expiresIn: 22039444, userName: 'oneUser', token: '123abc', _token: '' };

  const mockForm = {
    value: {
      username: 'testUser',
      email: 'test@mail.com',
      password: 'pass123',
      confirmPassword: 'pass123'
    },
    reset: jasmine.createSpy('reset')
  } as unknown as NgForm;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['onSignUp']);

    TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sign up a new user', () => {

    authServiceSpy.onSignUp.and.returnValue(of(mockUser));
    component.onSignUp(mockForm);
    expect(authServiceSpy.onSignUp).toHaveBeenCalledWith({
      userName: 'testUser',
      email: 'test@mail.com',
      password: 'pass123'
    });

    expect(component.user).toEqual(mockUser);
    expect(component.isLoading).toBeFalse();
    expect(mockForm.reset).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set formInvalid and errorMessage when passwords do not match', () => {
    const form = {
      value: {
        username: 'oneUser',
        email: 'one@mail.com',
        password: 'pass',
        confirmPassword: 'wrong'
      }
    } as NgForm;
    component.onSignUp(form);

    expect(component.formInvalid).toBeTrue();
    expect(component.errorMessage).toBeTruthy();
    expect(authServiceSpy.onSignUp).not.toHaveBeenCalled();
  })

  it('should set errorMessage on signup error', () => {
    authServiceSpy.onSignUp.and.returnValue(throwError(() => 'Signup failed'));
    component.onSignUp(mockForm);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Signup failed');
  });

});
