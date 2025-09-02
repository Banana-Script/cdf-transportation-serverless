import { NestFactory } from '@nestjs/core';
import { CustomSMSSenderModule } from './custom-sms-sender.module';
import { CustomSMSSenderService } from './custom-sms-sender.service';
import { Context, Callback } from 'aws-lambda';

interface CustomSMSSenderEvent {
  version: string;
  triggerSource: string;
  region: string;
  userPoolId: string;
  userName: string;
  callerContext: {
    awsSdkVersion: string;
    clientId: string;
  };
  request: {
    type: string;
    message: string;
    code: string;
  };
}

export const handler = async (
  event: CustomSMSSenderEvent,
  context: Context,
  callback: Callback,
): Promise<void> => {
  console.log('CustomSMSSender Lambda event:', JSON.stringify(event, null, 2));

  const app = await NestFactory.createApplicationContext(
    CustomSMSSenderModule,
    {
      logger: console,
    },
  );

  const service = app.get(CustomSMSSenderService);

  try {
    await service.handleEvent(event);
    callback(null, event);
  } catch (error) {
    console.error('CustomSMSSender Error:', error);
    callback(error);
  } finally {
    await app.close();
  }
};