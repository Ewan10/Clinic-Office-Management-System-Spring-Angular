import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { flatMap } from 'rxjs';

declare var bootstrap: any;
@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ModalsComponent implements AfterViewInit {
  @Input() type: 'confirm' | 'notify' | null = null;
  @Input() message: string;
  @Input() deleteOk;
  @ViewChild('modalElement') modalElementRef: ElementRef;
  modal: any;

  ngAfterViewInit() {
    const modalElement = this.modalElementRef?.nativeElement;
    if (this.modalElementRef) {
      const options = this.type === 'notify'
        ? {
          backdrop: false,
          keyboard: false
        }
        : {};
      this.modal = new bootstrap.Modal(modalElement, options);
      if (this.type === 'notify') {
        setTimeout(() => {
          this.modal.show();
          setTimeout(() => this.modal.hide(), 2000);
        }, 400);
      }
      else {
        this.modal.show();
      }
    }
  }

  onOk() {
    this.deleteOk.set(true);
    this.modal.hide();
  }

  onCancel() {
    this.deleteOk.set(false);
    this.modal.hide();
  }

}
