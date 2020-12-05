import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie';
import { SelectedMovieService } from '../services/selected-movie.service';
import { ApiUrlStrings } from '../utils/api-url-strings';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
})
export class MovieDetailComponent {
  public movie: Movie;
  public readonly imageBaseUrl = ApiUrlStrings.IMAGE_BASE_URL;
  public backDropImageStyleProperty: string;
  public posterImageSrc: string;

  constructor(
    public readonly selectedMovie: SelectedMovieService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.selectedMovie.selectedMovie$.subscribe((movie) => {
      if (movie === undefined) {
        this.router.navigate(['/home']);
      }
      this.movie = movie;
      this.backDropImageStyleProperty = `url('${this.imageBaseUrl}w1280${this.movie.backImage}')`;
      this.posterImageSrc = this.imageBaseUrl + 'w500' + this.movie.image;
    });
  }

  public getYoutubeUrl(key: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + key
    );
  }
}
