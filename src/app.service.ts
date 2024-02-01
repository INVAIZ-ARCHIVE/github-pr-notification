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
    const message = `새로운 리뷰 댓글이 달렸습니다.\n작성자: ${userId}\n내용: ${commentBody}\n리포지토리: ${repository_full_name}\n댓글링크: ${commentUrl}\nPR링크:${prUrl}`;
    return message;
  }

  newComment({
    repository_full_name,
    commentUrl,
    commentBody,
    prUrl,
    userId,
  }: Comment) {
    const message = `새로운 코멘트가 달렸습니다.\n작성자: ${userId}\n내용: ${commentBody}\n리포지토리: ${repository_full_name}\n댓글링크: ${commentUrl}\nPR링크:${prUrl}`;
    return message;
  }

  mergeSucceeded({
    repository_full_name,
    prUrl,
    request_number,
    title,
    userId,
  }: PullRequest) {
    const message = `병합완료✔✔ \n요청자: ${userId}\n리포지토리: ${repository_full_name}\n제목: #${request_number} ${title}\n링크: ${prUrl}`;
    return message;
  }

  newPullRequest({
    repository_full_name,
    prUrl,
    request_number,
    title,
    userId,
  }: PullRequest) {
    const message = `<users/118072138291656296236> <users/112473532277761238527> <users/103424272066547777775>\n새로운 PR이 등록되었습니다. 리뷰해주세요~ \n요청자: ${userId}\n제목: #${request_number} ${title}\n리포지토리: ${repository_full_name}\n링크: ${prUrl}`;
    return message;
  }

  async handleWebhook(body: any) {
    try {
      // new review
      if (body.action === 'created' && body.comment && body.pull_request) {
        const comment: Comment = {
          repository_full_name: body.repository.full_name,
          commentUrl: body.comment.html_url,
          commentBody: body.comment.body,
          prUrl: body.pull_request.html_url,
          userId: body.pull_request.user.login,
        };

        const message = this.reviewComment(comment);
        await this.sendToGoogleChat(message, comment.prUrl);
      }

      // new comment
      else if (
        body.issue &&
        body.comment &&
        body.issue.pull_request &&
        body.action === 'created'
      ) {
        const comment: Comment = {
          repository_full_name: body.repository.full_name,
          commentUrl: body.comment.html_url,
          commentBody: body.comment.body,
          prUrl: body.pull_request.html_url,
          userId: body.pull_request.user.login,
        };

        const message = this.newComment(comment);
        await this.sendToGoogleChat(message, comment.prUrl);
      }

      // new pr
      else if (
        body.pull_request &&
        body.pull_request.state === 'open' &&
        body.action === 'opened'
      ) {
        const pullRequest: PullRequest = {
          repository_full_name: body.repository.full_name,
          prUrl: body.pull_request.html_url,
          request_number: body.pull_request.number,
          title: body.pull_request.title,
          userId: body.pull_request.user.login,
        };

        const message = this.newPullRequest(pullRequest);
        await this.sendToGoogleChat(message, pullRequest.prUrl);
      }

      // merge
      else if (
        body.pull_request &&
        body.pull_request.state === 'closed' &&
        body.pull_request.merged === true
      ) {
        const pullRequest: PullRequest = {
          repository_full_name: body.repository.full_name,
          prUrl: body.pull_request.html_url,
          request_number: body.pull_request.number,
          title: body.pull_request.title,
          userId: body.pull_request.user.login,
        };

        const message = this.mergeSucceeded(pullRequest);
        await this.sendToGoogleChat(message, pullRequest.prUrl);
      }
    } catch (e) {
      console.log('------------------------------');
      console.log('Not found Pull Request: ', e.message);
      console.log('------------------------------');
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
