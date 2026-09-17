import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectsList } from './projects-list/projects-list';
import { ProjectDetail } from './project-detail/project-detail';

@NgModule({
  declarations: [ProjectsList, ProjectDetail],
  imports: [CommonModule, ProjectsRoutingModule],
})
export class ProjectsModule {}
