import { Component, computed, inject, signal } from '@angular/core';
import { Assignment, AssignmentMode, AssignmentStatus, daysBetween } from '../../shared/models/assignment';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';

const MODE_LABELS: Record<AssignmentMode, string> = {
  HORAS: 'Por horas',
  DIAS: 'Por días',
  RANGO: 'Rango de fechas',
};

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
  PROGRAMADA: 'Programada',
};

interface AssignmentRow {
  assignment: Assignment;
  employeeName: string;
  projectName: string;
  modeLabel: string;
  status: AssignmentStatus;
  statusLabel: string;
  daysRemaining: number;
}

@Component({
  selector: 'app-assignments-list',
  standalone: false,
  templateUrl: './assignments-list.html',
  styleUrl: './assignments-list.css',
})
export class AssignmentsList {
  private readonly assignmentService = inject(AssignmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly projectService = inject(ProjectService);

  readonly statusFilter = signal<'TODAS' | AssignmentStatus>('TODAS');

  readonly statusOptions: { value: 'TODAS' | AssignmentStatus; label: string }[] = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'ACTIVA', label: 'Activas' },
    { value: 'PROGRAMADA', label: 'Programadas' },
    { value: 'FINALIZADA', label: 'Finalizadas' },
  ];

  readonly rows = computed<AssignmentRow[]>(() => {
    const filter = this.statusFilter();
    const today = new Date();
    return this.assignmentService
      .assignments()
      .map((assignment) => {
        const status = this.assignmentService.statusOf(assignment, today);
        return {
          assignment,
          employeeName: this.employeeService.nameById(assignment.employeeId),
          projectName: this.projectService.nameById(assignment.projectId),
          modeLabel: MODE_LABELS[assignment.mode],
          status,
          statusLabel: STATUS_LABELS[status],
          daysRemaining: daysBetween(today, new Date(`${assignment.endDate}T00:00:00`)),
        };
      })
      .filter((row) => filter === 'TODAS' || row.status === filter)
      .sort(
        (a, b) =>
          new Date(a.assignment.endDate).getTime() - new Date(b.assignment.endDate).getTime(),
      );
  });
}