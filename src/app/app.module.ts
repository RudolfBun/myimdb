import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ToolbarComponent } from './navigation/toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SideNavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { HomeComponent } from './home/home.component';
import { SearchBarComponent } from './home/search-bar/search-bar.component';
import { HttpClientModule } from '@angular/common/http';
import { MovieCardComponent } from './shared/movie-card/movie-card.component';
import { MarkedMoviesComponent } from './marked-movies/marked-movies.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { environment } from 'src/environments/environment';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { MovieMarkerComponent } from './shared/movie-marker/movie-marker.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ToolbarComponent,
    SideNavListComponent,
    HomeComponent,
    SearchBarComponent,
    MovieCardComponent,
    MarkedMoviesComponent,
    MovieDetailComponent,
    MovieMarkerComponent,
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {}
