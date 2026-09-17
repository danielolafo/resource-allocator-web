import { Component, computed, inject, signal } from '@angular/core';
import { daysBetween } from '../../shared/models/assignment';
import { AllocationAssignment, AllocationRequest, AllocationResponse } from '../../shared/models/allocation';
import { AllocationService } from '../../shared/services/allocation.service';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';
import { TechnologyService } from '../../shared/services/technology.service';
import { toAllocationRequest, withConstraints } from '../../shared/utils/allocation-mapper';
import { MOCK_ALLOCATION_REQUEST } from '../../shared/mock/mock-allocation-request';

interface AssignmentRow {
  assignment: AllocationAssignment;
  projectName: string;
  employeeName: string;
  days: number;
}

@Component({
  selector: 'app-distribution-home',
  standalone: false,
  templateUrl: './distribution-home.html',
  styleUrl: './distribution-home.css',
})
export class DistributionHome {
  private readonly technologyService = inject(TechnologyService);
  private readonly employeeService = inject(EmployeeService);
  private readonly projectService = inject(ProjectService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly allocationService = inject(AllocationService);

  readonly isLoading = this.allocationService.isLoading;
  readonly lastError = this.allocationService.lastError;
  readonly response = signal<AllocationResponse | null>(null);
  readonly dataSource = signal<'catalogs' | 'reference'>('catalogs');
  readonly maxTotalCost = signal<number | null>(null);
  readonly showPayload = signal(false);

  private readonly catalogsRequest = computed<AllocationRequest>(() => {
    const base = toAllocationRequest(
      this.technologyService.technologies(),
      this.employeeService.employees(),
      this.projectService.projects(),
      this.assignmentService.assignments(),
    );
    return withConstraints(base, {
      maxTotalCost: this.maxTotalCost() ?? undefined,
      preferLowestCost: true,
    });
  });

  readonly activeRequest = computed<AllocationRequest>(() =>
    this.dataSource() === 'reference'
      ? {
          ...MOCK_ALLOCATION_REQUEST,
          constraints: {
            preferLowestCost: true,
            maxTotalCost: this.maxTotalCost() ?? undefined,
          },
        }
      : this.catalogsRequest(),
  );

  readonly payloadCounts = computed(() => ({
    technologies: this.activeRequest().technologies.length,
    employees: this.activeRequest().employees.length,
    projects: this.activeRequest().projects.length,
    assignments: this.activeRequest().assignments.length,
  }));

  readonly rows = computed<AssignmentRow[]>(() => {
    const result = this.response();
    if (!result) {
      return [];
    }
    const employees = new Map(
      this.activeRequest().employees.map((employee) => [
        employee.id,
        `${employee.firstName} ${employee.lastName}`,
      ]),
    );
    const projects = new Map(
      this.activeRequest().projects.map((project) => [project.id, project.name]),
    );
    return [...result.assignments]
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((assignment) => ({
        assignment,
        projectName: projects.get(assignment.projectId) ?? `#${assignment.projectId}`,
        employeeName: employees.get(assignment.employeeId) ?? `#${assignment.employeeId}`,
        days: Math.max(1, daysBetween(new Date(assignment.startDate), new Date(assignment.endDate)) + 1),
      }));
  });

  run(): void {
    this.response.set(null);
    this.allocationService.allocate(this.activeRequest()).subscribe({
      next: (result) => this.response.set(result),
      error: () => undefined,
    });
  }

  onMaxCost(value: string): void {
    const parsed = Number(value);
    this.maxTotalCost.set(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }

  togglePayload(): void {
    this.showPayload.update((value) => !value);
  }

  prettyJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
}