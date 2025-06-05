import { Lead } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { Vapi, VapiClient } from '@vapi-ai/server-sdk';
import { PhoneNumbersListResponseItem } from '@vapi-ai/server-sdk/api';
import { phone } from 'phone';

@Injectable()
export class VapiService {
  constructor() {}

  async callVapi(
    lead: Lead,
    assistantId: string,
    vapiToken: string,
    maxRetries: number,
    phone_number_id: string,
    assistantOverrides?: Vapi.AssistantOverrides,
  ): Promise<Vapi.Call> {
    console.log('🤖 ~ vapi.service.ts:18 ~ VapiService ~ vapiToken:', vapiToken);
    let phones: PhoneNumbersListResponseItem[] = [];
    if (process.env.VAPI_TEST_MODE && process.env.VAPI_TEST_MODE === 'true') {
      console.log('VAPI test mode enabled, skipping VAPI call');
      return;
    }
    const client = new VapiClient({ token: vapiToken });
    if (!phone_number_id) {
      console.log('No phone number ID provided, fetching available phone numbers');
      phones = await client.phoneNumbers.list();
      if (phones.length === 0) {
        throw new Error('No phone numbers available');
      }
    }
    const phoneNumber = `+${lead.user.sessionId}`;
    /* validate phone number */
    const { isValid } = phone(phoneNumber);
    if (!isValid) {
      console.log('Invalid lead phone number:', phoneNumber);
      throw new Error(`Invalid phone number: ${phoneNumber}`);
    }

    const callObject: Vapi.CreateCallDto = {
      assistantId: assistantId,
      customer: {
        name: lead.user.fullName,
        number: `+${lead.user.sessionId}`,
      },
      phoneNumberId: phone_number_id || phones[phones.length - 1].id,
      assistantOverrides: {
        ...assistantOverrides,
        metadata: {
          leadId: lead.id,
        },
      },
    };
    console.log('🚀 ~ VapiService ~ callObject:', callObject);
    // Create the VAPI call
    const vapiCall = await client.calls.create(callObject, {
      timeoutInSeconds: 60,
      maxRetries: 0,
    });

    return vapiCall;
  }

  /**
   * Retrieves the call details from the VAPI API.
   *
   * @param vapiToken - The token for authentication.
   * @param callId - The unique identifier of the call.
   * @returns The call details as a Vapi.Call object.
   */
  async getCallDetails(vapiToken: string, callId: string): Promise<Vapi.Call> {
    console.log('🤖 ~ vapi.service.ts:91 ~ VapiService ~ getCallDetails ~ callId:', callId);
    console.log('🤖 ~ vapi.service.ts:91 ~ VapiService ~ getCallDetails ~ vapiToken:', vapiToken);
    const client = new VapiClient({ token: vapiToken });
    try {
      // Assuming the SDK exposes a method like `get` to retrieve call details
      const callDetails = await client.calls.get(callId);
      return callDetails;
    } catch (error) {
      throw new Error(`Error retrieving call details for call ${callId}: ${error.message}`);
    }
  }

  async getAssistantDetails(vapiToken: string, assistantId: string): Promise<Vapi.Assistant> {
    const client = new VapiClient({ token: vapiToken });
    try {
      const assistantDetails = await client.assistants.get(assistantId);
      return assistantDetails;
    } catch (error) {
      throw new Error(
        `Error retrieving assistant details for assistant ${assistantId}: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves the list of call from the VAPI API.
   *
   * @param vapiToken - The token for authentication.
   * @param minDate - Min call updated date.
   * @returns The call details as a Vapi.Call object.
   */
  async getCallsList(vapiToken: string, minDate: string): Promise<Vapi.Call[]> {
    const client = new VapiClient({ token: vapiToken });
    try {
      // Assuming the SDK exposes a method like `list` to retrieve calls list
      const callsList = await client.calls.list({ updatedAtGt: minDate });
      return callsList;
    } catch (error) {
      throw new Error(`Error retrieving call list: ${error.message}`);
    }
  }

  /**
   * Retrieves the list of analytics data from the VAPI API.
   *
   * @param vapiToken - The token for authentication.
   * @param dto - Vapi.AnalyticsQueryDto.
   * @returns The analytics details as a Vapi.AnalyticsQueryResult object.
   */
  async getAnalytics(
    vapiToken: string,
    dto: Vapi.AnalyticsQueryDto,
  ): Promise<Vapi.AnalyticsQueryResult[]> {
    const client = new VapiClient({ token: vapiToken });
    try {
      // Assuming the SDK exposes a method like `get` to retrieve analytics list
      const analyticsResult = await client.analytics.get({ ...dto });
      return analyticsResult;
    } catch (error) {
      throw new Error(`Error retrieving analytics list: ${error.message}`);
    }
  }
}
