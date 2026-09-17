import { TestBed } from '@angular/core/testing';
import { AssignmentService } from './assignment.service';

describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentService);
  });

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

  it('should create one assignment per selected employee', () => {
    const created = service.assignEmployees([1, 6], {
      projectId: 8,
      mode: 'HORAS',
      hoursPerDay: 4,
      startDate: '2026-01-01',
      endDate: '2026-02-01',
    });

    expect(created.length).toBe(2);
    expect(created.every((a) => a.projectId === 8 && a.hoursPerDay === 4)).toBe(true);
    expect(service.assignments().length).toBeGreaterThan(created.length);
  });

  it('should detect overlapping assignments', () => {
    const overlaps = service.overlapForEmployee(1, '2026-01-01', '2026-12-31');
    expect(overlaps.some((a) => a.employeeId === 1)).toBe(true);
  });
});