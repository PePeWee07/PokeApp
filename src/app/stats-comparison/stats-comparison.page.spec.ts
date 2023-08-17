import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsComparisonPage } from './stats-comparison.page';

describe('StatsComparisonPage', () => {
  let component: StatsComparisonPage;
  let fixture: ComponentFixture<StatsComparisonPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StatsComparisonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
