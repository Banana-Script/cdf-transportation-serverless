import { ContextIdFactory, NestFactory } from '@nestjs/core';
import { Context, Handler, SQSEvent } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { VapiConsumptionsSyncModule } from './vapi-consumptions-sync.module';
import { VapiConsumptionsSyncService } from './vapi-consumptions-sync.service';

import { DeleteMessageCommand, DeleteMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';
import {
  STSClient,
  GetCallerIdentityCommand,
  GetCallerIdentityCommandOutput,
} from '@aws-sdk/client-sts';

const sqsClient = new SQSClient({ region: 'us-east-1' });
const stsClient = new STSClient({ region: 'us-east-1' });

let app: INestApplicationContext;
/**
 * Re-use the application context across function invocations
 */
async function bootstrap(): Promise<INestApplicationContext> {
  if (!app) {
    app = await NestFactory.createApplicationContext(VapiConsumptionsSyncModule);
  }

  return app;
}

export const handler: Handler = async (event: SQSEvent, context: Context) => {
  console.log('🚀 ~ consthandler:Handler= ~ event:', JSON.stringify(event, null, 2));
  /**
   * Setup the application context
   */
  const instance = await bootstrap();
  /**
   * Instantiate a request-scoped DI sub-tree and obtain the request-scoped top-level injectable
   */
  const contextId = ContextIdFactory.create();
  instance.registerRequestByContextId({ context }, contextId);
  const service = await instance.resolve<VapiConsumptionsSyncService>(
    VapiConsumptionsSyncService,
    contextId,
  );

  /**
   * Finally, do something with the event we received
   */
  await service.handleConsumptionsUpdateFromAnalytics(event);
  // await service.handleConsumptionsUpdateFromCallsLog(event);

  // Delete message from SQS
  const inputCaller = {};
  const caller: GetCallerIdentityCommandOutput = await stsClient.send(
    new GetCallerIdentityCommand(inputCaller),
  );
  const queueUrl = `https://sqs.us-east-1.amazonaws.com/${caller.Account}/VapiConsumptionsQueue`;
  const input: DeleteMessageCommandInput = {
    // DeleteMessageRequest
    QueueUrl: queueUrl, // required
    ReceiptHandle: event.Records[0].receiptHandle, // required
  };
  const command = new DeleteMessageCommand(input);
  try {
    await sqsClient.send(command);
    console.log(`Message deleted from the queue ${JSON.stringify(command)}`);
  } catch (error) {
    console.log('🚀 ~ file: main.ts:64 ~ consthandler:Handler= ~ error:', error);
  }
  // Return the computed result
  // callback(null);
  return { statusCode: 200, body: 'ok' };
};
