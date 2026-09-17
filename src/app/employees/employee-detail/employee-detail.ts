import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Assignment, AssignmentMode, AssignmentStatus } from '../../shared/models/assignment';
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

@Component({
  selector: 'app-employee-detail',
  standalone: false,
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly projectService = inject(ProjectService);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id') ?? 0))),
    { initialValue: 0 },
  );

  readonly employee = computed(() => this.employeeService.byId(this.id()));

  readonly currentAssignment = computed(() => {
    const employee = this.employee();
    return employee ? this.assignmentService.currentAssignment(employee.id) : undefined;
  });

  readonly assignments = computed<Assignment[]>(() => {
    const employee = this.employee();
    return employee
      ? this.assignmentService.assignments().filter((a) => a.employeeId === employee.id)
      : [];
  });

  statusOf(assignment: Assignment): AssignmentStatus {
    return this.assignmentService.statusOf(assignment);
  }

  modeLabel(mode: AssignmentMode): string {
    return MODE_LABELS[mode];
  }

  statusLabel(status: AssignmentStatus): string {
    return STATUS_LABELS[status];
  }

  projectName(id: number): string {
    return this.projectService.nameById(id);
  }
}