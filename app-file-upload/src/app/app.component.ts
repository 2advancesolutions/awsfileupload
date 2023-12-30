import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FileUploadService } from './services/file-upload.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [HttpClient, FileUploadService]
})
export class AppComponent {

  title = 'app-file-upload';
  selectedFile: any;
  
  constructor(private fileUploadService: FileUploadService) {}
  
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files ? target.files[0] : null;
  }

  uploadImage() {
    if (this.selectedFile) {
      this.fileUploadService.uploadImage(this.selectedFile).subscribe({
        next: (response) => console.log(response),
        error: (error) => console.error(error)
      });
    }
  }
}
