import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  DocumentChangeAction,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Movie } from '../models/movie';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ApiUrlStrings } from '../utils/api-url-strings';

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
    private authService: AuthService
  ) {
    this.favoriteMovies$ = this.fireStore
      .collection<StoredMovieData>(this.COLL_FAVORITES)
      .valueChanges();
    this.alreadySeenMovies$ = this.fireStore
      .collection<StoredMovieData>(this.COLL_ALREADY_SEEN)
      .valueChanges();
    this.moviesOnWatchlist$ = this.fireStore
      .collection<StoredMovieData>(this.COLL_WATCHLIST)
      .valueChanges();
  }

  addFavorite(movie: Movie) {
    const data = this.createStoredMovieData(movie);
    return this.addToDatabase(this.COLL_FAVORITES, `${movie.id}`, data);
  }

  removeFavorite(movie: Movie) {
    return this.removeFromDatabes(this.COLL_FAVORITES, `${movie.id}`);
  }

  addAlreadySeen(movie: Movie) {
    const data = this.createStoredMovieData(movie);
    return this.addToDatabase(this.COLL_ALREADY_SEEN, `${movie.id}`, data);
  }

  removeAlreadySeen(movie: Movie) {
    return this.removeFromDatabes(this.COLL_ALREADY_SEEN, `${movie.id}`);
  }

  addOnWatchlist(movie: Movie) {
    const data = this.createStoredMovieData(movie);
    return this.addToDatabase(this.COLL_WATCHLIST, `${movie.id}`, data);
  }

  removeFromWatchlist(movie: Movie) {
    return this.removeFromDatabes(this.COLL_WATCHLIST, `${movie.id}`);
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

  public isMovieFavorite(id: number): Observable<boolean> {
    return this.getMovieState(this.COLL_FAVORITES, id);
  }

  public isMovieAlreadySeen(id: number): Observable<boolean> {
    return this.getMovieState(this.COLL_ALREADY_SEEN, id);
  }

  public isMovieOnWatchlist(id: number): Observable<boolean> {
    return this.getMovieState(this.COLL_WATCHLIST, id);
  }

  private getMovieState(collection: string, id: number): Observable<boolean> {
    return this.fireStore
      .collection(collection)
      .doc(`${id}`)
      .valueChanges()
      .pipe(
        map((data) => {
          if (data) {
            return true;
          } else {
            return false;
          }
        })
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
