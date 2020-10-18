import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  @Input() isExpanded: boolean;
  @Input() title: string;
  @Output() sidenavToggle = new EventEmitter<void>();
  constructor(public authService: AuthService) {}
  ngOnInit(): void {
    this.authService.isAuth();
  }

  onToggleSidenav() {
    this.sidenavToggle.emit();
  }
}
