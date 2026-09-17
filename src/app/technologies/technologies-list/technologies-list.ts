import { Component, computed, inject, signal } from '@angular/core';
import { Technology } from '../../shared/models/technology';
import { TechnologyService } from '../../shared/services/technology.service';

@Component({
  selector: 'app-technologies-list',
  standalone: false,
  templateUrl: './technologies-list.html',
  styleUrl: './technologies-list.css',
})
export class TechnologiesList {
  private readonly technologyService = inject(TechnologyService);

  readonly technologies = this.technologyService.technologies;
  readonly filter = signal('');

  readonly filtered = computed<Technology[]>(() => {
    const query = this.filter().trim().toLowerCase();
    const list = this.technologies();
    if (!query) {
      return list;
    }
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.version.toLowerCase().includes(query),
    );
  });
}