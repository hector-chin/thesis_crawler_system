#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ThesisSchedularMonitor } from '../lib/thesis_schedular_monitor';
import { ThesisDataPipeline } from '../lib/thesis_data_pipeline';

const app = new cdk.App();
console.log(process.env.CDK_DEFAULT_ACCOUNT);
console.log(process.env.CDK_DEFAULT_REGION);

new ThesisDataPipeline(app, 'ThesisDataPipelineStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new ThesisSchedularMonitor(app, 'ThesisSchedularMonitorStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
