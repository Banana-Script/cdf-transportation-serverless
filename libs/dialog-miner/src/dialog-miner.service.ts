import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAiService } from 'OpenAI/open-ai';

export type BatchRequestDTO = {
  custom_id: string;
  body: any;
};

@Injectable()
export class DialogMinerService {
  private readonly STANDALONE_PROMPT = {
    structuredDataSchema: {
      type: 'object',
      properties: {
        detectedScenario: {
          type: 'string',
          enum: [
            'No answer (includes voicemail or text message)',
            'Answered but hung up before interaction',
            'Requested callback at another time',
            'Interested but needs more information',
            'Expressed doubts and requires clarification',
            'Busy and unable to talk',
            'Started interaction but did not complete desired action',
            'On a trial period and needs follow-up',
            'Postponed decision due to external reasons',
            'Provided ambiguous or inconclusive response',
          ],
          description: "The scenario detected based on the customer's response.",
        },
        interestLevel: {
          type: 'string',
          enum: ['Low', 'Medium', 'High'],
          description: "The customer's level of interest in the product or service.",
        },
        followUpReason: {
          type: 'string',
          description: 'The reason why a follow-up call is needed.',
        },
        customerProvidedDate: {
          type: 'string',
          description:
            'The exact date provided by the customer for a follow-up call (ISO 8601 format). If not provided, this field will be an empty string.',
        },
        suggestedFollowUpDatetime: {
          type: 'string',
          description:
            'The system-calculated recommended date and time for the next call, within business hours (ISO 8601 format).',
        },
        callOutcome: {
          type: 'string',
          enum: ['Successful', 'Unsuccessful', 'Pending'],
          description: 'The overall outcome of the call based on customer engagement.',
        },
        customerEngagementScore: {
          type: 'number',
          description: 'A numeric score (0-10) representing how engaged the customer was.',
        },
        requiresEscalation: {
          type: 'boolean',
          description: 'Whether the call needs escalation to a human agent.',
        },
      },
      required: ['currentDatetime', 'callOutcome'],
    },
  };

  constructor(public openAiService: OpenAiService) {}

  /**
   * Extracts structured data from a simplified conversation payload using OpenAI's chat model.
   * @param conversation A simplified payload representing the conversation (e.g., messagesOpenAIFormatted).
   * @returns The structured data extracted from the conversation.
   */
  async extractStructuredData(transcriptions: BatchRequestDTO[]): Promise<any> {
    // Replace the placeholder with the current datetime
    const now = new Date().toISOString();

    const promptText = `Analyze the call transcript and extract structured data based on the conversation.
    
Return only a valid JSON object that adheres exactly to the following JSON schema (do not include any extra text, markdown, or code fences):
${JSON.stringify(this.STANDALONE_PROMPT.structuredDataSchema, null, 2)}
    
The current date and time is ${now}.
    
Optimize the suggested follow-up time based on the following criteria:
- If the customer explicitly provides a callback time, use that exact value.
- If no specific time is mentioned, determine the ideal follow-up time dynamically:
   - High Interest: Follow up within 1 to 6 hours.
   - Medium Interest: Follow up within 24 to 48 hours.
   - Low Interest: Follow up in 3 to 7 days.
Use sales best practices for call timing (e.g., 10 AM - 12 PM or 4 PM - 6 PM).
Ensure the suggested time is within reasonable business hours (e.g., 8 AM - 8 PM local time).
If previous successful call times exist for this customer, prioritize those hours.`;

    // Build a JSONL string with one request per transcription
    const batchRequests = transcriptions.map((transcription: BatchRequestDTO) => {
      return JSON.stringify({
        custom_id: transcription.custom_id,
        method: 'POST',
        url: '/v1/chat/completions',
        body: {
          model: process.env.GPT_MODEL,
          messages: [
            { role: 'system', content: promptText },
            { role: 'user', content: transcription.body },
          ],
          temperature: 0,
        },
      });
    });

    const jsonlString = batchRequests.join('\n');

    // Submit the batch job using OpenAiService's batchComplete method
    const batchResponse = await this.openAiService.batchComplete(jsonlString);
    return batchResponse;
  }

  async getBatchFile(fileId: string): Promise<string> {
    return this.openAiService.getBatchFile(fileId);
  }

  async getBatch(batchId: string): Promise<OpenAI.Batches.Batch> {
    return this.openAiService.getBatch(batchId);
  }
}
