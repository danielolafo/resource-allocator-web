import { EmployeeTechnology } from './employee-technology';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  hireDate: string;
  costPerDay: number;
  technologies: EmployeeTechnology[];
}

export const fullName = (employee: Employee): string =>
  `${employee.firstName} ${employee.lastName}`;