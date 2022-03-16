import { Stack, StackProps, aws_sqs as sqs, aws_iam as iam, aws_lambda as lambda, aws_lambda_event_sources as lambda_event_sources } from 'aws-cdk-lib';
import { Construct } from 'constructs';
const path = require('path');

export class MinecraftManStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ログアップロード用のユーザ
    const minecraftServer = new iam.User(this, 'MinecraftServer');

    // ログ解析用のファンクション
    const lambdaFunction = new lambda.Function(this, 'minecraft-join-notifier', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'minecraft-join-notifier.handler',
      code: lambda.Code.fromAsset('resources'),
      environment: {
        SLACK_WEBHOOK_URL: this.node.tryGetContext('slackWebhookUrl') as string,
        DISCORD_WEBHOOK_URL: this.node.tryGetContext('discordWebhookUrl') as string,
      },
    });

    // ログアップロード先キュー
    const queue = new sqs.Queue(this, 'MinecraftLog', {
      fifo: true,
      contentBasedDeduplication: true,
    });
    queue.grant(minecraftServer, 'sqs:SendMessage');

    // キューとファンクションの結合
    const eventSource = new lambda_event_sources.SqsEventSource(queue);
    lambdaFunction.addEventSource(eventSource);
  }
}
