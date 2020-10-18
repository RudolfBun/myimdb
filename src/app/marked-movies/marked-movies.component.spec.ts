import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkedMoviesComponent } from './marked-movies.component';

describe('MarkedMoviesComponent', () => {
  let component: MarkedMoviesComponent;
  let fixture: ComponentFixture<MarkedMoviesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarkedMoviesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkedMoviesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
