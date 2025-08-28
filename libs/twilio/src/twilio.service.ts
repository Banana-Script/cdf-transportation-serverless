import { Lead } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';
@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor() {
    this.client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async initiateCall(
    lead: Lead,
    assistantId: string,
    maxRetries: number,
    budget: number,
    from: string,
  ): Promise<{ id: string; to: string; from: string; status: string }> {
    console.log('🤖 ~ twilio.service.ts:20 ~ TwilioService ~ from:', from);
    const to = `+${lead.user.sessionId}`;
    console.log('🤖 ~ twilio.service.ts:23 ~ TwilioService ~ to:', to);
    const url = `https://${process.env.BOT_DOMAIN}/calls/outbound-call-twiml?lead=${lead.id}`;
    console.log('🤖 ~ twilio.service.ts:40 ~ TwilioService ~ url:', url);

    const call = await this.client.calls.create({
      from: from,
      to: to,
      url,
    });
    console.log('🤖 ~ twilio.service.ts:36 ~ TwilioService ~ call:', call);
    return { id: call.sid, to: call.to, from: call.from, status: call.status };
  }

  async sendSMS(
    to: string,
    message: string,
    from?: string
  ): Promise<{ id: string; to: string; from: string; status: string; body: string }> {
    const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER environment variable is required');
    }

    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    try {
      const sms = await this.client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedTo,
      });

      console.log('SMS sent successfully:', sms.sid);
      return {
        id: sms.sid,
        to: sms.to,
        from: sms.from,
        status: sms.status,
        body: sms.body
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}
