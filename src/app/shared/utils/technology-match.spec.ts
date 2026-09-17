import { Employee } from '../models/employee';
import { Project } from '../models/project';
import { evaluateEmployeeForProject, LEVEL_ORDER } from './technology-match';

const technologyName = (id: number): string => `Tech-${id}`;

const buildProject = (requiredTechnologies: Project['requiredTechnologies']): Project => ({
  id: 1,
  name: 'Proyecto',
  description: '',
  client: 'Cliente',
  status: 'Activo',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  requiredTechnologies,
});

describe('technology-match', () => {
  it('should order proficiency levels', () => {
    expect(LEVEL_ORDER['Básico']).toBeLessThan(LEVEL_ORDER['Experto']);
  });

  it('should return 100% when the employee covers every requirement', () => {
    const employee: Employee = {
      id: 1,
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      position: 'Dev',
      hireDate: '2020-01-01',
      costPerDay: 220,
      technologies: [
        { technologyId: 1, level: 'Experto', version: '21', yearsExperience: 6 },
        { technologyId: 2, level: 'Medio', version: '5', yearsExperience: 2 },
      ],
    };

    const project = buildProject([
      { technologyId: 1, minLevel: 'Avanzado', minYearsExperience: 2 },
      { technologyId: 2, minLevel: 'Medio', minYearsExperience: 1 },
    ]);

    const result = evaluateEmployeeForProject(employee, project, technologyName);
    expect(result.satisfied).toBe(true);
    expect(result.percentage).toBe(100);
  });

  it('should flag missing or insufficient mastery as not satisfied', () => {
    const employee: Employee = {
      id: 2,
      firstName: 'C',
      lastName: 'D',
      email: 'c@d.com',
      position: 'Dev',
      hireDate: '2021-01-01',
      costPerDay: 200,
      technologies: [
        { technologyId: 1, level: 'Básico', version: '21', yearsExperience: 1 },
      ],
    };

    const project = buildProject([
      { technologyId: 1, minLevel: 'Avanzado', minYearsExperience: 3 },
      { technologyId: 3, minLevel: 'Medio', minYearsExperience: 1 },
    ]);

    const result = evaluateEmployeeForProject(employee, project, technologyName);
    expect(result.satisfied).toBe(false);
    expect(result.satisfiedRequirements).toBe(0);
    expect(result.totalRequirements).toBe(2);
  });
});