import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';
import { of, BehaviorSubject, from, isObservable } from 'rxjs';
import { User } from '../models/user.model';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const dummyRoute = {} as ActivatedRouteSnapshot;
    const dummyState = {} as RouterStateSnapshot;

    beforeEach(() => {
        authServiceSpy = {
            user: new BehaviorSubject({
                userName: 'tste',
                token: 'ooosdiofaofu',
                expiresIn: new Date(Date.now() + 3600000)
            })
        } as Partial<AuthenticationService> as jasmine.SpyObj<AuthenticationService>;
        routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthenticationService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });

        guard = TestBed.inject(AuthGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    it('should allow access if user is authenticated', (done) => {
        const mockUser = new BehaviorSubject({
            userName: 'tste',
            token: 'ooosdiofaofu',
            expiresIn: new Date(Date.now() + 3600000)
        });
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthenticationService, useValue: { user: mockUser } },
                { provide: Router, useValue: routerSpy }
            ]
        });

        guard = TestBed.inject(AuthGuard);

        const result = guard.canActivate(dummyRoute, dummyState);
        const result$ = isObservable(result) ? result : result instanceof Promise
            ? from(result)
            : of(result);

        result$.subscribe(result => {
            expect(result).toBeTrue();
            done();
        });
    });

    it('should redirect to login if user is not authenticated', (done) => {
        const fakeUrlTree = {} as UrlTree;
        authServiceSpy.user = new BehaviorSubject<User | null>(null);
        routerSpy.createUrlTree.and.returnValue(fakeUrlTree);

        guard = TestBed.inject(AuthGuard);

        const result = guard.canActivate(dummyRoute, dummyState);
        const result$ = isObservable(result)
            ? result
            : result instanceof Promise
                ? from(result)
                : of(result);

        result$.subscribe(res => {
            expect(res).toBe(fakeUrlTree);
            expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/']);
            done();
        });
    });
});