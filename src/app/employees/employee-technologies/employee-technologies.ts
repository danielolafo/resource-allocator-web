import { Component, Input, inject } from '@angular/core';
import { Employee } from '../../shared/models/employee';
import { TechnologyService } from '../../shared/services/technology.service';

@Component({
  selector: 'app-employee-technologies',
  standalone: false,
  templateUrl: './employee-technologies.html',
  styleUrl: './employee-technologies.css',
})
export class EmployeeTechnologies {
  @Input() employee!: Employee;

  private readonly technologyService = inject(TechnologyService);

  technologyName(id: number): string {
    return this.technologyService.nameById(id);
  }
}