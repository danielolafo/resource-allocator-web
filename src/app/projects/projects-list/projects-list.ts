import { Component, computed, inject, signal } from '@angular/core';
import { Project } from '../../shared/models/project';
import { ProjectService } from '../../shared/services/project.service';
import { TechnologyService } from '../../shared/services/technology.service';

interface ProjectRow {
  project: Project;
  technologies: string[];
}

@Component({
  selector: 'app-projects-list',
  standalone: false,
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.css',
})
export class ProjectsList {
  private readonly projectService = inject(ProjectService);
  private readonly technologyService = inject(TechnologyService);

  readonly projects = this.projectService.projects;
  readonly filter = signal('');

  readonly rows = computed<ProjectRow[]>(() => {
    const query = this.filter().trim().toLowerCase();
    return this.projects()
      .filter((project) => {
        if (!query) {
          return true;
        }
        return (
          project.name.toLowerCase().includes(query) ||
          project.client.toLowerCase().includes(query) ||
          project.status.toLowerCase().includes(query)
        );
      })
      .map((project) => ({
        project,
        technologies: project.requiredTechnologies.map((req) =>
          this.technologyService.nameById(req.technologyId),
        ),
      }));
  });
}