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
    console.log(body);
    try {
      if (body.issue && body.comment && body.issue.pull_request) {
        const commentUrl = body.comment.html_url; // Pull Request의 URL
        const commentBody = body.comment.body; // 댓글 내용
        const createUser = body.comment.user.login; // 댓글 작성자
        const message = `<users/118072138291656296236> <users/118072138291656296236> <users/103424272066547777775>\n새로운 댓글이 달렸습니다.\n 
        리포지토리: ${body.repository.full_name}\n댓글링크: ${commentUrl}\n내용: #${commentBody}\n작성자: ${createUser}\n`;
        await this.appService.sendToGoogleChat(message);
      } else if (body.pull_request.state === 'open') {
        const message = `<users/118072138291656296236> <users/118072138291656296236> <users/103424272066547777775>\n새로운 PR이 등록되었습니다\n 
        리포지토리: ${body.repository.full_name}\n링크: ${body.pull_request.html_url}\n제목: #${body.pull_request.number} ${body.pull_request.title}\n설명: ${body.pull_request.description}\n요청자: ${body.pull_request.user.login}`;
        await this.appService.sendToGoogleChat(message);
      }
      // else if (body.pull_request.state === 'closed') {
      //   const message = `Pull Request가 closed 되었습니다.\n리포지토리: ${body.repository.name}\n링크: ${body.pull_request.html_url}\n제목 : #${body.pull_request.number} ${body.pull_request.title}\n요청자: ${body.pull_request.user.login}
      //   `;
      //   await this.appService.sendToGoogleChat(message);
      // }
    } catch (e) {
      console.log(e);
      console.log('not found pr');
    }
  }
}
