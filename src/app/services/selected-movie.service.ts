import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie';
import { OnlineMovieService } from './online-movie.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedMovieService {
  public selectedMovie$: Observable<Movie>;
  constructor(private readonly movieService: OnlineMovieService) {
    this.selectedMovie$ = of(undefined);
  }

  public selectMovie(movie: Movie) {
    this.selectedMovie$ = this.movieService.extendMovieData(movie);
  }
}
