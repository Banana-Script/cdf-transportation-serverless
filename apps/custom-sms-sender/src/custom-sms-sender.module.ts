import { Module } from '@nestjs/common';
import { CustomSMSSenderService } from './custom-sms-sender.service';
import { TwilioModule } from '@app/twilio';

@Module({
  imports: [TwilioModule],
  providers: [CustomSMSSenderService],
})
export class CustomSMSSenderModule {}