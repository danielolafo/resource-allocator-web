import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing-module';
import { EmployeesList } from './employees-list/employees-list';
import { EmployeeDetail } from './employee-detail/employee-detail';
import { EmployeeTechnologies } from './employee-technologies/employee-technologies';

@NgModule({
  declarations: [EmployeesList, EmployeeDetail, EmployeeTechnologies],
  imports: [CommonModule, EmployeesRoutingModule],
})
export class EmployeesModule {}
