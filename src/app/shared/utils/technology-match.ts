import { Employee } from '../models/employee';
import { EmployeeTechnology, ProficiencyLevel } from '../models/employee-technology';
import { Project } from '../models/project';
import { TechnologyMatch } from '../models/alert';

export const LEVEL_ORDER: Record<ProficiencyLevel, number> = {
  'Básico': 1,
  'Medio': 2,
  'Avanzado': 3,
  'Experto': 4,
};

export interface ProjectMatchResult {
  matches: TechnologyMatch[];
  satisfied: boolean;
  percentage: number;
  satisfiedRequirements: number;
  totalRequirements: number;
}

export const evaluateEmployeeForProject = (
  employee: Employee,
  project: Project,
  technologyName: (id: number) => string,
): ProjectMatchResult => {
  const totalRequirements = project.requiredTechnologies.length;
  const matches: TechnologyMatch[] = project.requiredTechnologies.map((req) => {
    const empTech: EmployeeTechnology | undefined = employee.technologies.find(
      (t) => t.technologyId === req.technologyId,
    );
    const levelOk = !!empTech && LEVEL_ORDER[empTech.level] >= LEVEL_ORDER[req.minLevel];
    const yearsOk = !!empTech && empTech.yearsExperience >= req.minYearsExperience;
    const satisfied = levelOk && yearsOk;
    return {
      technologyId: req.technologyId,
      technologyName: technologyName(req.technologyId),
      requirementLevel: req.minLevel,
      employeeLevel: empTech?.level ?? 'Básico',
      yearsExperience: empTech?.yearsExperience ?? 0,
      minYearsExperience: req.minYearsExperience,
      satisfied,
    };
  });

  const satisfiedRequirements = matches.filter((m) => m.satisfied).length;
  const percentage =
    totalRequirements === 0 ? 100 : Math.round((satisfiedRequirements / totalRequirements) * 100);

  return {
    matches,
    satisfied: satisfiedRequirements === totalRequirements,
    percentage,
    satisfiedRequirements,
    totalRequirements,
  };
};