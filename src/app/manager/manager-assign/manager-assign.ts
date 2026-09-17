import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { addDays, toIsoDate } from '../../shared/models/assignment';
import { CURRENT_USER } from '../../shared/models/user';
import { evaluateEmployeeForProject } from '../../shared/utils/technology-match';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';
import { TechnologyService } from '../../shared/services/technology.service';

interface Candidate {
  employeeId: number;
  name: string;
  position: string;
  matchPercentage: number;
  satisfied: boolean;
  finishing: boolean;
  withoutProject: boolean;
}

@Component({
  selector: 'app-manager-assign',
  standalone: false,
  templateUrl: './manager-assign.html',
  styleUrl: './manager-assign.css',
})
export class ManagerAssign {
  private readonly fb = inject(FormBuilder);
  private readonly assignmentService = inject(AssignmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly projectService = inject(ProjectService);
  private readonly technologyService = inject(TechnologyService);

  readonly user = CURRENT_USER;
  readonly projects = this.projectService.projects;

  readonly form = this.fb.nonNullable.group({
    projectId: [null as number | null, Validators.required],
    mode: ['RANGO' as 'HORAS' | 'DIAS' | 'RANGO', Validators.required],
    startDate: [toIsoDate(new Date()), Validators.required],
    endDate: [toIsoDate(addDays(new Date(), 30)), Validators.required],
    days: [30, [Validators.required, Validators.min(1)]],
    hoursPerDay: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
    onlyMatching: [false],
    notes: [''],
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly selectedIds = signal<Set<number>>(new Set());
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly candidates = computed<Candidate[]>(() => {
    const v = this.value();
    const today = new Date();
    const project = v.projectId ? this.projectService.byId(Number(v.projectId)) : undefined;

    const finishing = new Set(this.assignmentService.employeesFinishingSoon(15, today));
    const withActive = new Set(
      this.employeeService
        .employees()
        .filter((employee) => this.assignmentService.hasActiveAssignment(employee.id, today))
        .map((employee) => employee.id),
    );

    return this.employeeService
      .employees()
      .map((employee) => {
        const match = project
          ? evaluateEmployeeForProject(employee, project, (id) => this.technologyService.nameById(id))
          : undefined;
        return {
          employeeId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          position: employee.position,
          matchPercentage: match?.percentage ?? 0,
          satisfied: match?.satisfied ?? false,
          finishing: finishing.has(employee.id),
          withoutProject: !withActive.has(employee.id),
        };
      })
      .filter((candidate) => (v.onlyMatching ? candidate.satisfied || !project : true))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  });

  readonly selectedProjectName = computed<string | null>(() => {
    const id = this.value().projectId;
    return id ? this.projectService.nameById(Number(id)) : null;
  });

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelection(id: number): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  selectAll(): void {
    this.selectedIds.set(new Set(this.candidates().map((candidate) => candidate.employeeId)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  submit(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    const v = this.form.getRawValue();

    if (!v.projectId) {
      this.errorMessage.set('Debe seleccionar un proyecto.');
      return;
    }
    const employeeIds = [...this.selectedIds()];
    if (employeeIds.length === 0) {
      this.errorMessage.set('Debe seleccionar al menos un empleado.');
      return;
    }

    const endDate =
      v.mode === 'DIAS'
        ? toIsoDate(addDays(new Date(`${v.startDate}T00:00:00`), Number(v.days) - 1))
        : v.endDate;

    if (!v.startDate || !endDate || new Date(endDate) < new Date(v.startDate)) {
      this.errorMessage.set('El rango de fechas no es v\u00e1lido.');
      return;
    }

    this.assignmentService.assignEmployees(employeeIds, {
      projectId: Number(v.projectId),
      mode: v.mode,
      hoursPerDay: v.mode === 'HORAS' ? Number(v.hoursPerDay) : undefined,
      startDate: v.startDate,
      endDate,
      notes: `manager:${this.user.name}; ${v.notes || ''}`.trimEnd().replace(/;$/, ''),
    }).subscribe({
      next: (created) => {
        const modeLabel =
          v.mode === 'DIAS'
            ? 'por días'
            : v.mode === 'HORAS'
              ? 'por horas'
              : 'por rango de fechas';
        this.successMessage.set(
          `Se asignaron ${created.length} empleado(s) al proyecto "${this.projectService.nameById(
            Number(v.projectId),
          )}" con modalidad ${modeLabel}.`,
        );
        this.selectedIds.set(new Set());
        this.form.patchValue({ projectId: null, onlyMatching: false });
      },
      error: () => {
        this.errorMessage.set('No se pudieron crear las asignaciones. Intente de nuevo.');
      },
    });
  }
}