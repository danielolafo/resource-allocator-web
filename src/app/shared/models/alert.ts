export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface AssignmentAlert {
  id: number;
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  endDate: string;
  daysRemaining: number;
  severity: AlertSeverity;
  message: string;
  read: boolean;
}

export interface TechnologyMatch {
  technologyId: number;
  technologyName: string;
  requirementLevel: string;
  employeeLevel: string;
  yearsExperience: number;
  minYearsExperience: number;
  satisfied: boolean;
}