import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionsComponent } from './prescriptions.component';
import { PatientsService } from '../../services/patients.service';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

describe('PrescriptionsComponent', () => {
  let component: PrescriptionsComponent;
  let fixture: ComponentFixture<PrescriptionsComponent>;
  let patientsServiceSpy: jasmine.SpyObj<PatientsService>;

  beforeEach(async () => {
    patientsServiceSpy = jasmine.createSpyObj('PatientsService', ['createPrescription']);


    await TestBed.configureTestingModule({
      imports: [PrescriptionsComponent],
      providers: [
        { provide: PatientsService, useValue: patientsServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrescriptionsComponent);
    component = fixture.componentInstance;
    patientsServiceSpy = TestBed.inject(PatientsService) as jasmine.SpyObj<PatientsService>;

    patientsServiceSpy.createPrescription.and.returnValue(of(new HttpResponse({
      body: {
        id: null,
        date: '2025-06-01',
        diagnosis: 'Uric acid',
        medicines: ['Zylapour', 'Mucosol']
      },
      status: 201
    })
    )
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
