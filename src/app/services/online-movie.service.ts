import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrlStrings } from '../utils/api-url-strings';
import { Movie, Cast, Category, MovieVideo } from '../models/movie';
import { SearchResult } from '../models/search-result';
import _ from 'lodash';
import {
  defaultIfEmpty,
  delayWhen,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { Observable, combineLatest, forkJoin, of, zip } from 'rxjs';
import { StorageService, StoredMovieData } from './storage.service';
import { ImageService } from './image.service';
import { WebStoreService } from './web-store.service';
@Injectable({
  providedIn: 'root',
})
export class OnlineMovieService {
  public allCategory$: Observable<Category[]>;
  public topRatedMovies$: Observable<Movie[]>;

  private readonly GENRES_KEY_SINGLE = 'genres';
  private readonly GENRES_KEY_MULTIPLE = 'genre_ids';
  private readonly CAST_ID = 'cast_id';
  private readonly ORDER = 'order';
  private readonly CHARACTER = 'character';
  private readonly NAME = 'name';
  private readonly PRFILE_IMG = 'profile_path';
  private readonly RESULTS = 'results';
  private readonly CAST = 'cast';

  private profileImageBaseUrl = `${ApiUrlStrings.IMAGE_BASE_URL}w185`;
  private posterImageBaseUrl = `${ApiUrlStrings.IMAGE_BASE_URL}w500`;
  private backImageBaseUrl = `${ApiUrlStrings.IMAGE_BASE_URL}w1280`;

  constructor(
    private http: HttpClient,
    private readonly webStoreService: WebStoreService,
    private readonly imageService: ImageService
  ) {
    this.allCategory$ = this.getAllCategory().pipe(shareReplay(1));
    this.topRatedMovies$ = this.getTopRatedMovies().pipe(
      switchMap((movies) => {
        const newMovies = movies.map((movie) =>
          this.setMovieImagesToBase64(movie)
        );
        return zip(...newMovies);
      }),
      switchMap((movies) =>
        zip(...movies.map((movie) => this.preloadAllProfilePictures(movie)))
      ),
      shareReplay(1)
    );
  }

  private getTopRatedMovies(): Observable<Movie[]> {
    return combineLatest([
      this.allCategory$,
      this.http.get(ApiUrlStrings.GET_TOP_RATED),
    ]).pipe(
      map(([categories, data]) =>
        data[this.RESULTS].map((movie) =>
          this.getMoivesFromResultArray(movie, categories, true)
        )
      )
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
      return this.topRatedMovies$;
    }
    if (navigator.onLine) {
      return combineLatest([
        this.allCategory$,
        this.http.get(queryString),
      ]).pipe(
        map(([categories, data]) => {
          if (serach.category) {
            return data[this.RESULTS].map((movie) => {
              const genres = movie.genre_ids as number[];
              if (genres.includes(serach.category.id)) {
                return this.getMoivesFromResultArray(movie, categories, true);
              }
            }) as Movie[];
          } else {
            return data[this.RESULTS].map((movie) => {
              return this.getMoivesFromResultArray(movie, categories, true);
            }) as Movie[];
          }
        }),
        switchMap((movies) => {
          const newMovies = movies.map((movie) =>
            this.setMovieImagesToBase64(movie)
          );
          return zip(...newMovies);
        }),
        switchMap((movies) =>
          zip(
            ...movies.map((movie) =>
              this.preloadAllProfilePictures(movie as Movie)
            )
          )
        ),
        shareReplay(1)
      );
    } else {
      return of(undefined);
    }
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
      backImage: movie.backdrop_path as string,
      description: movie.overview as string,
      rating: movie.vote_average as number,
      categories: multiple
        ? this.getMovieRelatedCategories(
            movie[this.GENRES_KEY_MULTIPLE] as number[],
            genres
          )
        : (movie[this.GENRES_KEY_SINGLE] as Category[]),
      release: movie.release_date as string,
      characters: this.getMovieCharactersById(movie.id as number),
      numOfVotes: movie.vote_count,
      language: movie.original_language,
      favorite: false,
      alreadySeen: false,
      watchlist: false,
    } as Movie;
  }

  public getMoiveById(url: string): Observable<Movie> {
    return combineLatest([this.allCategory$, this.http.get(url)]).pipe(
      map(
        ([categories, movie]) =>
          this.getMoivesFromResultArray(movie, categories, false) // check is is stored in indexDB
      )
    );
  }

  /* Ez ráppipol arra, hogy pl mi van a favoritesben, és lekéri erről az adatokat egyesével */
  /* Itt meglethetne nézni, hogy az adott film benne van e az idexDB-be ha nincs akkor menjen ki a lekérdezés */
  public getContentRelatedMovies(
    markedMovies$: Observable<StoredMovieData[]>
  ): Observable<Movie[]> {
    return markedMovies$.pipe(
      switchMap((markedMovies) => {
        if (markedMovies.length === 0) {
          return of([]);
        } else {
          return forkJoin([
            ...markedMovies.map((movie) => {
              return this.webStoreService.getMovie(movie.id).pipe(
                switchMap((mov) => {
                  if (mov) {
                    return of(mov);
                  } else if (navigator.onLine) {
                    return this.getMoiveById(
                      ApiUrlStrings.GET_MOVIE_WITHOUT_KEY +
                        mov.id +
                        ApiUrlStrings.API_KEY
                    ).pipe(
                      switchMap((mo) => this.setMovieImagesToBase64(mo)),
                      switchMap((mo) => this.preloadAllProfilePictures(mo)),
                      delayWhen((m) =>
                        this.webStoreService
                          .saveMovie(m)
                          .pipe(defaultIfEmpty(undefined))
                      )
                    );
                  } else {
                    of(undefined);
                  }
                })
              );
            }),
          ]);
        }
      })
    );
  }

  public setMovieImagesToBase64(movie: Movie): Observable<Movie> {
    if (!movie) {
      return of(undefined);
    }
    return combineLatest([
      movie.backImage
        ? this.imageService.preloadImage(
            this.backImageBaseUrl + movie.backImage
          )
        : of(undefined),
      movie.image
        ? this.imageService.preloadImage(this.posterImageBaseUrl + movie.image)
        : of(undefined),
    ]).pipe(
      map(
        ([back, poster]) =>
          ({
            ...movie,
            backImage: back,
            image: poster,
          } as Movie)
      )
    );
  }

  public preloadAllProfilePictures(movie: Movie): Observable<Movie> {
    if (!movie) {
      return of(undefined);
    }
    const chars$ = movie.characters.map((character) => {
      if (character.profileImage) {
        return this.imageService
          .preloadImage(this.profileImageBaseUrl + character.profileImage)
          .pipe(
            map(
              (image) =>
                ({
                  ...character,
                  profileImage: image,
                } as Cast)
            )
          );
      } else {
        return of(character);
      }
    });
    const allchars$ = zip(...chars$);
    return allchars$.pipe(
      map((casts) => ({ ...movie, characters: casts } as Movie))
    );
  }

  private getMovieVideos(id: number): Observable<MovieVideo[]> {
    const url =
      ApiUrlStrings.GET_VIDEOS_PART_1 + id + ApiUrlStrings.GET_VIDEOS_PART_2; // check is is stored in indexDB
    return this.http.get<MovieVideo[]>(url).pipe(
      map((result) => result['results']),
      map((videos) =>
        videos.map(
          (mv) =>
            ({
              id: mv.id,
              key: mv.key,
              name: mv.name,
              site: mv.site,
              type: mv.type,
            } as MovieVideo)
        )
      )
    );
  }

  public extendMovieWithVideoKey(movie: Movie): Observable<Movie> {
    if (navigator.onLine) {
      return this.getMovieVideos(movie.id).pipe(
        switchMap((videos) => {
          return of({ ...movie, videos });
        })
      );
    } else {
      return of(movie);
    }
  }
}
