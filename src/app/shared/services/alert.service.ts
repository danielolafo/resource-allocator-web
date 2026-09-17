import { Injectable, computed, signal } from '@angular/core';
import { addDays, assignmentStatus, toIsoDate } from '../models/assignment';
import { AssignmentAlert, AlertSeverity } from '../models/alert';
import { AssignmentService } from './assignment.service';
import { EmployeeService } from './employee.service';
import { ProjectService } from './project.service';

export const DEFAULT_THRESHOLD_DAYS = 15;

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly _thresholdDays = signal<number>(DEFAULT_THRESHOLD_DAYS);
  private readonly _readIds = signal<Set<number>>(new Set());

  readonly thresholdDays = this._thresholdDays.asReadonly();

  readonly alerts = computed<AssignmentAlert[]>(() => {
    const today = new Date();
    const limit = addDays(today, this._thresholdDays());
    const todayIso = toIsoDate(today);

    const alerts: AssignmentAlert[] = [];

    for (const assignment of this.assignmentService.assignments()) {
      if (assignmentStatus(assignment, today) !== 'ACTIVA') {
        continue;
      }
      const end = new Date(`${assignment.endDate}T00:00:00`);
      if (end > limit) {
        continue;
      }

      const employeeId = assignment.employeeId;
      const projectId = assignment.projectId;
      const employeeName = this.employeeService.nameById(employeeId);
      const projectName = this.projectService.nameById(projectId);

      const daysRemaining = Math.round(
        (new Date(assignment.endDate).getTime() - new Date(`${todayIso}T00:00:00`).getTime()) /
          86400000,
      );

      let severity: AlertSeverity = 'warning';
      let message = `La asignación del empleado ${employeeName} al proyecto "${projectName}" finaliza en ${daysRemaining} días (${assignment.endDate}).`;
      if (daysRemaining < 0) {
        severity = 'danger';
        message = `La asignación del empleado ${employeeName} al proyecto "${projectName}" ya venció el ${assignment.endDate}.`;
      } else if (daysRemaining <= 5) {
        severity = 'danger';
        message = `La asignación del empleado ${employeeName} al proyecto "${projectName}" finaliza pronto (${daysRemaining} días).`;
      }

      alerts.push({
        id: assignment.id,
        assignmentId: assignment.id,
        employeeId,
        employeeName,
        projectId,
        projectName,
        endDate: assignment.endDate,
        daysRemaining,
        severity,
        message,
        read: this._readIds().has(assignment.id),
      });
    }

    return alerts.sort((a, b) => {
      const timeDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    });
  });

  readonly unreadCount = computed<number>(
    () => this.alerts().filter((a) => !a.read).length,
  );

  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly employeeService: EmployeeService,
    private readonly projectService: ProjectService,
  ) {}

  setThresholdDays(days: number): void {
    this._thresholdDays.set(Math.max(0, days));
  }

  markAsRead(assignmentId: number): void {
    this._readIds.update((set) => {
      const next = new Set(set);
      next.add(assignmentId);
      return next;
    });
  }

  markAllAsRead(): void {
    this._readIds.update((set) => new Set(this.alerts().map((a) => a.assignmentId)));
  }
}