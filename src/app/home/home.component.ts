import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchResult } from '../models/search-result';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';
import { StorageService } from '../services/storage.service';
import { Subscription, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public movies: Movie[];
  public movies$: Observable<Movie[]>;

  constructor(
    private movieService: MovieService,
    private storageService: StorageService
  ) {
    this.movies$ = this.movieService.getTopRatedMovies();
  }

  ngOnInit(): void {}

  search(result: SearchResult) {
    this.movies$ = this.movieService.searchMovies(result);
  }
}
