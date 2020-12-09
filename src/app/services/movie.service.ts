import { Injectable } from '@angular/core';
import { combineLatest, Observable, of, zip } from 'rxjs';
import {
  defaultIfEmpty,
  first,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { Cast, Category, Movie } from '../models/movie';
import { SearchResult } from '../models/search-result';
import { OnlineMovieService } from './online-movie.service';
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
    this.topRatedMovies$ = this.getTopRatedMovies() /* .pipe(shareReplay(1)) */;
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
    return combineLatest([
      this.webStoreService.getTopRatedMovieIds(),
      this.webStoreService.getMovieMarkers(),
    ]).pipe(
      switchMap(([tops, markers]) => {
        if (tops?.length > 0) {
          const movies: Observable<Movie>[] = [];
          tops.sort((m1, m2) => m1.order - m2.order);
          tops.forEach((top) =>
            movies.push(
              this.webStoreService.getMovie(top.id).pipe(
                switchMap((movie) => {
                  const marker = markers.find(
                    (mark) => mark.movieId === movie.id
                  );
                  if (marker) {
                    return of({
                      ...movie,
                      favorite: marker.markers.favorite,
                      alreadySeen: marker.markers.alreadySeen,
                      watchlist: marker.markers.onWatchList,
                    });
                  }
                  return of(movie);
                })
              )
            )
          );
          return zip(...movies);
        } else if (navigator.onLine) {
          return this.onlineMovieService.topRatedMovies$.pipe(
            switchMap((movies) => {
              combineLatest([
                this.webStoreService.saveMovies(movies),
                this.webStoreService.saveTopRatedMovieIds(
                  movies.map(({ id }) => id)
                ),
              ])
                .pipe(defaultIfEmpty(undefined), first())
                .subscribe();

              return of(movies);
            })
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
