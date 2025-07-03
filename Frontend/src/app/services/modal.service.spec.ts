import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { Router } from '@angular/router';

describe('ModalService', () => {
    let modalService: ModalService;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

        TestBed.configureTestingModule({
            providers: [
                ModalService,
                { provide: Router, useValue: routerSpy }
            ]
        });
        modalService = TestBed.inject(ModalService);
    });

    it('should be created', () => {
        expect(modalService).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(modalService.modalType()).toBeNull();
        expect(modalService.confirm()).toBeNull();
        expect(modalService.pendingConfirmation()).toBeNull();
    });

    it('should set modal type and message on confirm', fakeAsync(() => {
        const message = 'Are you sure?';
        const confirmPromise = modalService.onConfirm(message);
        expect(modalService.modalType()).toBe('confirm');
        const pending = modalService.pendingConfirmation();
        expect(pending).toBeDefined();
        pending.resolve(true);
        tick();
        confirmPromise.then(result => {
            expect(result).toBeTrue();
        });
    }));

    it('should resolve promise with false when confirm is set to false', async () => {
        const confirmPromise = modalService.onConfirm('Confirm?');
        modalService.confirm.set(false);
        const result = await confirmPromise;
        expect(result).toBeFalse();
    });

    it('should set modalType to notify and navigate after timeout', fakeAsync(() => {
        modalService.onNotify('Saved!', '/home');
        expect(modalService.modalType()).toBe('notify');
        expect(modalService.modalMessage).toBe('Saved!');
        tick(2300);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
    }));

    it('should clear pendingConfirmation and modalType after resolving confirm', async () => {
        const confirmPromise = modalService.onConfirm('Confirm?');
        expect(modalService.pendingConfirmation()).toBeTruthy();
        modalService.confirm.set(true);
        const result = await confirmPromise;
        expect(result).toBeTrue();
        expect(modalService.pendingConfirmation()).toBeNull();
        expect(modalService.modalType()).toBeNull();
    });

    it('should reject the confirm promise if error is thrown', async () => {
        spyOn(modalService.modalType, 'set').and.callFake(() => {
            throw new Error('Mock error');
        });
        try {
            await modalService.onConfirm('Should fail');
            fail('Expected promise to reject');
        } catch (error) {
            expect(error).toBe('An error occurred.');
        }
    });

});