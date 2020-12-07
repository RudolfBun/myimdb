import { Injectable } from '@angular/core';
import {
  combineLatest,
  concat,
  forkJoin,
  merge,
  Observable,
  of,
  zip,
} from 'rxjs';
import {
  defaultIfEmpty,
  delayWhen,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Cast, Category, Movie } from '../models/movie';
import { SearchResult } from '../models/search-result';
import { ApiUrlStrings } from '../utils/api-url-strings';
import { ImageService } from './image.service';
import { OnlineMovieService } from './online-movie.service';
import { StoredMovieData } from './storage.service';
import { WebStoreService } from './web-store.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  public allCategory$: Observable<Category[]>;
  public topRatedMovies$: Observable<Movie[]>;

  constructor(
    private readonly webStoreService: WebStoreService,
    private readonly onlineMovieService: OnlineMovieService
  ) {
    this.allCategory$ = this.getAllCategory().pipe(shareReplay(1));
    this.topRatedMovies$ = this.getTopRatedMovies().pipe(shareReplay(1));
  }

  public getAllCategory(): Observable<Category[]> {
    return this.webStoreService.getCategories().pipe(
      switchMap((categories) => {
        if (categories?.length > 0) {
          return of(categories);
        } else if (navigator.onLine) {
          return this.onlineMovieService.allCategory$.pipe(
            map((categoriesArray) =>
              this.webStoreService.saveCategories(categoriesArray)
            )
          );
        } else {
          return of(undefined);
        }
      })
    );
  }

  private getTopRatedMovies(): Observable<Movie[]> {
    return this.webStoreService.getTopRatedMovieIds().pipe(
      switchMap((tops) => {
        if (tops?.length > 0) {
          const movies: Observable<Movie>[] = [];
          tops.sort((m1, m2) => m1.order - m2.order);
          tops.forEach((top) =>
            movies.push(this.webStoreService.getMovie(top.id))
          );
          return zip(...movies);
        } else if (navigator.onLine) {
          return this.onlineMovieService.topRatedMovies$.pipe(
            delayWhen((movies) =>
              concat(
                this.webStoreService.saveMovies(movies),
                this.webStoreService.saveTopRatedMovieIds(
                  movies.map(({ id }) => id)
                )
              ).pipe(defaultIfEmpty(undefined))
            )
          );
        } else {
          return of(undefined);
        }
      })
    );
  }

  public searchMovies(serach: SearchResult): Observable<Movie[]> {
    return this.onlineMovieService.searchMovies(serach);
  }
}
