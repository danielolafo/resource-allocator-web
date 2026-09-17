export type AllocationLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type AllocationProjectStatus = 'ACTIVE' | 'PLANNED' | 'COMPLETED';

export type AllocationAssignmentMode = 'FULL_TIME' | 'PART_TIME';

export interface AllocationTechnology {
  id: number;
  name: string;
  category: string;
  version: string;
  description: string;
}

export interface AllocationEmployeeTechnology {
  technologyId: number;
  level: AllocationLevel;
  version: string;
  yearsExperience: number;
}

export interface AllocationEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  hireDate: string;
  technologies: AllocationEmployeeTechnology[];
  costPerDay: number;
}

export interface AllocationProjectRequirement {
  technologyId: number;
  version: string;
  minLevel: AllocationLevel;
  minYearsExperience: number;
  count: number;
}

export interface AllocationProject {
  id: number;
  name: string;
  description: string;
  client: string;
  status: AllocationProjectStatus;
  startDate: string;
  endDate: string;
  requiredTechnologies: AllocationProjectRequirement[];
  dailyRate: number;
}

export interface AllocationAssignment {
  id: number;
  employeeId: number;
  projectId: number;
  mode: AllocationAssignmentMode;
  hoursPerDay: number;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface AllocationConstraints {
  maxTotalCost?: number;
  preferLowestCost?: boolean;
}

export interface AllocationRequest {
  technologies: AllocationTechnology[];
  employees: AllocationEmployee[];
  projects: AllocationProject[];
  assignments: AllocationAssignment[];
  constraints?: AllocationConstraints;
}

export interface AllocationSummary {
  today: string;
  horizonEnd: string;
  totalEmployees: number;
  totalProjects: number;
  occupiedEmployees: number;
  idleEmployees: number;
  totalAssignedDays: number;
  averageUtilization: number;
  utilization: Record<string, number>;
  totalProfit: number;
  employeeDaysAvailable: Record<string, number>;
  perProjectDays: Record<string, number>;
}

export interface AllocationResponse {
  assignments: AllocationAssignment[];
  summary: AllocationSummary;
  warnings: string[];
  algorithm?: 'remote' | 'local-backup';
}

export const ALLOCATION_LEVEL_ORDER: Record<AllocationLevel, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
  EXPERT: 3,
};