import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private http: HttpClient) {}
  config = {
    pythonUrl: 'https://vp289iznu3.execute-api.us-east-1.amazonaws.com/dev',
    nodeUrl: ' https://2u8a893mdc.execute-api.us-east-1.amazonaws.com/dev/upload',
  }

  uploadImage(file: File): Observable<any> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result == null) return;
        const base64String = reader.result.toString().split(',')[1];
        const data = {
          file: base64String,
          filename: file.name,
        };
        this.http
          .post(this.config.nodeUrl, data)
          .subscribe(
            (response) => {
              observer.next(response);
              observer.complete();
            },
            (error) => observer.error(error)
          );
      };
    });
  }
}