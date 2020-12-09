import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Movie, MovieMarker } from '../models/movie';
import { AuthService } from './auth.service';
import {
  defaultIfEmpty,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Observable, of, combineLatest, concat } from 'rxjs';
import { WebStoreService } from './web-store.service';

export interface StoredMovieData {
  id: number;
  title: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly COLL_FAVORITES = 'Favorites';
  private readonly COLL_ALREADY_SEEN = 'AlreadySeen';
  private readonly COLL_WATCHLIST = 'Watchlist';

  public readonly favoriteMovies$: Observable<StoredMovieData[]>;
  public readonly alreadySeenMovies$: Observable<StoredMovieData[]>;
  public readonly moviesOnWatchlist$: Observable<StoredMovieData[]>;

  constructor(
    private fireStore: AngularFirestore,
    private authService: AuthService,
    private webStoreService: WebStoreService
  ) {
    if (navigator.onLine) {
      this.favoriteMovies$ = this.fireStore
        .collection<StoredMovieData>(this.COLL_FAVORITES)
        .valueChanges();
      this.alreadySeenMovies$ = this.fireStore
        .collection<StoredMovieData>(this.COLL_ALREADY_SEEN)
        .valueChanges();
      this.moviesOnWatchlist$ = this.fireStore
        .collection<StoredMovieData>(this.COLL_WATCHLIST)
        .valueChanges();
    } else {
      this.favoriteMovies$ = this.webStoreService.getMovieMarkers().pipe(
        map((markers) => {
          const movies = markers.filter(
            (mark) => mark.markers.favorite === true
          );
          return movies.map(
            (mark) =>
              ({ id: mark.movieId, username: 'admin' } as StoredMovieData)
          );
        })
      );
      this.alreadySeenMovies$ = this.webStoreService.getMovieMarkers().pipe(
        map((markers) => {
          const movies = markers.filter(
            (mark) => mark.markers.alreadySeen === true
          );
          return movies.map(
            (mark) =>
              ({ id: mark.movieId, username: 'admin' } as StoredMovieData)
          );
        })
      );
      this.moviesOnWatchlist$ = this.webStoreService.getMovieMarkers().pipe(
        map((markers) => {
          const movies = markers.filter(
            (mark) => mark.markers.onWatchList === true
          );
          return movies.map(
            (mark) =>
              ({ id: mark.movieId, username: 'admin' } as StoredMovieData)
          );
        })
      );
    }
  }

  addFavorite(movie: Movie) {
    this.updateIndexDBMarkers(movie, this.COLL_FAVORITES);

    const data = this.createStoredMovieData(movie);
    return this.addToDatabase(this.COLL_FAVORITES, movie.id, data);
  }

  removeFavorite(movie: Movie) {
    this.updateIndexDBMarkers(movie, this.COLL_FAVORITES);

    return this.removeFromDatabes(this.COLL_FAVORITES, movie.id);
  }

  addAlreadySeen(movie: Movie) {
    this.updateIndexDBMarkers(movie, this.COLL_ALREADY_SEEN);

    const data = this.createStoredMovieData(movie);
    return this.addToDatabase(this.COLL_ALREADY_SEEN, movie.id, data);
  }

  removeAlreadySeen(movie: Movie) {
    this.updateIndexDBMarkers(movie, this.COLL_ALREADY_SEEN);

    return this.removeFromDatabes(this.COLL_ALREADY_SEEN, movie.id);
  }

  addOnWatchlist(movie: Movie) {
    this.updateIndexDBMarkers(movie, this.COLL_WATCHLIST);

    const data = this.createStoredMovieData(movie);
    return this.addToDatabase(this.COLL_WATCHLIST, movie.id, data);
  }

  removeFromWatchlist(movie: Movie) {
    this.updateIndexDBMarkers(movie, this.COLL_WATCHLIST);

    return this.removeFromDatabes(this.COLL_WATCHLIST, movie.id);
  }

  private addToDatabase(
    collection: string,
    movieId: number,
    movie: StoredMovieData
  ) {
    return this.fireStore.collection(collection).doc(`${movieId}`).set(movie);
  }

  private removeFromDatabes(collection: string, movieId: number) {
    return this.fireStore.collection(collection).doc(`${movieId}`).delete();
  }

  public getMovieState(id: number): Observable<MovieMarker> {
    return combineLatest([
      this.favoriteMovies$,
      this.alreadySeenMovies$,
      this.moviesOnWatchlist$,
    ]).pipe(
      switchMap(([favColl, seenColl, watchColl]) => {
        const favorite = favColl.some((movie) => movie.id === id);
        const alreadySeen = seenColl.some((movie) => movie.id === id);
        const onWatchList = watchColl.some((movie) => movie.id === id);
        const movieMarker = {
          favorite,
          alreadySeen,
          onWatchList,
        } as MovieMarker;
        return of(movieMarker);
      }),
      tap((marker) =>
        this.webStoreService
          .saveMovieMarker(id, marker)
          .pipe(defaultIfEmpty(undefined))
      ),
      shareReplay(1)
    );
  }

  private createStoredMovieData(movie: Movie): StoredMovieData {
    return {
      id: movie.id,
      title: movie.title,
      username: this.authService.getUser.username,
    } as StoredMovieData;
  }

  private updateIndexDBMarkers(movie: Movie, collection: string): void {
    concat(
      this.webStoreService.saveMovieMarker(movie.id, {
        favorite: movie.favorite,
        alreadySeen: movie.alreadySeen,
        onWatchList: movie.watchlist,
      }),
      this.webStoreService.saveMovie(movie)
    )
      .pipe(defaultIfEmpty(undefined))
      .subscribe();
  }
}
