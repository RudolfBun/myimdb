import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { StorageService, StoredMovieData } from '../services/storage.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouteStrings } from '../utils/route-strings';
import { map, filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-marked-movies',
  templateUrl: './marked-movies.component.html',
  styleUrls: ['./marked-movies.component.css'],
})
export class MarkedMoviesComponent implements OnInit {
  public readonly FAV_TITLE = 'Your favorites.';
  public readonly SEEN_TITLE = 'Already seen.';
  public readonly WATCHLIST_TITLE = 'Your desires.';

  public movies$: Observable<Movie[]>;
  public filterText = '';
  public filterForm = new FormControl();
  public path: string;
  public title: string;

  constructor(
    public movieService: MovieService,
    public storageService: StorageService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.path = this.route.snapshot.url[0].path;
    let content: Observable<StoredMovieData[]>;
    if (this.path === RouteStrings.FAVORITES_PATH_NAME) {
      this.title = this.FAV_TITLE;
      content = this.storageService.favoriteMovies$;
    } else if (this.path === RouteStrings.WATCHLIST_PATH_NAME) {
      this.title = this.WATCHLIST_TITLE;
      content = this.storageService.moviesOnWatchlist$;
    } else {
      this.title = this.SEEN_TITLE;
      content = this.storageService.alreadySeenMovies$;
    }
    this.movies$ = this.movieService.getContentRelatedMovies(content);
  }

  public filterMovies() {
    this.movies$ = this.movies$.pipe(
      map((movies) =>
        movies.filter((movie) =>
          movie.title
            .toLowerCase()
            .includes(this.filterForm.value.toLowerCase())
        )
      )
    );
  }
}
