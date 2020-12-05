import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie';
import { MovieService } from './movie.service';

@Injectable({
  providedIn: 'root',
})
export class SelectedMovieService {
  public selectedMovie$: Observable<Movie>;
  constructor(private readonly movieService: MovieService) {
    this.selectedMovie$ = of(undefined);
  }

  public selectMovie(movie: Movie) {
    this.selectedMovie$ = this.movieService.extendMovieWithVideoKey(movie);
  }
}
