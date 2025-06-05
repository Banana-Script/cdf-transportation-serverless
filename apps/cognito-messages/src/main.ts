import { ContextIdFactory, NestFactory } from "@nestjs/core";
import { Context, CustomMessageTriggerEvent, Handler } from "aws-lambda";
import { INestApplicationContext } from "@nestjs/common";

import { CognitoMessagesModule } from "./cognito-messages.module";
import { CognitoMessagesService } from "./cognito-messages.service";

let app: INestApplicationContext;
/**
 * Re-use the application context across function invocations
 */
async function bootstrap(): Promise<INestApplicationContext> {
  if (!app) {
    app = await NestFactory.createApplicationContext(CognitoMessagesModule);
  }

  return app;
}

export const handler: Handler = async (
  event: CustomMessageTriggerEvent,
  context: Context
) => {
  console.log(
    "🚀 ~ consthandler:Handler= ~ event:",
    JSON.stringify(event, null, 2)
  );
  /**
   * Setup the application context
   */
  const instance = await bootstrap();
  /**
   * Instantiate a request-scoped DI sub-tree and obtain the request-scoped top-level injectable
   */
  const contextId = ContextIdFactory.create();
  instance.registerRequestByContextId({ context }, contextId);
  const service = await instance.resolve<CognitoMessagesService>(
    CognitoMessagesService,
    contextId
  );

  /**
   * Process the Cognito custom message event
   */
  const result = service.handleEvent(event);

  // Return the processed event
  return result;
};
