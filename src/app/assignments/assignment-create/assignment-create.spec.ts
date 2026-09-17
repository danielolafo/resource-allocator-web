import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AssignmentCreate } from './assignment-create';
import { AssignmentService } from '../../shared/services/assignment.service';
import { API_BASE_URL } from '../../shared/services/api-config';
import { MOCK_ASSIGNMENTS, MOCK_EMPLOYEES, MOCK_PROJECTS, MOCK_TECHNOLOGIES } from '../../shared/mock/mock-data';

describe('AssignmentCreate', () => {
  let fixture: ComponentFixture<AssignmentCreate>;
  let component: AssignmentCreate;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [AssignmentCreate],
      providers: [provideRouter([]), AssignmentService, provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushCatalogs();
  });

  function flushCatalogs(): void {
    const http = TestBed.inject(HttpTestingController);
    http.match(`${API_BASE_URL}/employees`).forEach((req) => req.flush(MOCK_EMPLOYEES));
    http.match(`${API_BASE_URL}/projects`).forEach((req) => req.flush(MOCK_PROJECTS));
    http.match(`${API_BASE_URL}/technologies`).forEach((req) => req.flush(MOCK_TECHNOLOGIES));
    http.match(`${API_BASE_URL}/assignments`).forEach((req) => req.flush(MOCK_ASSIGNMENTS));
  }

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

    const http = TestBed.inject(HttpTestingController);
    const posts = http.match(`${API_BASE_URL}/assignments`);
    expect(posts.length).toBe(1);
    posts.forEach((req) => req.flush({ ...req.request.body, id: 9000 }));

    expect(service.assignments().length).toBe(before + 1);
    expect(component.successMessage()).toContain('Se asignaron 1 empleado(s)');
  });
});