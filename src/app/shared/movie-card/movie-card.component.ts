import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Movie } from 'src/app/models/movie';
import { ApiUrlStrings } from 'src/app/utils/api-url-strings';
import { MovieService } from 'src/app/services/movie.service';
import {
  StorageService,
  StoredMovieData,
} from 'src/app/services/storage.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css'],
})
export class MovieCardComponent implements OnInit, OnDestroy {
  @Input() movie: Movie;
  public readonly imageBaseUrl = ApiUrlStrings.IMAGE_BASE_URL;
  public imagePath: string;
  public release: string;
  private imageSize = 'w185';
  private snackBarAction = 'OK';

  public favoriteSubscription: Subscription;
  public alreadySeenSubscription: Subscription;
  public watchlistSubscription: Subscription;

  constructor(
    public movieService: MovieService,
    private storageService: StorageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.favoriteSubscription.unsubscribe();
    this.alreadySeenSubscription.unsubscribe();
    this.watchlistSubscription.unsubscribe();
  }

  ngOnInit(): void {
    if (this.movie.image) {
      this.imagePath = this.imageBaseUrl + this.imageSize + this.movie.image;
    } else {
      this.imagePath = '../../../assets/not-found.png';
    }

    this.favoriteSubscription = this.storageService
      .isMovieFavorite(this.movie.id)
      .subscribe((res) => {
        if (res) {
          this.movie.favorite = true;
        } else {
          this.movie.favorite = false;
        }
      });

    this.alreadySeenSubscription = this.storageService
      .isMovieAlreadySeen(this.movie.id)
      .subscribe((res) => {
        if (res) {
          this.movie.alreadySeen = true;
        } else {
          this.movie.alreadySeen = false;
        }
      });

    this.watchlistSubscription = this.storageService
      .isMovieOnWatchlist(this.movie.id)
      .subscribe((res) => {
        if (res) {
          this.movie.watchlist = true;
        } else {
          this.movie.watchlist = false;
        }
      });
    this.release = this.movie.release.slice(0, 4);
  }

  public changeFavorite() {
    this.snackBar.open(
      'You added the movie to your favorites!',
      this.snackBarAction,
      {
        duration: 2000,
      }
    );
    this.movie.favorite = !this.movie.favorite;
    if (this.movie.favorite) {
      this.storageService.addFavorite(this.movie);
    } else {
      this.storageService.removeFavorite(this.movie);
    }
  }

  public changeAlreadySeen() {
    this.snackBar.open(
      'You marked the movie as already seen!',
      this.snackBarAction,
      {
        duration: 2000,
      }
    );
    this.movie.alreadySeen = !this.movie.alreadySeen;
    console.log(this.movie.alreadySeen);
    if (this.movie.alreadySeen) {
      this.storageService.addAlreadySeen(this.movie);
    } else {
      this.storageService.removeAlreadySeen(this.movie);
    }
  }

  public changeWatchList() {
    this.snackBar.open(
      'You added the movie on your watchlist!',
      this.snackBarAction,
      {
        duration: 2000,
      }
    );
    this.movie.watchlist = !this.movie.watchlist;
    if (this.movie.watchlist) {
      this.storageService.addOnWatchlist(this.movie);
    } else {
      this.storageService.removeFromWatchlist(this.movie);
    }
  }
}
