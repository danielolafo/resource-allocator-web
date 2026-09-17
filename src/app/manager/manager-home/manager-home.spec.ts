import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ManagerHome } from './manager-home';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';
import { API_BASE_URL } from '../../shared/services/api-config';
import { MOCK_ASSIGNMENTS, MOCK_EMPLOYEES, MOCK_PROJECTS } from '../../shared/mock/mock-data';

describe('ManagerHome', () => {
  let fixture: ComponentFixture<ManagerHome>;
  let component: ManagerHome;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ManagerHome],
      providers: [
        AssignmentService,
        EmployeeService,
        ProjectService,
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushCatalogs();
  });

  function flushCatalogs(): void {
    const http = TestBed.inject(HttpTestingController);
    http.match(`${API_BASE_URL}/employees`).forEach((req) => req.flush(MOCK_EMPLOYEES));
    http.match(`${API_BASE_URL}/projects`).forEach((req) => req.flush(MOCK_PROJECTS));
    http.match(`${API_BASE_URL}/assignments`).forEach((req) => req.flush(MOCK_ASSIGNMENTS));
  }

  it('should render the manager role badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Rol: MANAGER');
    expect(component.user.role).toBe('MANAGER');
  });

  it('should expose summary computed values', () => {
    expect(component.totalEmployees()).toBeGreaterThan(0);
    expect(component.occupiedEmployees()).toBeGreaterThan(0);
    expect(component.idleEmployees()).toBeGreaterThanOrEqual(0);
    expect(component.activeProjects()).toBeGreaterThan(0);
  });

  it('should list only non-finished assignments as assigned employees', () => {
    const service = TestBed.inject(AssignmentService);
    const finished = service.assignments().filter(
      (a) => service.statusOf(a) === 'FINALIZADA',
    ).length;
    expect(component.rows().length).toBe(service.assignments().length - finished);
    expect(component.rows().every((row) => row.status !== 'FINALIZADA')).toBe(true);
  });

  it('should navigate to the assign page from the action button', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[href="/manager/asignar"]') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/manager/asignar');
  });
});