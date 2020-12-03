import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchResult } from '../models/search-result';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';
import { StorageService } from '../services/storage.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  public movies: Movie[];
  public movies$: Observable<Movie[]>;

  constructor(private movieService: MovieService) {
    this.movies$ = this.movieService.topRatedMovies$;
  }

  public search(result: SearchResult): void {
    this.movies$ = this.movieService.searchMovies(result);
  }
}
