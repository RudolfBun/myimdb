import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User;
  public readonly users$: Observable<User[]>;

  constructor(private fireStore: AngularFirestore) {
    this.users$ = this.fireStore.collection<User>('Users').valueChanges();
  }

  public isAuth(): boolean {
    return true;
    /*  return this.user != null; */
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
  }

  public logout() {
    this.user = null;
  }
}
