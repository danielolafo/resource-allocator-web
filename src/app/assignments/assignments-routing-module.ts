import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentsList } from './assignments-list/assignments-list';
import { AssignmentCreate } from './assignment-create/assignment-create';

const routes: Routes = [
  { path: '', component: AssignmentsList },
  { path: 'nueva', component: AssignmentCreate },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentsRoutingModule {}