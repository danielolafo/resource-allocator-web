import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { addDays, toIsoDate } from '../../shared/models/assignment';
import { AllocationResponse } from '../../shared/models/allocation';
import { AllocationService } from '../../shared/services/allocation.service';
import { evaluateEmployeeForProject } from '../../shared/utils/technology-match';
import { toAllocationRequest } from '../../shared/utils/allocation-mapper';
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
  private readonly allocationService = inject(AllocationService);

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
  readonly employeeTargets = signal<Map<number, number>>(new Map());
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
  readonly suggestions = signal<EmployeeSuggestions[]>([]);
  readonly suggestionsLoading = signal(false);
  readonly allocationNotice = this.allocationService.lastError;

  private suggestionsRequestSeq = 0;

  constructor() {
    effect(() => {
      const ids = [...this.selectedIds()];
      if (this.showSuggestions() && ids.length > 0) {
        this.loadSuggestions(ids);
      } else {
        this.suggestions.set([]);
        this.suggestionsLoading.set(false);
      }
    });
  }

  toggleSuggestions(): void {
    this.showSuggestions.update((value) => !value);
  }

  private loadSuggestions(employeeIds: number[]): void {
    const seq = ++this.suggestionsRequestSeq;
    const request = toAllocationRequest(
      this.technologyService.technologies(),
      this.employeeService.employees(),
      this.projectService.projects(),
      this.assignmentService.assignments(),
    );

    this.suggestionsLoading.set(true);
    this.allocationService.allocate(request).subscribe({
      next: (result) => {
        if (seq !== this.suggestionsRequestSeq) {
          return;
        }
        this.suggestions.set(this.mapEmployeeSuggestions(employeeIds, result));
        this.suggestionsLoading.set(false);
      },
      error: () => {
        if (seq !== this.suggestionsRequestSeq) {
          return;
        }
        this.suggestions.set([]);
        this.suggestionsLoading.set(false);
      },
    });
  }

  private mapEmployeeSuggestions(
    employeeIds: number[],
    result: AllocationResponse,
  ): EmployeeSuggestions[] {
    const employeeMap = new Map(
      this.employeeService.employees().map((employee) => [employee.id, employee] as const),
    );
    const projectMap = new Map(
      this.projectService.projects().map((project) => [project.id, project] as const),
    );
    const currentIds = new Set(
      this.assignmentService.assignments().map((assignment) => assignment.id),
    );
    const today = new Date();

    return employeeIds
      .map((employeeId) => {
        const employee = employeeMap.get(employeeId);
        if (!employee) {
          return null;
        }
        const options = result.assignments
          .filter(
            (assignment) =>
              assignment.employeeId === employeeId && !currentIds.has(assignment.id),
          )
          .map((assignment): ProjectSuggestion | null => {
            const project = projectMap.get(assignment.projectId);
            if (!project) {
              return null;
            }
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
          .filter((s): s is ProjectSuggestion => s !== null)
          .sort(
            (a, b) =>
              Number(b.satisfied) - Number(a.satisfied) ||
              b.matchPercentage - a.matchPercentage ||
              a.name.localeCompare(b.name),
          );

        return {
          employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          position: employee.position,
          suggestions: options,
        };
      })
      .filter((s): s is EmployeeSuggestions => s !== null);
  }

  setTarget(employeeId: number, projectId: number): void {
    this.employeeTargets.update((map) => {
      const next = new Map(map);
      next.set(employeeId, projectId);
      return next;
    });
  }

  clearTarget(employeeId: number): void {
    this.employeeTargets.update((map) => {
      const next = new Map(map);
      next.delete(employeeId);
      return next;
    });
  }

  targetProjectId(employeeId: number): number | undefined {
    return this.employeeTargets().get(employeeId);
  }

  isTarget(employeeId: number, projectId: number): boolean {
    return this.employeeTargets().get(employeeId) === projectId;
  }

  projectNameById(id: number): string {
    return this.projectService.nameById(id);
  }

  useAsTarget(employeeId: number, suggestion: ProjectSuggestion): void {
    this.setTarget(employeeId, suggestion.projectId);
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

    const employeeIds = [...this.selectedIds()];
    if (employeeIds.length === 0) {
      this.errorMessage.set('Debe seleccionar al menos un empleado.');
      return;
    }

    const targets: { employeeId: number; projectId: number }[] = [];
    for (const employeeId of employeeIds) {
      const projectId = this.targetProjectId(employeeId) ?? (v.projectId ? Number(v.projectId) : null);
      if (!projectId) {
        continue;
      }
      targets.push({ employeeId, projectId });
    }
    if (targets.length !== employeeIds.length) {
      this.errorMessage.set(
        'Debe elegir un proyecto destino para cada empleado (en el paso 1 o con el botón "Usar como destino").',
      );
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

    this.assignmentService
      .assignEmployeesToProjects(targets, {
        mode: v.mode,
        hoursPerDay: v.mode === 'HORAS' ? Number(v.hoursPerDay) : undefined,
        startDate: v.startDate,
        endDate,
        notes: v.notes || undefined,
      })
      .subscribe({
        next: (created) => {
          const modeLabel =
            v.mode === 'DIAS'
              ? 'por días'
              : v.mode === 'HORAS'
                ? 'por horas'
                : 'por rango de fechas';
          const counts = new Map<number, number>();
          for (const target of targets) {
            counts.set(target.projectId, (counts.get(target.projectId) ?? 0) + 1);
          }
          const projectsSummary = [...counts.entries()]
            .map(
              ([projectId, count]) =>
                `"${this.projectService.nameById(projectId)}" (${count})`,
            )
            .join(', ');
          this.successMessage.set(
            `Se asignaron ${created.length} empleado(s) a ${projectsSummary}, con modalidad ${modeLabel}.`,
          );
          this.selectedIds.set(new Set());
          this.employeeTargets.set(new Map());
          this.form.patchValue({ projectId: null, onlyMatching: false });
        },
        error: () => {
          this.errorMessage.set('No se pudieron crear las asignaciones. Intente de nuevo.');
        },
      });
  }
}