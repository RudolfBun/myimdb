import { Component, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public title = 'MyImdb';
  public isExpanded = false;
  public isSmallScreen = false;

  constructor(
    public authService: AuthService,
    private cookieService: CookieService
  ) {
    this.isSmallScreen = window.innerWidth < 750;
    this.cookieService.set('sameSite', 'set', {
      expires: 260000,
      sameSite: 'None',
      secure: true,
    });
  }

  public toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  public setToogleState(event: any) {
    if (this.isExpanded && !event) {
      this.isExpanded = !this.isExpanded;
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event): void {
    this.isSmallScreen = event.target.innerWidth < 750;
    if (this.isSmallScreen && this.isExpanded) {
      this.toggleExpanded();
    }
  }
}
