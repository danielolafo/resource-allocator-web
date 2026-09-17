import { Component, inject } from '@angular/core';
import { AlertService } from './shared/services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App {
  private readonly alertService = inject(AlertService);

  readonly unreadAlerts = this.alertService.unreadCount;
}