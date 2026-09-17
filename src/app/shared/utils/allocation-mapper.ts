import { Employee } from '../models/employee';
import { Project, ProjectStatus } from '../models/project';
import { Technology } from '../models/technology';
import { Assignment } from '../models/assignment';
import { ProficiencyLevel } from '../models/employee-technology';
import {
  AllocationRequest,
  AllocationAssignment,
  AllocationAssignmentMode,
  AllocationEmployee,
  AllocationLevel,
  AllocationProject,
  AllocationProjectRequirement,
  AllocationProjectStatus,
  AllocationTechnology,
} from '../models/allocation';

const LEVEL_MAP: Record<ProficiencyLevel, AllocationLevel> = {
  'Básico': 'BEGINNER',
  'Medio': 'INTERMEDIATE',
  'Avanzado': 'ADVANCED',
  'Experto': 'EXPERT',
};

const PROJECT_STATUS_MAP: Record<ProjectStatus, AllocationProjectStatus> = {
  'Activo': 'ACTIVE',
  'En planificación': 'PLANNED',
  'Finalizado': 'COMPLETED',
};

export const toAllocationLevel = (level: ProficiencyLevel): AllocationLevel => LEVEL_MAP[level];

const toEmployee = (employee: Employee): AllocationEmployee => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  position: employee.position,
  hireDate: employee.hireDate,
  technologies: employee.technologies.map((tech) => ({
    technologyId: tech.technologyId,
    level: LEVEL_MAP[tech.level],
    version: tech.version,
    yearsExperience: tech.yearsExperience,
  })),
  costPerDay: employee.costPerDay,
});

const toTechnology = (technology: Technology): AllocationTechnology => ({
  id: technology.id,
  name: technology.name,
  category: technology.category,
  version: technology.version,
  description: technology.description,
});

export const defaultProjectDailyRate = (project: Project): number =>
  1000 + project.requiredTechnologies.reduce((sum, req) => sum + (req.count ?? 1) * 400, 0);

const toProject = (
  project: Project,
  versionByTechnologyId: Map<number, string>,
): AllocationProject => ({
  id: project.id,
  name: project.name,
  description: project.description,
  client: project.client,
  status: PROJECT_STATUS_MAP[project.status],
  startDate: project.startDate,
  endDate: project.endDate,
  requiredTechnologies: project.requiredTechnologies.map(
    (req): AllocationProjectRequirement => ({
      technologyId: req.technologyId,
      version: req.version ?? versionByTechnologyId.get(req.technologyId) ?? '',
      minLevel: LEVEL_MAP[req.minLevel],
      minYearsExperience: req.minYearsExperience,
      count: req.count ?? 1,
    }),
  ),
  dailyRate: project.dailyRate ?? defaultProjectDailyRate(project),
});

const toAssignment = (assignment: Assignment): AllocationAssignment => {
  const mode: AllocationAssignmentMode =
    assignment.hoursPerDay !== undefined && assignment.hoursPerDay < 8 ? 'PART_TIME' : 'FULL_TIME';
  return {
    id: assignment.id,
    employeeId: assignment.employeeId,
    projectId: assignment.projectId,
    mode,
    hoursPerDay: assignment.hoursPerDay ?? 8,
    startDate: assignment.startDate,
    endDate: assignment.endDate,
    notes: assignment.notes ?? '',
  };
};

export interface MappedAllocationRequest {
  technologies: AllocationTechnology[];
  employees: AllocationEmployee[];
  projects: AllocationProject[];
  assignments: AllocationAssignment[];
}

export const toAllocationRequest = (
  technologies: Technology[],
  employees: Employee[],
  projects: Project[],
  assignments: Assignment[],
): MappedAllocationRequest => {
  const versionByTechnologyId = new Map(
    technologies.map((tech) => [tech.id, tech.version] as [number, string]),
  );
  return {
    technologies: technologies.map(toTechnology),
    employees: employees.map(toEmployee),
    projects: projects.map((project) => toProject(project, versionByTechnologyId)),
    assignments: assignments.map(toAssignment),
  };
};

export const withConstraints = (
  request: MappedAllocationRequest,
  constraints: AllocationRequest['constraints'],
): MappedAllocationRequest & { constraints: AllocationRequest['constraints'] } => ({
  ...request,
  constraints,
});