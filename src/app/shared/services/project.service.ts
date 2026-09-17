import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Project } from '../models/project';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/projects`;

  private readonly _projects = signal<Project[]>([]);

  readonly projects = this._projects.asReadonly();

  constructor() {
    this.http.get<Project[]>(this.baseUrl).subscribe({
      next: (list) => this._projects.set(list),
      error: (error) =>
        console.error('No se pudieron cargar los proyectos desde el backend:', error),
    });
  }

  byId(id: number): Project | undefined {
    return this._projects().find((p) => p.id === id);
  }

  nameById(id: number): string {
    return this.byId(id)?.name ?? `Proyecto #${id}`;
  }

  addProject(project: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project).pipe(
      tap((created) => this._projects.update((list) => [...list, created])),
    );
  }
}