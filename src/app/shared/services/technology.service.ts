import { Injectable, signal } from '@angular/core';
import { Technology } from '../models/technology';
import { MOCK_TECHNOLOGIES } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class TechnologyService {
  private readonly _technologies = signal<Technology[]>(MOCK_TECHNOLOGIES);

  readonly technologies = this._technologies.asReadonly();

  byId(id: number): Technology | undefined {
    return this._technologies().find((t) => t.id === id);
  }

  nameById(id: number): string {
    return this.byId(id)?.name ?? `Tecnología #${id}`;
  }

  addTechnology(technology: Omit<Technology, 'id'>): Technology {
    const nextId = Math.max(0, ...this._technologies().map((t) => t.id)) + 1;
    const created: Technology = { ...technology, id: nextId };
    this._technologies.update((list) => [...list, created]);
    return created;
  }
}