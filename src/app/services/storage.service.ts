import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentChangeAction,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Movie, MovieMarker } from '../models/movie';
import { AuthService } from './auth.service';
import {
  defaultIfEmpty,
  delayWhen,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Observable, of, BehaviorSubject, combineLatest, concat } from 'rxjs';
import { ApiUrlStrings } from '../utils/api-url-strings';
import { MovieService } from './movie.service';
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
    private movieService: MovieService,
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
      this.favoriteMovies$ = this.webStoreService.getMovieMarker().pipe(
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
      this.alreadySeenMovies$ = this.webStoreService.getMovieMarker().pipe(
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
      this.moviesOnWatchlist$ = this.webStoreService.getMovieMarker().pipe(
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
    if (navigator.onLine) {
      const data = this.createStoredMovieData(movie);
      return this.addToDatabase(this.COLL_FAVORITES, `${movie.id}`, data);
    }
  }

  removeFavorite(movie: Movie) {
    if (navigator.onLine) {
      return this.removeFromDatabes(this.COLL_FAVORITES, `${movie.id}`);
    }
  }

  addAlreadySeen(movie: Movie) {
    if (navigator.onLine) {
      const data = this.createStoredMovieData(movie);
      return this.addToDatabase(this.COLL_ALREADY_SEEN, `${movie.id}`, data);
    }
  }

  removeAlreadySeen(movie: Movie) {
    if (navigator.onLine) {
      return this.removeFromDatabes(this.COLL_ALREADY_SEEN, `${movie.id}`);
    }
  }

  addOnWatchlist(movie: Movie) {
    if (navigator.onLine) {
      const data = this.createStoredMovieData(movie);
      return this.addToDatabase(this.COLL_WATCHLIST, `${movie.id}`, data);
    }
  }

  removeFromWatchlist(movie: Movie) {
    if (navigator.onLine) {
      return this.removeFromDatabes(this.COLL_WATCHLIST, `${movie.id}`);
    }
  }

  private addToDatabase(
    collection: string,
    key: string,
    movie: StoredMovieData
  ) {
    return this.fireStore.collection(collection).doc(key).set(movie);
  }

  private removeFromDatabes(collection: string, key: string) {
    return this.fireStore.collection(collection).doc(key).delete();
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
      delayWhen((marker) =>
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
}
