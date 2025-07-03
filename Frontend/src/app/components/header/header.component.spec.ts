import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/models/user.model';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
    let router: Router;
    let userSubject: BehaviorSubject<User | null>;

    const mockUser = {
        expiresIn: 22039444, userName: 'oneUser', token: '123abc', _token: ''
    };

    beforeEach(async () => {
        userSubject = new BehaviorSubject<User | null>(null);
        authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['logout'], {
            user: userSubject.asObservable(),
        });
        await TestBed.configureTestingModule({
            imports: [HeaderComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: AuthenticationService, useValue: authServiceSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
            ]
        });
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isAuthenticated to false when user is null', () => {
        userSubject.next(null);
        expect(component.isAuthenticated).toBeFalse();
    });

    it('should set isAuthenticated to true when user is present', () => {
        userSubject.next(mockUser);
        expect(component.isAuthenticated).toBeTrue();
    });

    it('should call logout on authService when onLogout is triggered', () => {
        component.onLogout();
        expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should navigate to /patients when onPatients is called', () => {
        component.onPatients();
        expect(router.navigate).toHaveBeenCalledWith(['/patients']);
    });

    it('should unsubscribe from userSubscriprition on destroy', () => {
        component.ngOnInit();
        const unsubscribeSpy = spyOn(component['userSubscription'], 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
    });

});