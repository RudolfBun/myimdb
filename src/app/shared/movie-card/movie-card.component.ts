import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Cast, Movie } from 'src/app/models/movie';
import { ApiUrlStrings } from 'src/app/utils/api-url-strings';
import { MovieService } from 'src/app/services/movie.service';
import {
  StorageService,
  StoredMovieData,
} from 'src/app/services/storage.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SelectedMovieService } from 'src/app/services/selected-movie.service';

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

  public movieMarkerSubscription: Subscription;

  constructor(
    public movieService: MovieService,
    private storageService: StorageService,
    private selectedMovieService: SelectedMovieService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.movieMarkerSubscription.unsubscribe();
  }

  ngOnInit(): void {
    if (this.movie.image) {
      this.imagePath = this.imageBaseUrl + this.imageSize + this.movie.image;
    } else {
      this.imagePath = '../../../assets/not-found.png';
    }

    this.movieMarkerSubscription = this.storageService
      .getMovieState(this.movie.id)
      .subscribe((movieMarker) => {
        this.movie.favorite = movieMarker.favorite;
        this.movie.alreadySeen = movieMarker.alreadySeen;
        this.movie.watchlist = movieMarker.onWatchList;
      });
    this.release = this.movie.release.slice(0, 4);
  }

  public getActorsDependsOnWindowSize(): Cast[] {
    return window.innerWidth < 500
      ? this.movie.characters.slice(0, 2)
      : this.movie.characters;
  }

  public navigateToDetails(): void {
    this.selectedMovieService.selectMovie(this.movie);
    this.router.navigate(['/movie-details']);
  }
}
