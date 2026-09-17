import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagerHome } from './manager-home/manager-home';
import { ManagerAssign } from './manager-assign/manager-assign';

const routes: Routes = [
  { path: '', component: ManagerHome },
  { path: 'asignar', component: ManagerAssign },
  { path: 'distribuir', redirectTo: '/distribution' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule {}