import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  @Input() public isExpanded: boolean;
  @Input() public title: string;
  @Output() public sidenavToggle = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  public ngOnInit(): void {
    this.authService.isAuth();
  }

  public onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }
}
