export type AssignmentMode = 'HORAS' | 'DIAS' | 'RANGO';

export type AssignmentStatus = 'PROGRAMADA' | 'ACTIVA' | 'FINALIZADA';

export interface Assignment {
  id: number;
  employeeId: number;
  projectId: number;
  mode: AssignmentMode;
  hoursPerDay?: number;
  startDate: string;
  endDate: string;
  notes?: string;
}

export const assignmentStatus = (assignment: Assignment, today: Date = new Date()): AssignmentStatus => {
  const start = new Date(`${assignment.startDate}T00:00:00`);
  const end = new Date(`${assignment.endDate}T23:59:59`);
  if (end < today) {
    return 'FINALIZADA';
  }
  if (start > today) {
    return 'PROGRAMADA';
  }
  return 'ACTIVA';
};

export const daysBetween = (from: Date, to: Date): number => {
  const ms = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime() -
    new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round(ms / 86400000);
};

export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const toIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};