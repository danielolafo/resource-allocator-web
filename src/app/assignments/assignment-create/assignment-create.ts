import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { addDays, toIsoDate } from '../../shared/models/assignment';
import { evaluateEmployeeForProject } from '../../shared/utils/technology-match';
import {
  AssignmentService,
  AssignmentTarget,
  TARGET_LABELS,
} from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';
import { TechnologyService } from '../../shared/services/technology.service';
import { ProjectStatus } from '../../shared/models/project';

interface Candidate {
  employeeId: number;
  name: string;
  position: string;
  matchPercentage: number;
  satisfied: boolean;
  finishing: boolean;
  withoutProject: boolean;
}

interface ProjectSuggestion {
  projectId: number;
  name: string;
  client: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  dailyRate?: number;
  matchPercentage: number;
  satisfied: boolean;
  satisfiedRequirements: number;
  totalRequirements: number;
  overlapsCurrent: boolean;
}

interface EmployeeSuggestions {
  employeeId: number;
  name: string;
  position: string;
  suggestions: ProjectSuggestion[];
}

@Component({
  selector: 'app-assignment-create',
  standalone: false,
  templateUrl: './assignment-create.html',
  styleUrl: './assignment-create.css',
})
export class AssignmentCreate {
  private readonly fb = inject(FormBuilder);
  private readonly assignmentService = inject(AssignmentService);
  private readonly employeeService = inject(EmployeeService);
  private readonly projectService = inject(ProjectService);
  private readonly technologyService = inject(TechnologyService);

  readonly projects = this.projectService.projects;

  readonly targetLabels: { value: AssignmentTarget; label: string }[] = [
    { value: 'PROXIMOS', label: TARGET_LABELS.PROXIMOS },
    { value: 'SIN_PROYECTO', label: TARGET_LABELS.SIN_PROYECTO },
    { value: 'AMBOS', label: TARGET_LABELS.AMBOS },
  ];

  readonly form = this.fb.nonNullable.group({
    target: ['AMBOS' as AssignmentTarget, Validators.required],
    thresholdDays: [15, [Validators.required, Validators.min(1)]],
    projectId: [null as number | null, Validators.required],
    onlyMatching: [false],
    mode: ['RANGO' as 'HORAS' | 'DIAS' | 'RANGO', Validators.required],
    startDate: [toIsoDate(new Date()), Validators.required],
    endDate: [toIsoDate(addDays(new Date(), 30)), Validators.required],
    days: [30, [Validators.required, Validators.min(1)]],
    hoursPerDay: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
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
    const threshold = Number(v.thresholdDays) || 0;
    const project = v.projectId ? this.projectService.byId(Number(v.projectId)) : undefined;

    const employeeList = this.employeeService.employees();
    const finishing = new Set(this.assignmentService.employeesFinishingSoon(threshold, today));
    const withActive = new Set(
      employeeList
        .filter((e) => this.assignmentService.hasActiveAssignment(e.id, today))
        .map((e) => e.id),
    );

    const matchesTarget = (id: number): boolean => {
      const isFinishing = finishing.has(id);
      const isWithoutProject = !withActive.has(id);
      if (v.target === 'PROXIMOS') {
        return isFinishing;
      }
      if (v.target === 'SIN_PROYECTO') {
        return isWithoutProject;
      }
      return isFinishing || isWithoutProject;
    };

    return employeeList
      .filter((e) => matchesTarget(e.id))
      .map((e) => {
        const match = project
          ? evaluateEmployeeForProject(e, project, (id) => this.technologyService.nameById(id))
          : undefined;
        return {
          employeeId: e.id,
          name: `${e.firstName} ${e.lastName}`,
          position: e.position,
          matchPercentage: match?.percentage ?? 0,
          satisfied: match?.satisfied ?? false,
          finishing: finishing.has(e.id),
          withoutProject: !withActive.has(e.id),
        };
      })
      .filter((c) => (v.onlyMatching && v.projectId ? c.satisfied : true))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  });

  readonly selectedProjectName = computed<string | null>(() => {
    const id = this.value().projectId;
    return id ? this.projectService.nameById(Number(id)) : null;
  });

  readonly showSuggestions = signal(false);

  readonly suggestions = computed<EmployeeSuggestions[]>(() => {
    const employeeList = this.employeeService.employees();
    const projectList = this.projectService
      .projects()
      .filter((p) => p.status !== 'Finalizado');
    const today = new Date();

    return [...this.selectedIds()]
      .map((employeeId) => {
        const employee = employeeList.find((e) => e.id === employeeId);
        if (!employee) {
          return null;
        }
        const options = projectList
          .map((project): ProjectSuggestion => {
            const match = evaluateEmployeeForProject(
              employee,
              project,
              (id) => this.technologyService.nameById(id),
            );
            return {
              projectId: project.id,
              name: project.name,
              client: project.client,
              status: project.status,
              startDate: project.startDate,
              endDate: project.endDate,
              dailyRate: project.dailyRate,
              matchPercentage: match.percentage,
              satisfied: match.satisfied,
              satisfiedRequirements: match.satisfiedRequirements,
              totalRequirements: match.totalRequirements,
              overlapsCurrent:
                this.assignmentService.overlapForEmployee(
                  employeeId,
                  project.startDate,
                  project.endDate,
                  today,
                ).length > 0,
            };
          })
          .filter((s) => s.matchPercentage > 0)
          .sort(
            (a, b) =>
              Number(b.satisfied) - Number(a.satisfied) ||
              b.matchPercentage - a.matchPercentage ||
              a.name.localeCompare(b.name),
          )
          .slice(0, 5);

        return {
          employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          position: employee.position,
          suggestions: options,
        };
      })
      .filter((s): s is EmployeeSuggestions => s !== null);
  });

  toggleSuggestions(): void {
    this.showSuggestions.update((value) => !value);
  }

  useAsTarget(suggestion: ProjectSuggestion): void {
    this.form.patchValue({ projectId: suggestion.projectId, onlyMatching: false });
    this.showSuggestions.set(false);
  }

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
    this.selectedIds.set(new Set(this.candidates().map((c) => c.employeeId)));
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
      this.errorMessage.set('El rango de fechas no es válido.');
      return;
    }

    this.assignmentService.assignEmployees(employeeIds, {
      projectId: Number(v.projectId),
      mode: v.mode,
      hoursPerDay: v.mode === 'HORAS' ? Number(v.hoursPerDay) : undefined,
      startDate: v.startDate,
      endDate,
      notes: v.notes || undefined,
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