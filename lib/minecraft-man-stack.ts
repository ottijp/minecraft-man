import { Stack, StackProps, aws_kinesis as kinesis, aws_iam as iam, aws_lambda as lambda, aws_lambda_event_sources as lambda_event_sources } from 'aws-cdk-lib';
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
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'minecraft-join-notifier')),
      environment: {
        SLACK_WEBHOOK_URL: this.node.tryGetContext('slackWebhookUrl') as string,
      },
    });

    // ログアップロード先ストリーム
    const stream = new kinesis.Stream(this, 'MinecraftLog', {
      streamName: 'minecraft-log',
    });
    stream.grant(minecraftServer, 'kinesis:PutRecords');

    // ストリームとファンクションの結合
    const eventSource = new lambda_event_sources.KinesisEventSource(stream, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    });
    lambdaFunction.addEventSource(eventSource);
  }
}
