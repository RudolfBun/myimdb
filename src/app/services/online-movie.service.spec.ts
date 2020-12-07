import { TestBed } from '@angular/core/testing';

import { OnlineMovieService } from './online-movie.service';

describe('MovieService', () => {
  let service: OnlineMovieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineMovieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
