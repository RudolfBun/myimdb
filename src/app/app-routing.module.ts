import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MarkedMoviesComponent } from './marked-movies/marked-movies.component';
import { AuthGuard } from './guards/auth.guard';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'favorites',
    component: MarkedMoviesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'alreadyseen',
    component: MarkedMoviesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'watchlist',
    component: MarkedMoviesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'logout',
    component: MarkedMoviesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'movie-details',
    component: MovieDetailComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
