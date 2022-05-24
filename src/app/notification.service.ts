import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { MessageNotification } from "./message-notification";
import { EventSourceMessage } from "./event-source-message";

type EventSourceListener = (this: EventSource, ev: MessageEvent) => any;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private events: { user: string, eventSource: EventSource, listeners: EventSourceListener[], onMessage: Observable<EventSourceMessage>  }[] = [];

  constructor(private ngZone: NgZone) { }

  getMessages(user: string): Observable<EventSourceMessage> {
    const subject = new Subject<EventSourceMessage>();
    const observable = subject.asObservable();

    const listener = (ev: { data: string; }) => {
      const data = JSON.parse(ev.data) as MessageNotification;
      subject.next({ messageType: 'message', messageNotification: data});
    }

    const eventSource = new EventSource(`http://localhost:8080/api/sses/stream/${user}`);
    eventSource.onopen = () => this.ngZone.run(() => subject.next({ messageType: 'onopen' }));
    eventSource.onerror = ev => console.log("Error", ev);
    eventSource.addEventListener('message', listener);

    this.events.push({
      'user': user,
      'eventSource': eventSource,
      'listeners': [listener],
      'onMessage': observable
    });

    return observable;
  }

  closeConnection(user: string): void {
    const userEventIndex = this.events.findIndex(value => value.user === user);
    const eventUser = this.events[userEventIndex];
    const eventSource = eventUser.eventSource;
    eventUser.listeners.forEach(listener => eventSource.removeEventListener('message', listener));
    eventSource.close();
  }
}
