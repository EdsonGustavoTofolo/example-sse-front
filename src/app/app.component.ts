import { Component } from '@angular/core';
import { UserApiService } from "./user-api.service";
import { NotificationService } from "./notification.service";
import { MessageRequest } from "./message-request";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  usersConnections: { user: string, messages: string[], subscription: Subscription }[] = [];

  constructor(private userApiService: UserApiService,
              private notificationService: NotificationService) {}

  send(user: string, message: string): void {
    const messageRequest = new MessageRequest();
    messageRequest.user = user;
    messageRequest.message = message;
    this.userApiService.postMessage(messageRequest);
  }

  disconnect(user: string): void {
    const userConnectionIndex = this.usersConnections.findIndex(value => value.user === user);
    const usersConnection = this.usersConnections[userConnectionIndex];
    usersConnection.subscription.unsubscribe();
    this.usersConnections.splice(userConnectionIndex, 1);
    this.notificationService.closeConnection(user);
  }

  connect(user: string): void {
    const subscription = this.notificationService.getMessages(user).subscribe(eventSourceMessage => {
      if (eventSourceMessage.messageType === 'onopen') {
        this.usersConnections.push({ 'user': user,  'messages': [], 'subscription': subscription });
      } else if (eventSourceMessage.messageType === 'message') {
        const userConnection = this.usersConnections.find(value => value.user === user);
        userConnection?.messages.push(<string>eventSourceMessage.messageNotification!.message);
      }
    });
  }
}
