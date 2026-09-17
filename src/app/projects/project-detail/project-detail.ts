import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';
import { TechnologyService } from '../../shared/services/technology.service';
import { evaluateEmployeeForProject } from '../../shared/utils/technology-match';
import { fullName } from '../../shared/models/employee';

interface AssignedEmployee {
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  mode: string;
  percentage: number;
  satisfied: boolean;
}

const MODE_LABELS: Record<string, string> = {
  HORAS: 'Por horas',
  DIAS: 'Por días',
  RANGO: 'Rango de fechas',
};

@Component({
  selector: 'app-project-detail',
  standalone: false,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly technologyService = inject(TechnologyService);
  private readonly employeeService = inject(EmployeeService);
  private readonly assignmentService = inject(AssignmentService);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id') ?? 0))),
    { initialValue: 0 },
  );

  readonly project = computed(() => this.projectService.byId(this.id()));

  readonly requiredTechnologies = computed(() => {
    const project = this.project();
    if (!project) {
      return [];
    }
    return project.requiredTechnologies.map((req) => ({
      name: this.technologyService.nameById(req.technologyId),
      minLevel: req.minLevel,
      minYears: req.minYearsExperience,
    }));
  });

  readonly assignedEmployees = computed<AssignedEmployee[]>(() => {
    const project = this.project();
    if (!project) {
      return [];
    }
    return this.assignmentService
      .assignments()
      .filter((assignment) => assignment.projectId === project.id)
      .flatMap((assignment) => {
        const employee = this.employeeService.byId(assignment.employeeId);
        if (!employee) {
          return [];
        }
        const match = evaluateEmployeeForProject(
          employee,
          project,
          (id) => this.technologyService.nameById(id),
        );
        return [
          {
            employeeId: employee.id,
            employeeName: fullName(employee),
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            mode: MODE_LABELS[assignment.mode] ?? assignment.mode,
            percentage: match.percentage,
            satisfied: match.satisfied,
          },
        ];
      });
  });
}