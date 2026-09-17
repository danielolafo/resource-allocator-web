import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesList } from './employees-list/employees-list';
import { EmployeeDetail } from './employee-detail/employee-detail';

const routes: Routes = [
  { path: '', component: EmployeesList },
  { path: ':id', component: EmployeeDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeesRoutingModule {}