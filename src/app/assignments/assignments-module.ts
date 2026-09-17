import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AssignmentsRoutingModule } from './assignments-routing-module';
import { AssignmentsList } from './assignments-list/assignments-list';
import { AssignmentCreate } from './assignment-create/assignment-create';

@NgModule({
  declarations: [AssignmentsList, AssignmentCreate],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AssignmentsRoutingModule],
})
export class AssignmentsModule {}
