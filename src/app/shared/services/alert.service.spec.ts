import { TestBed } from '@angular/core/testing';
import { AlertService, DEFAULT_THRESHOLD_DAYS } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should generate alerts for assignments finishing within the threshold', () => {
    const alerts = service.alerts();
    expect(alerts.length).toBeGreaterThan(0);
    for (const alert of alerts) {
      expect(alert.daysRemaining).toBeLessThanOrEqual(service.thresholdDays());
    }
  });

  it('should not generate alerts beyond the threshold', () => {
    service.setThresholdDays(1);
    const alerts = service.alerts();
    for (const alert of alerts) {
      expect(alert.daysRemaining).toBeLessThanOrEqual(1);
    }
  });

  it('should track read/unread state', () => {
    const before = service.unreadCount();
    const first = service.alerts()[0];
    service.markAsRead(first.assignmentId);
    expect(service.unreadCount()).toBe(before - 1);
  });

  it('should default the threshold', () => {
    expect(service.thresholdDays()).toBe(DEFAULT_THRESHOLD_DAYS);
  });
});