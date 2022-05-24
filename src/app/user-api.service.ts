import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { MessageNotification } from "./message-notification";

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  constructor(private http: HttpClient) { }

  postMessage(messageNotification: MessageNotification): void {
    this.http.post('http://localhost:8080/api/users', messageNotification).subscribe();
  }
}
