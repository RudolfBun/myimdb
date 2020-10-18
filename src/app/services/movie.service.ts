import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrlStrings } from '../utils/api-url-strings';
import { Movie, Cast, Category } from '../models/movie';
import { SearchResult } from '../models/search-result';
import _ from 'lodash';
import { map, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, forkJoin } from 'rxjs';
import { StorageService, StoredMovieData } from './storage.service';
@Injectable({
  providedIn: 'root',
})
export class MovieService {
  public allCategory$: Observable<Category[]>;

  private readonly GENRES_KEY_SINGLE = 'genres';
  private readonly GENRES_KEY_MULTIPLE = 'genre_ids';
  private readonly CAST_ID = 'cast_id';
  private readonly ORDER = 'order';
  private readonly CHARACTER = 'character';
  private readonly NAME = 'name';
  private readonly PRFILE_IMG = 'profile_path';
  private readonly RESULTS = 'results';
  private readonly CAST = 'cast';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.allCategory$ = this.getAllCategory();
  }

  public getTopRatedMovies(): Observable<Movie[]> {
    return combineLatest([
      this.allCategory$,
      this.http.get(ApiUrlStrings.GET_TOP_RATED),
    ]).pipe(
      map(([categories, data]) => {
        return data[this.RESULTS].map((movie) => {
          return this.getMoivesFromResultArray(movie, categories, true);
        });
      })
    );
  }

  public getMovieCharactersById(id: number): Cast[] {
    const casts: Cast[] = [];
    this.http
      .get(
        ApiUrlStrings.GET_MOVIE_WITHOUT_KEY +
          id +
          ApiUrlStrings.GET_CREDITS_PART2
      )
      .subscribe((result) => {
        const characters: [] = result[this.CAST];
        const topFive = characters.slice(0, 5);
        topFive.forEach((character) => {
          casts.push({
            id: character[this.CAST_ID] as number,
            order: character[this.ORDER] as number,
            character: character[this.CHARACTER] as string,
            name: character[this.NAME] as string,
            profileImage: character[this.PRFILE_IMG]
              ? character[this.PRFILE_IMG]
              : undefined,
          } as Cast);
        });
      });
    return casts;
  }

  public getAllCategory(): Observable<Category[]> {
    return this.http.get(ApiUrlStrings.GET_ALL_CATEGORY).pipe(
      map((data: []) =>
        data[this.GENRES_KEY_SINGLE].map((genre) => {
          return {
            id: genre.id as number,
            name: genre.name as string,
          } as Category;
        })
      )
    );
  }

  public getMovieRelatedCategories(
    ids: number[],
    categories: Category[]
  ): Category[] {
    return categories.filter((item) => ids.includes(item.id));
  }

  public searchMovies(serach: SearchResult): Observable<Movie[]> {
    const queryString = this.setRequestUrl(serach);
    if (queryString === undefined) {
      return this.getTopRatedMovies();
    }

    return combineLatest([this.allCategory$, this.http.get(queryString)]).pipe(
      map(([categories, data]) => {
        if (serach.category) {
          return data[this.RESULTS].map((movie) => {
            const genres = movie.genre_ids as number[];
            if (genres.includes(serach.category.id)) {
              return this.getMoivesFromResultArray(movie, categories, true);
            }
          });
        } else {
          return data[this.RESULTS].map((movie) => {
            return this.getMoivesFromResultArray(movie, categories, true);
          });
        }
      })
    );
  }

  private setRequestUrl(serach: SearchResult): string | undefined {
    if (
      serach.category &&
      serach.title === undefined &&
      serach.year === undefined
    ) {
      return ApiUrlStrings.GET_MOVIES_BY_CATEGORY + serach.category.id;
    } else if (
      serach.category === undefined &&
      serach.year &&
      serach.title === undefined
    ) {
      return ApiUrlStrings.GET_MOVIES_BY_YEAR + serach.year;
    } else if (serach.category && serach.year && serach.title === undefined) {
      return (
        ApiUrlStrings.GET_MOVIES_BY_CATEGORY +
        serach.category.id +
        ApiUrlStrings.YEAR +
        serach.year
      );
    } else if (
      (serach.category === undefined &&
        serach.year === undefined &&
        serach.title) ||
      (serach.category && serach.year === undefined && serach.title)
    ) {
      return ApiUrlStrings.GET_MOVIES_WITH_QUERY + serach.title;
    } else if (
      (serach.category === undefined && serach.year && serach.title) ||
      (serach.category && serach.year && serach.title)
    ) {
      return (
        ApiUrlStrings.GET_MOVIES_WITH_QUERY +
        serach.title +
        ApiUrlStrings.YEAR +
        serach.year
      );
    } else {
      return undefined;
    }
  }

  private getMoivesFromResultArray(
    movie,
    genres: Category[],
    multiple: boolean
  ): Movie {
    return {
      id: movie.id as number,
      title: movie.title as string,
      image: movie.poster_path as string,
      descreption: movie.overview as string,
      rating: movie.vote_average as number,
      categories: multiple
        ? this.getMovieRelatedCategories(
            movie[this.GENRES_KEY_MULTIPLE] as number[],
            genres
          )
        : (movie[this.GENRES_KEY_SINGLE] as Category[]),
      release: movie.release_date as string,
      characters: this.getMovieCharactersById(movie.id as number),
      favorite: false,
      alreadySeen: false,
      watchlist: false,
    } as Movie;
  }

  public getMoiveById(url: string): Observable<Movie> {
    return combineLatest([this.allCategory$, this.http.get(url)]).pipe(
      map(([categories, movie]) => {
        return this.getMoivesFromResultArray(movie, categories, false);
      })
    );
  }

  public getAllFavoriteMovies(
    markedMovies$: Observable<StoredMovieData[]>
  ): Observable<Movie[]> {
    return markedMovies$.pipe(
      switchMap((favorites) => {
        return forkJoin([
          ...favorites.map((b) => {
            return this.getMoiveById(
              ApiUrlStrings.GET_MOVIE_WITHOUT_KEY + b.id + ApiUrlStrings.API_KEY
            );
          }),
        ]);
      })
    );
  }
  public getAllAlreadySeenMovies(): Observable<Movie[]> {
    return this.storageService.alreadySeenMovies$.pipe(
      switchMap((favorites) => {
        return forkJoin([
          ...favorites.map((b) => {
            return this.getMoiveById(
              ApiUrlStrings.GET_MOVIE_WITHOUT_KEY + b.id + ApiUrlStrings.API_KEY
            );
          }),
        ]);
      })
    );
  }
  public getAllWatchlistMovies(): Observable<Movie[]> {
    return this.storageService.moviesOnWatchlist$.pipe(
      switchMap((favorites) => {
        return forkJoin([
          ...favorites.map((b) => {
            return this.getMoiveById(
              ApiUrlStrings.GET_MOVIE_WITHOUT_KEY + b.id + ApiUrlStrings.API_KEY
            );
          }),
        ]);
      })
    );
  }
}
