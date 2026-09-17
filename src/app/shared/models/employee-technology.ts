export type ProficiencyLevel = 'Básico' | 'Medio' | 'Avanzado' | 'Experto';

export interface EmployeeTechnology {
  technologyId: number;
  level: ProficiencyLevel;
  version: string;
  yearsExperience: number;
}