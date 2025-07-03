import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalsComponent } from './modals.component';
import { booleanAttribute, ElementRef, signal } from '@angular/core';


describe('ModalsComponent', () => {
  let component: ModalsComponent;
  let fixture: ComponentFixture<ModalsComponent>;
  let mockModalInstance: any;

  beforeEach(() => {
    mockModalInstance = jasmine.createSpyObj('Modal', ['show', 'hide']);
    (window as any).bootstrap = {
      Modal: jasmine.createSpy().and.returnValue(mockModalInstance)
    };

    TestBed.configureTestingModule({
      imports: [ModalsComponent]
    });
    fixture = TestBed.createComponent(ModalsComponent);
    component = fixture.componentInstance;
    component.modalElementRef = new ElementRef(document.createElement('div'));
    component.message = 'Are you sure?';
    component.deleteOk = signal<boolean | null>(null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create and show confirm modal', () => {
    component.type = 'confirm';
    fixture.detectChanges();
    component.ngAfterViewInit();
    expect((window as any).bootstrap.Modal).toHaveBeenCalled();
    expect(mockModalInstance.show).toHaveBeenCalled();
  });

  it('should show and auto-hide notify modal with timeout', (done) => {
    jasmine.clock().install();
    component.type = 'notify';
    fixture.detectChanges();
    component.ngAfterViewInit();
    jasmine.clock().tick(400);
    expect(mockModalInstance.show).toHaveBeenCalled();
    jasmine.clock().tick(2000);
    expect(mockModalInstance.hide).toHaveBeenCalled();
    jasmine.clock().uninstall();
    done();
  });

  it('should confirm and hide modal on OK', () => {
    component.modal = mockModalInstance;
    component.deleteOk = signal(false);
    component.onOk();
    expect(component.deleteOk()).toBeTrue();
    expect(mockModalInstance.hide).toHaveBeenCalled();
  });

  it('should cancel and hide modal on Cancel', () => {
    component.modal = mockModalInstance;
    component.deleteOk = signal(true);
    component.onCancel();
    expect(component.deleteOk()).toBeFalse();
    expect(mockModalInstance.hide).toHaveBeenCalled();
  });


});
