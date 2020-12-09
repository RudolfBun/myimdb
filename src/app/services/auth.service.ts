import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User;
  public readonly users$: Observable<User[]>;

  constructor(private fireStore: AngularFirestore) {
    const localUser = localStorage.getItem('myImdb_user');
    this.user = localUser ? ({ username: localUser } as User) : undefined;
    if (navigator.onLine) {
      this.users$ = this.fireStore.collection<User>('Users').valueChanges();
    } else {
      this.user = { username: 'admin', password: 'admin' };
      this.users$ = of([this.user]);
    }
  }

  public isAuth(): boolean {
    return !!localStorage.getItem('myImdb_user');
  }

  public addUser(user: User) {
    return this.fireStore.collection('Users').add(user);
  }

  public getUserByName(name: string) {
    return this.fireStore
      .collection<User>('Users', (ref) => ref.where('username', '==', name))
      .valueChanges();
  }

  public get getUser(): User {
    return this.user;
  }

  public setUser(user: User) {
    this.user = user;
    localStorage.setItem('myImdb_user', user.username);
  }

  public logout() {
    this.user = null;
    localStorage.removeItem('myImdb_user');
  }
}
