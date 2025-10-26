import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { functionName } from './thesis_data_pipeline';

export class ThesisSchedularMonitor extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const alarmTopic = new sns.Topic(this, 'ThesisMonitorAlarmTopic', {
      topicName: 'ThesisSchedularMonitorAlarms',
    });

    const senderFunction = new lambda.Function(this, 'AlarmToSesSender', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'ses_sender.handler',
      code: lambda.Code.fromAsset('../thesis_crawler_system/lambda_code/'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        TO_EMAIL: 'changtung.chin@gmail.com',
        SOURCE_EMAIL: 'hectorchin.gcp@gmail.com',
        SUBJECT: 'ThesisPipeline Alarm',
      },
    });

    senderFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // Subscription：when SNS topic receive message, trigger sender Lambda（Lambda send email through SES）
    alarmTopic.addSubscription(new subs.LambdaSubscription(senderFunction));

    // Create CloudWatch metric point to specific Lambda's Errors metric
    const errorsMetric = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Errors',
      dimensionsMap: { FunctionName: functionName },
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
    });

    // Alarm：if any Error（sum > 0）shows in one minute then trigger alarm
    const errorsAlarm = new cloudwatch.Alarm(this, 'ThesisLambdaErrorsAlarm', {
      alarmName: `Thesis_${functionName}_Errors`,
      alarmDescription: `Alarm when ${functionName} reports Errors > 0 within 1 minute`,
      metric: errorsMetric,
      threshold: 0.5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    errorsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));

  }
}
