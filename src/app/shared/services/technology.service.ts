import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Technology } from '../models/technology';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class TechnologyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/technologies`;

  private readonly _technologies = signal<Technology[]>([]);

  readonly technologies = this._technologies.asReadonly();

  constructor() {
    this.http.get<Technology[]>(this.baseUrl).subscribe({
      next: (list) => this._technologies.set(list),
      error: (error) =>
        console.error('No se pudieron cargar las tecnologías desde el backend:', error),
    });
  }

  byId(id: number): Technology | undefined {
    return this._technologies().find((t) => t.id === id);
  }

  nameById(id: number): string {
    return this.byId(id)?.name ?? `Tecnología #${id}`;
  }

  addTechnology(technology: Omit<Technology, 'id'>): Observable<Technology> {
    return this.http.post<Technology>(this.baseUrl, technology).pipe(
      tap((created) => this._technologies.update((list) => [...list, created])),
    );
  }
}