import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'empleados' },
  {
    path: 'empleados',
    loadChildren: () => import('./employees/employees-module').then((m) => m.EmployeesModule),
  },
  {
    path: 'proyectos',
    loadChildren: () => import('./projects/projects-module').then((m) => m.ProjectsModule),
  },
  {
    path: 'tecnologias',
    loadChildren: () =>
      import('./technologies/technologies-module').then((m) => m.TechnologiesModule),
  },
  {
    path: 'asignaciones',
    loadChildren: () =>
      import('./assignments/assignments-module').then((m) => m.AssignmentsModule),
  },
  {
    path: 'alertas',
    loadChildren: () => import('./alerts/alerts-module').then((m) => m.AlertsModule),
  },
  {
    path: 'distribution',
    loadChildren: () =>
      import('./distribution/distribution-module').then((m) => m.DistributionModule),
  },
  {
    path: 'manager',
    loadChildren: () => import('./manager/manager-module').then((m) => m.ManagerModule),
  },
  { path: '**', redirectTo: 'empleados' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}