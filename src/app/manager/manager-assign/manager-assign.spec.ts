import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ManagerAssign } from './manager-assign';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';
import { TechnologyService } from '../../shared/services/technology.service';
import { API_BASE_URL } from '../../shared/services/api-config';
import { MOCK_EMPLOYEES, MOCK_PROJECTS, MOCK_TECHNOLOGIES } from '../../shared/mock/mock-data';

describe('ManagerAssign', () => {
  let fixture: ComponentFixture<ManagerAssign>;
  let component: ManagerAssign;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [ManagerAssign],
      providers: [
        provideRouter([]),
        AssignmentService,
        EmployeeService,
        ProjectService,
        TechnologyService,
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerAssign);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushCatalogs();
  });

  function flushCatalogs(): void {
    const http = TestBed.inject(HttpTestingController);
    http.match(`${API_BASE_URL}/employees`).forEach((req) => req.flush(MOCK_EMPLOYEES));
    http.match(`${API_BASE_URL}/projects`).forEach((req) => req.flush(MOCK_PROJECTS));
    http.match(`${API_BASE_URL}/technologies`).forEach((req) => req.flush(MOCK_TECHNOLOGIES));
  }

  it('should show the manager user in the header', () => {
    expect(component.user.role).toBe('MANAGER');
    expect(component.user.name.length).toBeGreaterThan(0);
  });

  it('should list candidates when a project is selected', () => {
    component.form.patchValue({ projectId: 2 });
    expect(component.selectedProjectName()).toBeTruthy();
    expect(component.candidates().length).toBeGreaterThan(0);
  });

  it('should respect a project selection requirement', () => {
    component.form.patchValue({ projectId: null });
    component.submit();
    expect(component.errorMessage()).toContain('Debe seleccionar un proyecto');
  });

  it('should assign selected employees to the chosen project', () => {
    component.form.patchValue({ projectId: 3 });
    const first = component.candidates()[0];
    component.toggleSelection(first.employeeId);

    const service = TestBed.inject(AssignmentService);
    const before = service.assignments().length;
    component.submit();

    expect(service.assignments().length).toBe(before + 1);
    expect(component.successMessage()).toContain('Se asignaron 1 empleado(s)');
  });
});