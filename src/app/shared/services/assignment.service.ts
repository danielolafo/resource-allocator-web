import { Injectable, signal } from '@angular/core';
import { Assignment, assignmentStatus, AssignmentStatus } from '../models/assignment';
import { MOCK_ASSIGNMENTS } from '../mock/mock-data';

export type AssignmentTarget = 'PROXIMOS' | 'SIN_PROYECTO' | 'AMBOS';

export interface AssignPayload {
  projectId: number;
  mode: 'HORAS' | 'DIAS' | 'RANGO';
  hoursPerDay?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export const TARGET_LABELS: Record<AssignmentTarget, string> = {
  PROXIMOS: 'Próximos a finalizar',
  SIN_PROYECTO: 'Sin proyecto',
  AMBOS: 'Ambos',
};

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly _assignments = signal<Assignment[]>(MOCK_ASSIGNMENTS);

  readonly assignments = this._assignments.asReadonly();

  private nextId = 1000;

  byId(id: number): Assignment | undefined {
    return this._assignments().find((a) => a.id === id);
  }

  statusOf(assignment: Assignment, today: Date = new Date()): AssignmentStatus {
    return assignmentStatus(assignment, today);
  }

  activeAssignmentsFor(employeeId: number, today: Date = new Date()): Assignment[] {
    return this._assignments().filter(
      (a) => a.employeeId === employeeId && this.statusOf(a, today) === 'ACTIVA',
    );
  }

  currentAssignment(employeeId: number, today: Date = new Date()): Assignment | undefined {
    const active = this.activeAssignmentsFor(employeeId, today);
    return active.length > 0 ? active[active.length - 1] : undefined;
  }

  hasActiveAssignment(employeeId: number, today: Date = new Date()): boolean {
    return this.activeAssignmentsFor(employeeId, today).length > 0;
  }

  employeesFinishingSoon(thresholdDays: number, today: Date = new Date()): number[] {
    const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    limit.setDate(limit.getDate() + thresholdDays);
    const ids = new Set<number>();
    for (const assignment of this._assignments()) {
      if (this.statusOf(assignment, today) !== 'ACTIVA') {
        continue;
      }
      const end = new Date(`${assignment.endDate}T00:00:00`);
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (end >= todayMidnight && end <= limit) {
        ids.add(assignment.employeeId);
      }
    }
    return [...ids];
  }

  assignEmployees(employeeIds: number[], payload: AssignPayload): Assignment[] {
    const created: Assignment[] = employeeIds.map((employeeId) => {
      this.nextId += 1;
      const assignment: Assignment = {
        id: this.nextId,
        employeeId,
        projectId: payload.projectId,
        mode: payload.mode,
        hoursPerDay: payload.hoursPerDay,
        startDate: payload.startDate,
        endDate: payload.endDate ?? payload.startDate,
        notes: payload.notes,
      };
      return assignment;
    });
    this._assignments.update((list) => [...list, ...created]);
    return created;
  }

  overlapForEmployee(employeeId: number, startDate: string, endDate: string, today: Date = new Date()): Assignment[] {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);
    return this._assignments().filter((a) => {
      if (a.employeeId !== employeeId || this.statusOf(a, today) === 'FINALIZADA') {
        return false;
      }
      const aStart = new Date(`${a.startDate}T00:00:00`);
      const aEnd = new Date(`${a.endDate}T23:59:59`);
      return start <= aEnd && end >= aStart;
    });
  }
}