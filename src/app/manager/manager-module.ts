import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ManagerRoutingModule } from './manager-routing-module';
import { ManagerHome } from './manager-home/manager-home';
import { ManagerAssign } from './manager-assign/manager-assign';

@NgModule({
  declarations: [ManagerHome, ManagerAssign],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ManagerRoutingModule],
})
export class ManagerModule {}