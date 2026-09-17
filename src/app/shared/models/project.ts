import { ProficiencyLevel } from './employee-technology';

export interface ProjectTechnologyRequirement {
  technologyId: number;
  minLevel: ProficiencyLevel;
  minYearsExperience: number;
  version?: string;
  count?: number;
}

export type ProjectStatus = 'Activo' | 'En planificación' | 'Finalizado';

export interface Project {
  id: number;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  requiredTechnologies: ProjectTechnologyRequirement[];
  dailyRate?: number;
}