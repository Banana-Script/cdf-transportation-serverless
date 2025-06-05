import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { UsersModule } from './users.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(UsersModule);
  app.enableCors();
  await app.init();
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
