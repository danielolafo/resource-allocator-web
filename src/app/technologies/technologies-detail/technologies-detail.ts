import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { EmployeeService } from '../../shared/services/employee.service';
import { TechnologyService } from '../../shared/services/technology.service';

interface TechnologyUser {
  employeeId: number;
  employeeName: string;
  position: string;
  level: string;
  version: string;
  yearsExperience: number;
}

@Component({
  selector: 'app-technologies-detail',
  standalone: false,
  templateUrl: './technologies-detail.html',
  styleUrl: './technologies-detail.css',
})
export class TechnologiesDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly technologyService = inject(TechnologyService);
  private readonly employeeService = inject(EmployeeService);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id') ?? 0))),
    { initialValue: 0 },
  );

  readonly technology = computed(() => this.technologyService.byId(this.id()));

  readonly users = computed<TechnologyUser[]>(() => {
    const tech = this.technology();
    if (!tech) {
      return [];
    }
    return this.employeeService.employees().flatMap((employee) => {
      const mastery = employee.technologies.find((t) => t.technologyId === tech.id);
      return mastery
        ? [
            {
              employeeId: employee.id,
              employeeName: `${employee.firstName} ${employee.lastName}`,
              position: employee.position,
              level: mastery.level,
              version: mastery.version,
              yearsExperience: mastery.yearsExperience,
            },
          ]
        : [];
    });
  });
}