import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface Comment {
  repository_full_name: string;
  commentUrl: string;
  commentBody: string;
  prUrl: string;
  userId: string;
}

interface PullRequest {
  repository_full_name: string;
  prUrl: string;
  userId: string;
  request_number: number;
  title: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  reviewComment({
    repository_full_name,
    commentUrl,
    commentBody,
    prUrl,
    userId,
  }: Comment) {
    const message = `새로운 리뷰 댓글이 달렸습니다.\n리포지토리: ${repository_full_name}\n내용: ${commentBody}\n작성자: ${userId}\n댓글링크: ${commentUrl}\nPR링크:${prUrl}`;
    return message;
  }

  newComment({
    repository_full_name,
    commentUrl,
    commentBody,
    prUrl,
    userId,
  }: Comment) {
    const message = `새로운 코멘트가 달렸습니다.\n리포지토리: ${repository_full_name}\n내용: ${commentBody}\n작성자: ${userId}\n댓글링크: ${commentUrl}\nPR링크:${prUrl}`;
    return message;
  }

  mergeSucceeded({
    repository_full_name,
    prUrl,
    request_number,
    title,
    userId,
  }: PullRequest) {
    const message = `병합완료✔✔ \n리포지토리: ${repository_full_name}\n링크: ${prUrl}\n제목: #${request_number} ${title}\n요청자: ${userId}`;
    return message;
  }

  newPullRequest({
    repository_full_name,
    prUrl,
    request_number,
    title,
    userId,
  }: PullRequest) {
    const message = `<users/118072138291656296236> <users/112473532277761238527> <users/103424272066547777775>\n새로운 PR이 등록되었습니다. 리뷰해주세요~ \n리포지토리: ${repository_full_name}\n요청자: ${userId}\n링크: ${prUrl}\n제목: #${request_number} ${title}`;
    return message;
  }

  async handleWebhook(body: any) {
    try {
      // new review
      if (body.action === 'created' && body.comment && body.pull_request) {
        const commentUrl = body.comment.html_url;
        // 리뷰 댓글 내용
        const commentBody = body.comment.body;
        const prUrl = body.pull_request.html_url;
        // 리뷰 댓글 작성자 정보
        const userId = body.comment.user.login;
        const repository_full_name = body.repository.full_name;
        const message = this.reviewComment({
          repository_full_name,
          commentUrl,
          commentBody,
          prUrl,
          userId,
        });
        await this.sendToGoogleChat(message, prUrl);
      }

      // new comment
      else if (
        body.issue &&
        body.comment &&
        body.issue.pull_request &&
        body.action === 'created'
      ) {
        const commentUrl = body.comment.html_url;
        // 리뷰 댓글 내용
        const commentBody = body.comment.body;
        const prUrl = body.pull_request.html_url;
        // 리뷰 댓글 작성자 정보
        const userId = body.comment.user.login;
        const repository_full_name = body.repository.full_name;

        const message = this.newComment({
          repository_full_name,
          commentUrl,
          commentBody,
          prUrl,
          userId,
        });
        await this.sendToGoogleChat(message, prUrl);
      }

      // new pr
      else if (
        body.pull_request &&
        body.pull_request.state === 'open' &&
        body.action === 'opened'
      ) {
        const repository_full_name = body.repository.full_name;
        const prUrl = body.pull_request.html_url;
        const request_number = body.pull_request.number;
        const title = body.pull_request.title;
        const userId = body.pull_request.user.login;

        const message = this.newPullRequest({
          repository_full_name,
          prUrl,
          request_number,
          title,
          userId,
        });
        await this.sendToGoogleChat(message, prUrl);
      }

      // merge
      else if (
        body.pull_request &&
        body.pull_request.state === 'closed' &&
        body.pull_request.merged === true
      ) {
        const repository_full_name = body.repository.full_name;
        const prUrl = body.pull_request.html_url;
        const request_number = body.pull_request.number;
        const title = body.pull_request.title;
        const userId = body.pull_request.user.login;
        const message = this.mergeSucceeded({
          repository_full_name,
          prUrl,
          request_number,
          title,
          userId,
        });
        await this.sendToGoogleChat(message, prUrl);
      }
    } catch (e) {
      console.log(e);
      console.log('------------------------------');
      console.log('not found pr');
    }
  }

  async sendToGoogleChat(text: string, thread: string) {
    try {
      const configs = {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      };

      const url =
        'https://chat.googleapis.com/v1/spaces/AAAAswwL7Fg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=DBb0Nyvj8YqsdKHm2kQOqZ68NErC5_Ab45JwKJYQ6N8&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD';
      await axios.post(
        url,
        {
          text,
          thread: thread && { threadKey: thread },
        },
        configs,
      );
    } catch (e) {
      console.log('google chat webhook error');
    }
  }
}
