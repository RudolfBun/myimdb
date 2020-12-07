import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(private readonly http: HttpClient) {}

  public preloadImage(url: string): Observable<string> {
    if (url) {
      return this.http
        .get(url, { responseType: 'blob' })
        .pipe(switchMap(blobToString));
    }
    return undefined;
  }
}

function blobToString(blob: Blob): Observable<string> {
  return new Observable<string>((subscriber) => {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      subscriber.next(fileReader.result as string);
      fileReader = null;
      subscriber.complete();
    };
    fileReader.onerror = () => {
      fileReader = null;
      subscriber.error();
    };
    fileReader.readAsDataURL(blob);
    return () => fileReader?.abort();
  });
}
