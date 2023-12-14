import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('notification')
  async handleWebhook(@Body() body: any) {
    try {
      const message = `
      <users/118072138291656296236> <users/118072138291656296236> <users/103424272066547777775>
      새로운 PR이 등록되었습니다\n 
      링크: ${body.pull_request.html.url}\n
      제목 : #${body.pull_request.number} ${body.pull_request.title}\n
      설명 : ${body.pull_request.description}\n
      요청자: ${body.pull_request.user.login}
      `;
      await this.appService.sendToGoogleChat(message);
    } catch (e) {
      console.log('not found pr');
    }
  }
}
