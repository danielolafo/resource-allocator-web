import { Injectable, signal } from '@angular/core';
import { Project } from '../models/project';
import { MOCK_PROJECTS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly _projects = signal<Project[]>(MOCK_PROJECTS);

  readonly projects = this._projects.asReadonly();

  byId(id: number): Project | undefined {
    return this._projects().find((p) => p.id === id);
  }

  nameById(id: number): string {
    return this.byId(id)?.name ?? `Proyecto #${id}`;
  }

  addProject(project: Omit<Project, 'id'>): Project {
    const nextId = Math.max(0, ...this._projects().map((p) => p.id)) + 1;
    const created: Project = { ...project, id: nextId };
    this._projects.update((list) => [...list, created]);
    return created;
  }
}