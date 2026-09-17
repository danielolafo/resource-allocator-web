import { Injectable, signal } from '@angular/core';
import { Employee, fullName } from '../models/employee';
import { EmployeeTechnology } from '../models/employee-technology';
import { MOCK_EMPLOYEES } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly _employees = signal<Employee[]>(MOCK_EMPLOYEES);

  readonly employees = this._employees.asReadonly();

  byId(id: number): Employee | undefined {
    return this._employees().find((e) => e.id === id);
  }

  nameById(id: number): string {
    const employee = this.byId(id);
    return employee ? fullName(employee) : `Empleado #${id}`;
  }

  addEmployee(
    employee: Omit<Employee, 'id' | 'technologies'> & { technologies: EmployeeTechnology[] },
  ): Employee {
    const nextId = Math.max(0, ...this._employees().map((e) => e.id)) + 1;
    const created: Employee = { ...employee, id: nextId, technologies: employee.technologies };
    this._employees.update((list) => [...list, created]);
    return created;
  }
}