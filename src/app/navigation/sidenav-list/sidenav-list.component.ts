import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { RouteStrings } from 'src/app/utils/route-strings';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css'],
})
export class SideNavListComponent implements OnInit {
  @Input() isExpanded: boolean;
  constructor(private authService: AuthService, private router: Router) {}

  public logout() {
    this.authService.logout();
    this.router.navigate([RouteStrings.LOGIN]);
  }
  ngOnInit(): void {}
}
