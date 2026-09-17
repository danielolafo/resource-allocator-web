import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AssignmentService } from './assignment.service';
import { Assignment } from '../models/assignment';
import { API_BASE_URL } from './api-config';
import { MOCK_ASSIGNMENTS } from '../mock/mock-data';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(AssignmentService);
    http = TestBed.inject(HttpTestingController);
    http.match(`${API_BASE_URL}/assignments`).forEach((req) => req.flush(MOCK_ASSIGNMENTS));
  });

  afterEach(() => http.verify());

  it('should mark employees whose assignment ends soon', () => {
    const finishing = service.employeesFinishingSoon(15);
    expect(finishing).toContain(1);
    expect(finishing).toContain(11);
    expect(finishing).not.toContain(14);
  });

  it('should report employees without an active project', () => {
    expect(service.hasActiveAssignment(6)).toBe(false);
    expect(service.hasActiveAssignment(4)).toBe(false);
  });

  it('should create one assignment per selected employee via POST', () => {
    const created$ = service.assignEmployees([1, 6], {
      projectId: 8,
      mode: 'HORAS',
      hoursPerDay: 4,
      startDate: '2026-01-01',
      endDate: '2026-02-01',
    });

    let created: Assignment[] | undefined;
    created$.subscribe((result) => (created = result));

    const posts = http.match(`${API_BASE_URL}/assignments`);
    expect(posts.length).toBe(2);
    posts.forEach((req, index) => req.flush({ ...req.request.body, id: 500 + index }));

    expect(created?.length).toBe(2);
    expect(created?.every((a) => a.projectId === 8 && a.hoursPerDay === 4)).toBe(true);
    expect(service.assignments().length).toBe(MOCK_ASSIGNMENTS.length + 2);
  });

  it('should detect overlapping assignments', () => {
    const overlaps = service.overlapForEmployee(1, '2026-01-01', '2026-12-31');
    expect(overlaps.some((a) => a.employeeId === 1)).toBe(true);
  });
});