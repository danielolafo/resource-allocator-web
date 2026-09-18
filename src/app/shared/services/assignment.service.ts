import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, tap } from 'rxjs';
import { Assignment, assignmentStatus, AssignmentStatus } from '../models/assignment';
import { API_BASE_URL } from './api-config';

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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/assignments`;

  private readonly _assignments = signal<Assignment[]>([]);

  readonly assignments = this._assignments.asReadonly();

  constructor() {
    this.http.get<Assignment[]>(this.baseUrl).subscribe({
      next: (list) => this._assignments.set(list),
      error: (error) =>
        console.error('No se pudieron cargar las asignaciones desde el backend:', error),
    });
  }

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

  assignEmployees(employeeIds: number[], payload: AssignPayload): Observable<Assignment[]> {
    return this.assignEmployeesToProjects(
      employeeIds.map((employeeId) => ({ employeeId, projectId: payload.projectId })),
      payload,
    );
  }

  assignEmployeesToProjects(
    targets: { employeeId: number; projectId: number }[],
    payload: Omit<AssignPayload, 'projectId'>,
  ): Observable<Assignment[]> {
    const requests = targets.map(({ employeeId, projectId }) =>
      this.http.post<Assignment>(this.baseUrl, {
        employeeId,
        projectId,
        mode: payload.mode,
        hoursPerDay: payload.hoursPerDay,
        startDate: payload.startDate,
        endDate: payload.endDate ?? payload.startDate,
        notes: payload.notes,
      }),
    );
    return forkJoin(requests).pipe(
      tap((created) => this._assignments.update((list) => [...list, ...created])),
    );
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