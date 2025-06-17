import { Component, OnInit } from '@angular/core';
import { IonContent, IonButton, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, IonButton, IonLabel, IonSpinner],
})
export class HomePage implements OnInit {
  public isConnecting: boolean = true;
  public inQueue: boolean = false;
  public queueNumber: number = 0;
  public code: string = '';
  public currentNumber: number = 0;
  public currentBranch: string = '';

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.connect();

    this.socketService.enterApp().subscribe((message: any) => {
      if (this.inQueue) {
        this.currentNumber = message.current_number;
        this.currentBranch = message.current_branch;
      } else {
        this.isConnecting = false;
      } 
    });
  
    this.socketService.onQueueEnter().subscribe((message: any) => {
      this.inQueue = true;
      this.queueNumber = message.queue_number;
      this.code = message.code;
      this.currentNumber = message.current_number;
      this.currentBranch = message.current_branch;
    });

    this.socketService.onQueueUpdate().subscribe((message: any) => {
      this.currentNumber = message.current_number;
      this.currentBranch = message.current_branch;
    });
  }

  enterQueue(): void {
    this.socketService.enterQueue();
  }
}
