import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { AssignmentCreate } from './assignment-create';
import { AssignmentService } from '../../shared/services/assignment.service';

describe('AssignmentCreate', () => {
  let fixture: ComponentFixture<AssignmentCreate>;
  let component: AssignmentCreate;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [AssignmentCreate],
      providers: [provideRouter([]), AssignmentService],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should list employees finishing soon for the PROXIMOS target', () => {
    component.form.patchValue({ target: 'PROXIMOS', thresholdDays: 15, projectId: 2 });
    const candidates = component.candidates();
    expect(candidates.some((c) => c.finishing)).toBe(true);
  });

  it('should list employees without project for the SIN_PROYECTO target', () => {
    component.form.patchValue({ target: 'SIN_PROYECTO', projectId: 5 });
    const candidates = component.candidates();
    expect(candidates.some((c) => c.withoutProject)).toBe(true);
  });

  it('should assign selected employees to the chosen project', () => {
    component.form.patchValue({ target: 'PROXIMOS', thresholdDays: 15, projectId: 2 });
    const candidates = component.candidates();
    const first = candidates[0];
    component.toggleSelection(first.employeeId);

    const service = TestBed.inject(AssignmentService);
    const before = service.assignments().length;
    component.submit();

    expect(service.assignments().length).toBe(before + 1);
    expect(component.successMessage()).toContain('Se asignaron 1 empleado(s)');
  });
});