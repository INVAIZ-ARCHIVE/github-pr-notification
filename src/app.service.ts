import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async sendToGoogleChat(text: string) {
    try {
      const configs = {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      };

      const url =
        'https://chat.googleapis.com/v1/spaces/AAAAswwL7Fg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=DBb0Nyvj8YqsdKHm2kQOqZ68NErC5_Ab45JwKJYQ6N8';
      await axios.post(url, { text }, configs);
    } catch (e) {
      console.log('google chat webhook error');
    }
  }
}
