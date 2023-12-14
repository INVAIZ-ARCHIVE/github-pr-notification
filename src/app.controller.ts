import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async handleWebhook(@Body() body: any) {
    const message = `New Pull Request: ${body.pull_request.title}`;
    await this.appService.sendToGoogleChat(message);
  }
}
