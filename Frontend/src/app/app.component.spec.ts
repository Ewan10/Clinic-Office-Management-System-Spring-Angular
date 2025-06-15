import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { BehaviorSubject, of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let userSubject: BehaviorSubject<any>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  beforeEach(() => {
    userSubject = new BehaviorSubject({
      userName: 'tste',
      token: 'ooosdiofaofu',
      expiresIn: new Date(Date.now() + 3600000) // 1 hour from now
    });
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['autologin'],
      {
        user: userSubject.asObservable()
      }
    );

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthenticationService, useValue: authServiceSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call autologin and set isAuthenticated to true on ngOnInit', () => {
    expect(authServiceSpy.autologin).toHaveBeenCalled();
    expect(component.isAuthenticated).toBeTrue();
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).userSubscription = mockSubscription;
    component.ngOnDestroy();
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
