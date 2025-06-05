import { Module } from "@nestjs/common";
import { CognitoMessagesService } from "./cognito-messages.service";

@Module({
  imports: [],
  controllers: [],
  providers: [CognitoMessagesService],
})
export class CognitoMessagesModule {}
