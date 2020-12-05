import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from 'src/app/models/movie';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-movie-marker',
  templateUrl: './movie-marker.component.html',
  styleUrls: ['./movie-marker.component.css'],
})
export class MovieMarkerComponent {
  @Input() public movie: Movie;
  @Output() movieChange: EventEmitter<Movie> = new EventEmitter<Movie>();

  private snackBarAction = 'OK';

  constructor(
    private storageService: StorageService,
    private snackBar: MatSnackBar
  ) {}

  public changeFavorite() {
    const snackText = this.movie.favorite
      ? 'You removed the movie from the list!'
      : 'You added the movie to your favorites!';
    this.snackBar.open(snackText, this.snackBarAction, {
      duration: 2000,
    });
    this.movie.favorite = !this.movie.favorite;
    this.movieChange.emit(this.movie);
    if (this.movie.favorite) {
      this.storageService.addFavorite(this.movie);
    } else {
      this.storageService.removeFavorite(this.movie);
    }
  }

  public changeAlreadySeen() {
    const snackText = this.movie.alreadySeen
      ? 'You removed the movie from the list!'
      : 'You marked the movie as already seen!';
    this.snackBar.open(snackText, this.snackBarAction, {
      duration: 2000,
    });
    this.movie.alreadySeen = !this.movie.alreadySeen;
    this.movieChange.emit(this.movie);
    if (this.movie.alreadySeen) {
      this.storageService.addAlreadySeen(this.movie);
    } else {
      this.storageService.removeAlreadySeen(this.movie);
    }
  }

  public changeWatchList() {
    const snackText = this.movie.watchlist
      ? 'You removed the movie from the list!'
      : 'You added the movie on your watchlist!';
    this.snackBar.open(snackText, this.snackBarAction, {
      duration: 2000,
    });
    this.movie.watchlist = !this.movie.watchlist;
    this.movieChange.emit(this.movie);
    if (this.movie.watchlist) {
      this.storageService.addOnWatchlist(this.movie);
    } else {
      this.storageService.removeFromWatchlist(this.movie);
    }
  }
}
