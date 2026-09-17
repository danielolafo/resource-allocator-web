import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Employee, fullName } from '../models/employee';
import { EmployeeTechnology } from '../models/employee-technology';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/employees`;

  private readonly _employees = signal<Employee[]>([]);

  readonly employees = this._employees.asReadonly();

  constructor() {
    this.http.get<Employee[]>(this.baseUrl).subscribe({
      next: (list) => this._employees.set(list),
      error: (error) =>
        console.error('No se pudieron cargar los empleados desde el backend:', error),
    });
  }

  byId(id: number): Employee | undefined {
    return this._employees().find((e) => e.id === id);
  }

  nameById(id: number): string {
    const employee = this.byId(id);
    return employee ? fullName(employee) : `Empleado #${id}`;
  }

  addEmployee(
    employee: Omit<Employee, 'id' | 'technologies'> & { technologies: EmployeeTechnology[] },
  ): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee).pipe(
      tap((created) => this._employees.update((list) => [...list, created])),
    );
  }
}