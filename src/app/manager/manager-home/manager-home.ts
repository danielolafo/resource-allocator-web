import { Component, computed, inject } from '@angular/core';
import {
  Assignment,
  AssignmentMode,
  AssignmentStatus,
} from '../../shared/models/assignment';
import { CURRENT_USER } from '../../shared/models/user';
import { AlertService } from '../../shared/services/alert.service';
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

interface AssignedRow {
  assignment: Assignment;
  employeeName: string;
  position: string;
  projectName: string;
  modeLabel: string;
  status: AssignmentStatus;
  statusLabel: string;
}

@Component({
  selector: 'app-manager-home',
  standalone: false,
  templateUrl: './manager-home.html',
  styleUrl: './manager-home.css',
})
export class ManagerHome {
  readonly user = CURRENT_USER;

  private readonly assignmentService = inject(AssignmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly projectService = inject(ProjectService);
  private readonly alertService = inject(AlertService);

  readonly totalEmployees = computed<number>(() => this.employeeService.employees().length);

  readonly occupiedEmployees = computed<number>(() => {
    const occupied = new Set(
      this.assignmentService
        .assignments()
        .filter((assignment) => this.assignmentService.statusOf(assignment) !== 'FINALIZADA')
        .map((assignment) => assignment.employeeId),
    );
    return occupied.size;
  });

  readonly idleEmployees = computed<number>(
    () => this.totalEmployees() - this.occupiedEmployees(),
  );

  readonly activeProjects = computed<number>(
    () => this.projectService.projects().filter((project) => project.status === 'Activo').length,
  );

  readonly pendingAlerts = this.alertService.unreadCount;

  readonly rows = computed<AssignedRow[]>(() =>
    this.assignmentService
      .assignments()
      .map((assignment) => {
        const status = this.assignmentService.statusOf(assignment);
        return {
          assignment,
          employeeName: this.employeeService.nameById(assignment.employeeId),
          position: this.employeeService.byId(assignment.employeeId)?.position ?? '',
          projectName: this.projectService.nameById(assignment.projectId),
          modeLabel: MODE_LABELS[assignment.mode],
          status,
          statusLabel: STATUS_LABELS[status],
        };
      })
      .filter((row) => row.status !== 'FINALIZADA')
      .sort((a, b) => new Date(a.assignment.endDate).getTime() - new Date(b.assignment.endDate).getTime()),
  );
}