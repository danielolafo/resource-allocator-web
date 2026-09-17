import { Component, inject } from '@angular/core';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-alerts-list',
  standalone: false,
  templateUrl: './alerts-list.html',
  styleUrl: './alerts-list.css',
})
export class AlertsList {
  private readonly alertService = inject(AlertService);

  readonly alerts = this.alertService.alerts;
  readonly unreadCount = this.alertService.unreadCount;
  readonly thresholdDays = this.alertService.thresholdDays;

  setThreshold(value: string): void {
    const days = Number(value);
    this.alertService.setThresholdDays(Number.isFinite(days) ? days : 0);
  }

  markAsRead(assignmentId: number): void {
    this.alertService.markAsRead(assignmentId);
  }

  markAllAsRead(): void {
    this.alertService.markAllAsRead();
  }
}