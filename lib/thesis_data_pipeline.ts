import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EventBus, Rule, Schedule } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

export class ThesisDataPipeline extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const functionName = 'ThesisDataCrawlerFunction';
        const lambdaFunction = new lambda.Function(this, 'ThesisLambdaFunction', {
            functionName: functionName,
            runtime: lambda.Runtime.PYTHON_3_12,
            description: 'Lambda function for crawling arXiv.org thesis',
            handler: 'thesis_crawler.handler',
            memorySize: 128,
            ephemeralStorageSize: cdk.Size.mebibytes(512),
            timeout: cdk.Duration.minutes(10),
            code: lambda.Code.fromAsset('../thesis_crawler_system/lambda_code/'),
            logGroup: new logs.LogGroup(this, 'ThesisLambdaLogGroup', {
                logGroupName: `/aws/lambda/${functionName}`,
                retention: logs.RetentionDays.ONE_MONTH,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            })
        });

        // EventBridge Rule to trigger Lambda on schedule
        const rule = new Rule(this, 'ThesisDataPipelineTriggerRule', {
            ruleName: 'ThesisDataPipelineTriggerRule',
            schedule: Schedule.cron({ minute: '0', hour: '0', day: '*', month: '*', year: '*' }),
            enabled: true
        })
        // EventBridge Rule Log Group
        // new logs.LogGroup(this, 'EventBridgeRuleLogGroup', {
        //     logGroupName: `/aws/events/${rule.ruleName}`,
        //     retention: logs.RetentionDays.ONE_MONTH,
        //     removalPolicy: cdk.RemovalPolicy.DESTROY,
        // });
        rule.addTarget(new targets.LambdaFunction(lambdaFunction));
    }
}
