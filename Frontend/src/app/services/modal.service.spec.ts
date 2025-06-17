import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { Router } from '@angular/router';

describe('ModalService', () => {
    let service: ModalService;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

        TestBed.configureTestingModule({
            providers: [
                ModalService,
                { provide: Router, useValue: routerSpy }
            ]
        });
        service = TestBed.inject(ModalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(service.modalType()).toBeNull();
        expect(service.confirm()).toBeNull();
        expect(service.pendingConfirmation()).toBeNull();
    });

    it('should set modal type and message on confirm', fakeAsync(() => {
        const message = 'Are you sure?';
        const confirmPromise = service.onConfirm(message);

        expect(service.modalType()).toBe('confirm');
        const pending = service.pendingConfirmation();
        expect(pending).toBeDefined();

        pending.resolve(true);
        tick();

        confirmPromise.then(result => {
            expect(result).toBeTrue();
        });
    }));
});