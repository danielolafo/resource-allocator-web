import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AlertService, DEFAULT_THRESHOLD_DAYS } from './alert.service';
import { API_BASE_URL } from './api-config';
import { MOCK_ASSIGNMENTS, MOCK_EMPLOYEES, MOCK_PROJECTS } from '../mock/mock-data';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(AlertService);
    const http = TestBed.inject(HttpTestingController);
    http.match(`${API_BASE_URL}/employees`).forEach((req) => req.flush(MOCK_EMPLOYEES));
    http.match(`${API_BASE_URL}/projects`).forEach((req) => req.flush(MOCK_PROJECTS));
    http.match(`${API_BASE_URL}/assignments`).forEach((req) => req.flush(MOCK_ASSIGNMENTS));
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