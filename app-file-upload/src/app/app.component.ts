import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [HttpClient]
})
export class AppComponent {
  
  constructor(@Inject(HttpClient) private http: HttpClient) { }
  
  title = 'app-file-upload';
  selectedFile: any;
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  uploadImage() {
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile as any);
    reader.onload = () => {
      if(reader.result == null) return;
      const base64String = reader.result.toString().split(',')[1];
      const data = {
        file: base64String,
        filename: this.selectedFile.name
      };
      this.http.post('https://vp289iznu3.execute-api.us-east-1.amazonaws.com/dev/upload', data)
        .subscribe((response: any) => {
          console.log(response);
        }, (error: any) => {
          console.error(error);
        });
    };
  }
  
  
}
