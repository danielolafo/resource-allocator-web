import { toAllocationLevel, toAllocationRequest, withConstraints } from './allocation-mapper';
import {
  MOCK_ASSIGNMENTS,
  MOCK_EMPLOYEES,
  MOCK_PROJECTS,
  MOCK_TECHNOLOGIES,
} from '../mock/mock-data';

describe('allocation-mapper', () => {
  it('maps catalogs to the allocation contract', () => {
    const request = toAllocationRequest(
      MOCK_TECHNOLOGIES,
      MOCK_EMPLOYEES,
      MOCK_PROJECTS,
      MOCK_ASSIGNMENTS,
    );

    expect(request.technologies.length).toBe(MOCK_TECHNOLOGIES.length);
    expect(request.employees.length).toBe(MOCK_EMPLOYEES.length);
    expect(request.projects.length).toBe(MOCK_PROJECTS.length);
    expect(request.assignments.length).toBe(MOCK_ASSIGNMENTS.length);

    for (const employee of request.employees) {
      expect(employee.costPerDay).toBeGreaterThan(0);
      for (const skill of employee.technologies) {
        expect(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).toContain(skill.level);
      }
    }

    for (const project of request.projects) {
      expect(['ACTIVE', 'PLANNED', 'COMPLETED']).toContain(project.status);
      expect(project.dailyRate).toBeGreaterThan(0);
      for (const requirement of project.requiredTechnologies) {
        expect(requirement.count).toBeGreaterThan(0);
        expect(requirement.version.length).toBeGreaterThan(0);
      }
    }
  });

  it('adds constraints to a mapped request', () => {
    const base = toAllocationRequest([], [], [], []);
    const request = withConstraints(base, { maxTotalCost: 500 });
    expect(request.constraints?.maxTotalCost).toBe(500);
  });

  it('maps proficiency levels to allocation levels', () => {
    expect(toAllocationLevel('Experto')).toBe('EXPERT');
    expect(toAllocationLevel('Avanzado')).toBe('ADVANCED');
    expect(toAllocationLevel('Medio')).toBe('INTERMEDIATE');
    expect(toAllocationLevel('Básico')).toBe('BEGINNER');
  });
});