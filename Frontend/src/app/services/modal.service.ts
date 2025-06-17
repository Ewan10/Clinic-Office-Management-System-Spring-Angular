import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  router = inject(Router);
  constructor() {
    effect(() => {
      const result = this.confirm();
      const pending = this.pendingConfirmation();
      if (result !== null && pending) {
        pending.resolve(result);
        this.pendingConfirmation.set(null);
        this.modalType.set(null);
      }
    },
      { allowSignalWrites: true }
    );
  }

  modalType: ReturnType<typeof signal> = signal<string | null>(null);
  modalMessage: string;
  confirm = signal<boolean | null>(null);
  pendingConfirmation = signal<{
    resolve: (value: boolean) => void;
  } | null>(null);

  onConfirm(message: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.confirm.set(null);
        this.modalType.set(null);
        this.modalMessage = message;
        this.modalType.set('confirm');
        this.pendingConfirmation.set({ resolve });
        setTimeout(() => this.modalType.set('confirm'), 0);
      } catch (error) {
        reject('An error occurred.');
      }
    });
  }

  onNotify(message: string, path: string) {
    this.modalMessage = message;
    this.modalType.set('notify');
    setTimeout(() => {
      this.modalType.set(null)
      this.router.navigateByUrl(path);
    }, 2300);
  }

}
