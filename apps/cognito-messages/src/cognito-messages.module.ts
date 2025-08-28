import { Module } from "@nestjs/common";
import { CognitoMessagesService } from "./cognito-messages.service";
import { TwilioModule } from "@app/twilio";

@Module({
  imports: [TwilioModule],
  controllers: [],
  providers: [CognitoMessagesService],
})
export class CognitoMessagesModule {}
