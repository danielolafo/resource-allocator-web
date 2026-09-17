import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsList } from './projects-list/projects-list';
import { ProjectDetail } from './project-detail/project-detail';

const routes: Routes = [
  { path: '', component: ProjectsList },
  { path: ':id', component: ProjectDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}