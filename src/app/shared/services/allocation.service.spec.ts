import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AllocationService } from './allocation.service';
import { MOCK_ALLOCATION_REQUEST } from '../mock/mock-allocation-request';
import { AllocationRequest } from '../models/allocation';

describe('AllocationService', () => {
  let service: AllocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), AllocationService],
    });
    service = TestBed.inject(AllocationService);
  });

  it('should return the real /allocation contract with assignments and summary', () => {
    const response = service.runLocalAllocator(MOCK_ALLOCATION_REQUEST);

    expect(response.algorithm).toBe('local-backup');
    expect(Array.isArray(response.assignments)).toBe(true);
    expect(response.assignments.length).toBeGreaterThan(MOCK_ALLOCATION_REQUEST.assignments.length);

    expect(response.summary.totalEmployees).toBe(MOCK_ALLOCATION_REQUEST.employees.length);
    expect(response.summary.totalProjects).toBe(MOCK_ALLOCATION_REQUEST.projects.length);
    expect(response.summary.occupiedEmployees).toBe(new Set(response.assignments.map((a) => a.employeeId)).size);
    expect(response.summary.idleEmployees).toBe(
      response.summary.totalEmployees - response.summary.occupiedEmployees,
    );
    expect(response.summary.totalAssignedDays).toBeGreaterThan(0);
    expect(response.summary.horizonEnd >= response.summary.today).toBe(true);
  });

  it('should keep existing assignments and mark generated ones as auto-assigned', () => {
    const response = service.runLocalAllocator(MOCK_ALLOCATION_REQUEST);

    const existing = response.assignments.filter((a) => a.notes === '');
    const generated = response.assignments.filter((a) => a.notes === 'auto-assigned');
    expect(existing.length).toBe(MOCK_ALLOCATION_REQUEST.assignments.length);
    expect(generated.length).toBeGreaterThan(0);
  });

  it('should respect the max total cost constraint', () => {
    const request: AllocationRequest = {
      ...MOCK_ALLOCATION_REQUEST,
      constraints: { maxTotalCost: 0, preferLowestCost: true },
    };
    const response = service.runLocalAllocator(request);

    expect(response.assignments.length).toBe(MOCK_ALLOCATION_REQUEST.assignments.length);
    expect(response.assignments.every((a) => a.notes !== 'auto-assigned')).toBe(true);
    expect(response.warnings.length).toBeGreaterThan(0);
  });

  it('should not create overlapping assignments for the same employee', () => {
    const response = service.runLocalAllocator(MOCK_ALLOCATION_REQUEST);

    const byEmployee = new Map<number, typeof response.assignments>();
    for (const assignment of response.assignments) {
      const list = byEmployee.get(assignment.employeeId) ?? [];
      list.push(assignment);
      byEmployee.set(assignment.employeeId, list);
    }

    for (const assignments of byEmployee.values()) {
      const sorted = [...assignments].sort((a, b) => a.startDate.localeCompare(b.startDate));
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].startDate > sorted[i - 1].endDate).toBe(true);
      }
    }
  });

  it('should only auto-assign employees that cover a project requirement', () => {
    const response = service.runLocalAllocator(MOCK_ALLOCATION_REQUEST);
    const requirementsByProject = new Map(
      MOCK_ALLOCATION_REQUEST.projects.map((p) => [p.id, p.requiredTechnologies]),
    );
    const skillsById = new Map(
      MOCK_ALLOCATION_REQUEST.employees.map((employee) => [
        employee.id,
        new Map(employee.technologies.map((skill) => [skill.technologyId, skill])),
      ]),
    );

    for (const assignment of response.assignments) {
      if (assignment.notes !== 'auto-assigned') {
        continue;
      }
      const requirements = requirementsByProject.get(assignment.projectId) ?? [];
      const skills = skillsById.get(assignment.employeeId) ?? new Map();
      const covers = requirements.some((requirement) => {
        const skill = skills.get(requirement.technologyId);
        return !!skill && skill.yearsExperience >= requirement.minYearsExperience;
      });
      expect(covers).toBe(true);
    }
  });
});