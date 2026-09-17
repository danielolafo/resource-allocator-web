import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';
import { API_BASE_URL } from './shared/services/api-config';
import { MOCK_ASSIGNMENTS, MOCK_EMPLOYEES, MOCK_PROJECTS } from './shared/mock/mock-data';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [App],
      providers: [provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    flushCatalogs();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the main navigation', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    flushCatalogs();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.topbar__nav a').length).toBe(7);
  });

  function flushCatalogs(): void {
    const http = TestBed.inject(HttpTestingController);
    http.match(`${API_BASE_URL}/employees`).forEach((req) => req.flush(MOCK_EMPLOYEES));
    http.match(`${API_BASE_URL}/projects`).forEach((req) => req.flush(MOCK_PROJECTS));
    http.match(`${API_BASE_URL}/assignments`).forEach((req) => req.flush(MOCK_ASSIGNMENTS));
  }
});