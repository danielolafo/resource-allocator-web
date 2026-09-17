import { Component, computed, inject, signal } from '@angular/core';
import { Employee } from '../../shared/models/employee';
import { AssignmentService } from '../../shared/services/assignment.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { ProjectService } from '../../shared/services/project.service';

interface EmployeeRow {
  employee: Employee;
  projectName?: string;
  assigned: boolean;
}

@Component({
  selector: 'app-employees-list',
  standalone: false,
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.css',
})
export class EmployeesList {
  private readonly employeeService = inject(EmployeeService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly projectService = inject(ProjectService);

  readonly employees = this.employeeService.employees;
  readonly filter = signal('');

  readonly rows = computed<EmployeeRow[]>(() => {
    const query = this.filter().trim().toLowerCase();
    return this.employees()
      .filter((employee) => {
        if (!query) {
          return true;
        }
        const full = `${employee.firstName} ${employee.lastName} ${employee.position}`.toLowerCase();
        return full.includes(query);
      })
      .map((employee) => {
        const current = this.assignmentService.currentAssignment(employee.id);
        return {
          employee,
          projectName: current ? this.projectService.nameById(current.projectId) : undefined,
          assigned: !!current,
        };
      });
  });
}