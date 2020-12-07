import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { Category, Movie, MovieMarker } from '../models/movie';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root',
})
export class WebStoreService {
  private db$: Observable<IDBDatabase>;

  private readonly movieStoreName = 'movies';
  private readonly topRatedMoviesStoreName = 'topRated';
  private readonly categoriesStoreName = 'categories';
  private readonly movieMarkerStoreName = 'movieMarks';

  constructor(private readonly imageService: ImageService) {
    this.initDb();
  }

  private initDb(): void {
    this.db$ = new Observable<IDBDatabase>((subscriber) => {
      const openRequest = indexedDB.open('cache');
      openRequest.onupgradeneeded = () => this.createDb(openRequest.result);
      openRequest.onsuccess = () => {
        subscriber.next(openRequest.result);
        subscriber.complete();
      };
    }).pipe(shareReplay({ refCount: false, bufferSize: 1 }));
  }

  private createDb(db: IDBDatabase): void {
    db.createObjectStore(this.movieStoreName, { keyPath: 'id' });
    db.createObjectStore(this.topRatedMoviesStoreName);
    db.createObjectStore(this.movieMarkerStoreName);
    db.createObjectStore(this.categoriesStoreName);
  }

  public getMovie(movieId: number): Observable<Movie> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<Movie>((subscriber) => {
            let transaction = db.transaction(this.movieStoreName);
            const request = transaction
              .objectStore(this.movieStoreName)
              .get(movieId);
            transaction.oncomplete = () => {
              transaction = null;
              subscriber.next(request.result);
              subscriber.complete();
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public saveMovie(movie: Movie): Observable<never> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<never>((subscriber) => {
            let transaction = db.transaction(this.movieStoreName, 'readwrite');
            transaction.objectStore(this.movieStoreName).put(movie);
            transaction.oncomplete = () => {
              transaction = null;
              subscriber.complete();
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public saveTopRatedMovieIds(movieIds: number[]): Observable<never> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<never>((subscriber) => {
            let transaction = db.transaction(
              this.topRatedMoviesStoreName,
              'readwrite'
            );
            let order = 1;
            movieIds.forEach((id) => {
              transaction
                .objectStore(this.topRatedMoviesStoreName)
                .put(order, id);
              order++;
            });
            transaction.oncomplete = () => {
              transaction = null;
              subscriber.complete();
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public getTopRatedMovieIds(): Observable<{ id: number; order: number }[]> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<{ id: number; order: number }[]>((subscriber) => {
            let transaction = db.transaction(this.topRatedMoviesStoreName);
            const request = transaction
              .objectStore(this.topRatedMoviesStoreName)
              .openCursor();
            const result: { id: number; order: number }[] = [];
            request.onsuccess = () => {
              const cursor = request.result;
              if (cursor) {
                const orderValue = cursor.value;
                if (orderValue) {
                  result.push({
                    id: cursor.key,
                    order: orderValue,
                  } as { id: number; order: number });
                }
                cursor.continue();
              } else {
                transaction = null;
                subscriber.next(result);
                subscriber.complete();
              }
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public getCategories(): Observable<Category[]> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<Category[]>((subscriber) => {
            let transaction = db.transaction(this.categoriesStoreName);
            const request = transaction
              .objectStore(this.categoriesStoreName)
              .openCursor();
            const result: Category[] = [];
            request.onsuccess = () => {
              const cursor = request.result;
              if (cursor) {
                const categoryName = cursor.value;
                if (categoryName) {
                  result.push({
                    id: cursor.key,
                    name: categoryName,
                  } as Category);
                }
                cursor.continue();
              } else {
                transaction = null;
                subscriber.next(result);
                subscriber.complete();
              }
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public saveCategories(categories: Category[]): Observable<never> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<never>((subscriber) => {
            let transaction = db.transaction(
              this.categoriesStoreName,
              'readwrite'
            );
            categories.forEach((cat) =>
              transaction
                .objectStore(this.categoriesStoreName)
                .put(cat.name, cat.id)
            );
            transaction.oncomplete = () => {
              transaction = null;
              subscriber.complete();
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public saveMovies(movies: Movie[]): Observable<never> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<never>((subscriber) => {
            let transaction = db.transaction(this.movieStoreName, 'readwrite');
            movies.forEach((movie) =>
              transaction.objectStore(this.movieStoreName).put(movie)
            );
            transaction.oncomplete = () => {
              transaction = null;
              subscriber.complete();
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public saveMovieMarker(
    movieId: number,
    markers: MovieMarker
  ): Observable<never> {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<never>((subscriber) => {
            let transaction = db.transaction(
              this.movieMarkerStoreName,
              'readwrite'
            );
            transaction
              .objectStore(this.movieMarkerStoreName)
              .put(markers, movieId);
            transaction.oncomplete = () => {
              transaction = null;
              subscriber.complete();
            };
            return () => transaction?.abort();
          })
      )
    );
  }

  public getMovieMarker(): Observable<
    { movieId: number; markers: MovieMarker }[]
  > {
    return this.db$.pipe(
      switchMap(
        (db) =>
          new Observable<{ movieId: number; markers: MovieMarker }[]>(
            (subscriber) => {
              let transaction = db.transaction(this.movieMarkerStoreName);
              const request = transaction
                .objectStore(this.movieMarkerStoreName)
                .openCursor();
              const result: { movieId: number; markers: MovieMarker }[] = [];
              request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                  const m = cursor.value;
                  if (m) {
                    result.push({
                      movieId: cursor.key,
                      markers: m.value,
                    } as { movieId: number; markers: MovieMarker });
                  }
                  cursor.continue();
                } else {
                  transaction = null;
                  subscriber.next(result);
                  subscriber.complete();
                }
              };
              return () => transaction?.abort();
            }
          )
      )
    );
  }
}
