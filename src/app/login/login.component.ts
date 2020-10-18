import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouteStrings } from '../utils/route-strings';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isValid = true;
  public appTitle = 'MyImdb';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  private initForm() {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }
  public submit(): void {
    this.authService.users$.subscribe((users) => {
      const userWithThisUsername = users.find(
        (u) => u.username === this.loginForm.value.username
      );
      if (
        userWithThisUsername &&
        userWithThisUsername.password === this.loginForm.value.password
      ) {
        this.authService.setUser(userWithThisUsername);
        this.isValid = true;
        this.router.navigate([RouteStrings.HOME]);
      } else {
        this.isValid = false;
      }
    });
  }
}
