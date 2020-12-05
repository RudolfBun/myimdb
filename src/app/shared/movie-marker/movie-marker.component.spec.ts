import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieMarkerComponent } from './movie-marker.component';

describe('MovieMarkerComponent', () => {
  let component: MovieMarkerComponent;
  let fixture: ComponentFixture<MovieMarkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieMarkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
