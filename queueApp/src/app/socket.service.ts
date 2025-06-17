import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private hostname = window.location.hostname;
  private socketUrl = this.hostname === '10.0.2.2' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

  constructor() {}

  public connect() {
    this.socket = io(this.socketUrl); 
  }
  
  public enterApp() {
    return new Observable(observer => { 
      this.socket.on('entered', (message) => {
        observer.next(message); 
      });
    });
  }

  public enterQueue() {
    this.socket.emit('message', '');
  }

  public onQueueEnter() {
    return new Observable(observer => {
      this.socket.on('queue_enter', (message) => {
        observer.next(message);
      });
    });
  }

  public onQueueUpdate() {
    return new Observable(observer => {
      this.socket.on('queue_update', (message) => {
        observer.next(message);
      });
    });
  }
}
