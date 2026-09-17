import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, of } from 'rxjs';
import { daysBetween, toIsoDate } from '../models/assignment';
import {
  ALLOCATION_LEVEL_ORDER,
  AllocationAssignment,
  AllocationEmployee,
  AllocationProject,
  AllocationRequest,
  AllocationResponse,
} from '../models/allocation';

export const ALLOCATION_ENDPOINT = '/allocate';

const round = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

@Injectable({ providedIn: 'root' })
export class AllocationService {
  private readonly http = inject(HttpClient);

  readonly isLoading = signal(false);
  readonly lastError = signal<string | null>(null);

  allocate(request: AllocationRequest): Observable<AllocationResponse> {
    this.isLoading.set(true);
    this.lastError.set(null);
    return this.http.post<AllocationResponse>('http://localhost:8000'+ALLOCATION_ENDPOINT, request).pipe(
      map((response) => ({ ...response, algorithm: 'remote' as const })),
      catchError((error: unknown) => {
        const message = typeof error === 'string' ? error : error instanceof Error ? error.message : '';
        this.lastError.set(
          `POST ${ALLOCATION_ENDPOINT} no disponible (${message || 'sin respuesta'}). Se ejecutó el asignador local de respaldo.`,
        );
        return of(this.runLocalAllocator(request));
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  runLocalAllocator(request: AllocationRequest): AllocationResponse {
    const projectById = new Map(request.projects.map((project) => [project.id, project]));
    const employeeById = new Map(request.employees.map((employee) => [employee.id, employee]));

    const employees = [...request.employees].sort((a, b) => a.costPerDay - b.costPerDay);
    const projects = [...request.projects].sort((a, b) => {
      const priority: Record<string, number> = { ACTIVE: 0, PLANNED: 1, COMPLETED: 2 };
      const statusDiff = (priority[a.status] ?? 1) - (priority[b.status] ?? 1);
      if (statusDiff !== 0) {
        return statusDiff;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const existingAssignments: AllocationAssignment[] = request.assignments.map((assignment) => ({
      ...assignment,
    }));
    const assignments: AllocationAssignment[] = [...existingAssignments];
    const nextId = Math.max(0, ...existingAssignments.map((a) => a.id)) + 1;

    const maxTotalCost = request.constraints?.maxTotalCost;
    let runningCost = 0;
    let unfilled = 0;

    for (const project of projects) {
      for (const requirement of project.requiredTechnologies) {
        for (let i = 0; i < requirement.count; i++) {
          const candidate = employees.find(
            (employee) =>
              !this.employeeIsBusy(employee.id, project, assignments) &&
              this.employeeCoversRequirement(employee, requirement),
          );
          if (!candidate) {
            unfilled += 1;
            continue;
          }

          const durationDays = this.assignmentLength(project.startDate, project.endDate);
          const estimatedCost = Math.round(candidate.costPerDay * durationDays);
          if (maxTotalCost !== undefined && runningCost + estimatedCost > maxTotalCost) {
            unfilled += 1;
            continue;
          }
          runningCost += estimatedCost;

          assignments.push({
            id: nextId + assignments.length - existingAssignments.length,
            employeeId: candidate.id,
            projectId: project.id,
            mode: 'FULL_TIME',
            hoursPerDay: 8,
            startDate: project.startDate,
            endDate: project.endDate,
            notes: 'auto-assigned',
          });
        }
      }
    }

    const today = toIsoDate(new Date());
    const latestEnd = assignments.reduce(
      (latest, assignment) => Math.max(latest, new Date(assignment.endDate).getTime()),
      Math.max(0, ...request.projects.map((p) => new Date(p.endDate).getTime())),
    );
    const horizonEnd = toIsoDate(new Date(Math.max(latestEnd, new Date(today).getTime())));
    const horizonDays = Math.max(1, daysBetween(new Date(today), new Date(horizonEnd)) + 1);

    const assignedDaysByEmployee = new Map<number, number>();
    const perProjectDays: Record<string, number> = {};
    let totalAssignedDays = 0;
    let totalProfit = 0;

    for (const assignment of assignments) {
      const length = this.assignmentLength(assignment.startDate, assignment.endDate);
      totalAssignedDays += length;

      const project = projectById.get(assignment.projectId);
      const employee = employeeById.get(assignment.employeeId);
      if (project && employee) {
        totalProfit += Math.max(0, project.dailyRate - employee.costPerDay) * length;
      }

      assignedDaysByEmployee.set(
        assignment.employeeId,
        (assignedDaysByEmployee.get(assignment.employeeId) ?? 0) + length,
      );
      perProjectDays[assignment.projectId] = (perProjectDays[assignment.projectId] ?? 0) + length;
    }

    const occupied = new Set(assignments.map((assignment) => assignment.employeeId));
    const utilization: Record<string, number> = {};
    const employeeDaysAvailable: Record<string, number> = {};
    let utilizationSum = 0;

    for (const employee of request.employees) {
      const assigned = Math.min(assignedDaysByEmployee.get(employee.id) ?? 0, horizonDays);
      const ratio = Math.min(1, assigned / horizonDays);
      utilization[employee.id] = round(ratio, 4);
      utilizationSum += ratio;
      employeeDaysAvailable[employee.id] = Math.max(0, horizonDays - assigned);
    }

    const warnings =
      unfilled > 0
        ? [`Faltan ${unfilled} requerimiento(s) por cubrir con el catálogo actual.`]
        : [];

    const sorted = assignments.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    return {
      assignments: sorted,
      warnings,
      summary: {
        today,
        horizonEnd,
        totalEmployees: request.employees.length,
        totalProjects: request.projects.length,
        occupiedEmployees: occupied.size,
        idleEmployees: request.employees.length - occupied.size,
        totalAssignedDays,
        averageUtilization: round(utilizationSum / Math.max(1, request.employees.length), 4),
        utilization,
        totalProfit: round(totalProfit, 2),
        employeeDaysAvailable,
        perProjectDays,
      },
      algorithm: 'local-backup',
    };
  }

  private assignmentLength(startDate: string, endDate: string): number {
    return Math.max(1, daysBetween(new Date(startDate), new Date(endDate)) + 1);
  }

  private employeeIsBusy(
    employeeId: number,
    project: AllocationProject,
    assignments: AllocationAssignment[],
  ): boolean {
    return assignments.some((assignment) => {
      if (assignment.employeeId !== employeeId) {
        return false;
      }
      return (
        new Date(assignment.startDate) <= new Date(project.endDate) &&
        new Date(assignment.endDate) >= new Date(project.startDate)
      );
    });
  }

  private employeeCoversRequirement(
    employee: AllocationEmployee,
    requirement: AllocationProject['requiredTechnologies'][number],
  ): boolean {
    const mastery = employee.technologies.find(
      (tech) => tech.technologyId === requirement.technologyId,
    );
    return (
      !!mastery &&
      ALLOCATION_LEVEL_ORDER[mastery.level] >=
        ALLOCATION_LEVEL_ORDER[requirement.minLevel] &&
      mastery.yearsExperience >= requirement.minYearsExperience
    );
  }
}