import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'MyImdb';
  isExpanded = false;

  constructor(public authService: AuthService) {}

  public toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }
}
